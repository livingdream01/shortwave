import { readState } from "../../lib/store";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = {
  done: "text-emerald-400",
  rejected: "text-amber-400",
  failed: "text-red-400",
  running: "text-sky-400",
  pending: "text-neutral-400",
};

export default async function MissionControl() {
  const state = await readState();
  const latest = state.runs[0];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mission Control</h1>
      <p className="text-[var(--muted)]">
        Live agent-run trace — every hop with model and token usage.
      </p>

      {!latest ? (
        <div className="card p-6 text-[var(--muted)]">No runs recorded yet.</div>
      ) : (
        <div className="card p-6">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-xl font-bold">{latest.title}</h2>
            <span className="pill">{latest.status}</span>
          </div>
          <ol className="space-y-4">
            {latest.steps.map((s, i) => (
              <li key={i} className="flex gap-4">
                <div className="w-6 text-right text-sm text-[var(--muted)]">
                  {i + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold uppercase tracking-wide">
                      {s.name}
                    </span>
                    <span className={`text-xs ${STATUS_COLOR[s.status] ?? ""}`}>
                      {s.status}
                    </span>
                    <span className="pill">{s.model}</span>
                    <span className="text-xs text-[var(--muted)]">
                      {s.tokens} tok · ${s.costUsd.toFixed(4)}
                    </span>
                  </div>
                  <p className="mt-1 max-w-3xl truncate text-xs text-[var(--muted)]">
                    {s.output}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
