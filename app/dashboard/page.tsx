import { readState } from "../../lib/store";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const state = await readState();
  const runs = state.runs;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-[var(--muted)]">
        Content queue — every produced episode, newest first.
      </p>

      {runs.length === 0 ? (
        <div className="card p-6 text-[var(--muted)]">
          No runs yet. Generate one with{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">
            npm run worker -- --demo
          </code>
          .
        </div>
      ) : (
        <div className="space-y-3">
          {runs.map((r) => (
            <div key={r.id} className="card flex items-center justify-between p-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{r.title}</h3>
                  <span className="pill">{r.format}</span>
                  <span className="pill">{r.status}</span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">{r.hook}</p>
                {r.renderPath ? (
                  <p className="mt-1 text-xs text-[var(--muted)]">{r.renderPath}</p>
                ) : null}
              </div>
              {typeof r.score === "number" ? (
                <div className="text-right">
                  <div className="text-2xl font-bold">{r.score}</div>
                  <div className="text-xs text-[var(--muted)]">score</div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
