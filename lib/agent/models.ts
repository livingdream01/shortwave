import { config } from "../config";
import { postJson } from "../http";

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmResult {
  text: string;
  tokens: number;
  costUsd: number;
}

export interface Llm {
  chat(
    model: string,
    messages: LlmMessage[],
    opts?: { json?: boolean; temperature?: number },
  ): Promise<LlmResult>;
}

/** USD per 1M tokens (approx., DeepSeek). */
const PRICE: Record<string, { in: number; out: number }> = {
  "deepseek-chat": { in: 0.27, out: 1.1 },
  "deepseek-reasoner": { in: 0.55, out: 2.19 },
};

function priceFor(model: string) {
  return PRICE[model] ?? { in: 0.27, out: 1.1 };
}

interface ChatCompletion {
  choices: { message: { content: string } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

export interface DeepseekOptions {
  fetchImpl?: typeof fetch;
  apiKey?: string;
  baseUrl?: string;
}

export function deepseek(opts: DeepseekOptions = {}): Llm {
  return {
    async chat(model, messages, chatOpts = {}) {
      const key = opts.apiKey ?? config.deepseek.apiKey;
      const baseUrl = opts.baseUrl ?? config.deepseek.baseUrl;
      if (!key) throw new Error("DEEPSEEK_API_KEY is not set");
      const body: Record<string, unknown> = {
        model,
        messages,
        temperature: chatOpts.temperature ?? 0.9,
      };
      if (chatOpts.json) body.response_format = { type: "json_object" };

      const data = await postJson<ChatCompletion>(
        `${baseUrl}/chat/completions`,
        body,
        { headers: { Authorization: `Bearer ${key}` }, fetchImpl: opts.fetchImpl },
      );

      const text = data.choices?.[0]?.message?.content ?? "";
      const prompt = data.usage?.prompt_tokens ?? 0;
      const completion = data.usage?.completion_tokens ?? 0;
      const p = priceFor(model);
      const costUsd = (prompt * p.in + completion * p.out) / 1_000_000;
      return { text, tokens: prompt + completion, costUsd };
    },
  };
}

/** Extract a JSON object from a model reply, tolerating ```json fences. */
export function parseJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced?.[1] ?? text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error(`No JSON object found in model reply: ${text.slice(0, 200)}`);
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
