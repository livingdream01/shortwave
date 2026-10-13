import path from "node:path";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import type { AgentStep } from "./types";
import type { Posterior } from "./experiments/bandit";

export interface RunRecord {
  id: string;
  title: string;
  hook: string;
  format: string;
  status: string;
  score?: number;
  steps: AgentStep[];
  renderPath?: string;
  createdAt: string;
}

export interface State {
  runs: RunRecord[];
  posteriors: Record<string, Posterior>;
}

const STATE_PATH = path.resolve("out/state.json");

export async function readState(): Promise<State> {
  try {
    const raw = await readFile(STATE_PATH, "utf8");
    return JSON.parse(raw) as State;
  } catch {
    return { runs: [], posteriors: {} };
  }
}

async function writeState(state: State): Promise<void> {
  await mkdir(path.dirname(STATE_PATH), { recursive: true });
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2), "utf8");
}

export async function appendRun(record: RunRecord): Promise<void> {
  const state = await readState();
  state.runs = [record, ...state.runs].slice(0, 200);
  await writeState(state);
}

export async function setPosterior(key: string, posterior: Posterior): Promise<void> {
  const state = await readState();
  state.posteriors[key] = posterior;
  await writeState(state);
}
