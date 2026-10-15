#!/usr/bin/env node
/**
 * Shortwave MCP server.
 *
 * Exposes the studio as tools any MCP client (Claude Desktop, Claude Code, …) can
 * call — parity with the Higgsfield plugin, but open and self-hosted.
 *
 * Transport is stdio, so NOTHING may be written to stdout except protocol frames.
 * The pipeline logs to stdout, so we capture console.log during a run and return
 * it as the tool result.
 *
 *   npm run mcp
 *
 * Claude Desktop config (claude_desktop_config.json):
 *   { "mcpServers": { "shortwave": {
 *       "command": "npx", "args": ["tsx", "/path/to/shortwave/mcp/server.ts"] } } }
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ALL_FORMATS } from "../lib/agent/niches";
import { buildHealth } from "../lib/health";
import { runOnce } from "../worker/index";

const server = new McpServer({ name: "shortwave", version: "0.1.0" });

/** Run fn while capturing console.log output (keeps stdout clean for stdio MCP). */
async function capture(fn: () => Promise<void>): Promise<string> {
  const lines: string[] = [];
  const original = console.log;
  console.log = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
  };
  try {
    await fn();
  } finally {
    console.log = original;
  }
  return lines.join("\n");
}

server.tool(
  "shortwave_health",
  "Report studio health: Supabase reachability, Instagram token expiry, last publish, and open issues.",
  {},
  async () => {
    const report = await buildHealth();
    return { content: [{ type: "text", text: JSON.stringify(report, null, 2) }] };
  },
);

server.tool(
  "shortwave_list_formats",
  "List the drama formats available to generate.",
  {},
  async () => ({
    content: [{ type: "text", text: ALL_FORMATS.join("\n") }],
  }),
);

server.tool(
  "shortwave_generate",
  "Generate one drama reel. Set publish=true to also post it to the connected Instagram (trial reel).",
  {
    format: z.enum(ALL_FORMATS as [string, ...string[]]).optional(),
    publish: z.boolean().optional(),
    name: z.string().optional(),
  },
  async ({ format, publish, name }) => {
    const argv: string[] = [];
    if (format) argv.push(`--format=${format}`);
    if (name) argv.push(`--name=${name}`);
    if (publish) argv.push("--publish");
    const out = await capture(() => runOnce(argv));
    return { content: [{ type: "text", text: out || "done" }] };
  },
);

server.tool(
  "shortwave_connect",
  "Explain how to connect an Instagram account and where to sign in.",
  {},
  async () => ({
    content: [
      {
        type: "text",
        text:
          "Open http://localhost:3040/connections, sign in with the operator email " +
          "(magic link is read from Mailpit at http://127.0.0.1:54324 in local dev), " +
          "then click Connect Instagram. Tokens are encrypted at rest.",
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("shortwave MCP server running on stdio");
