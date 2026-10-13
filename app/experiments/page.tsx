import { readState } from "../../lib/store";
import { ALL_FORMATS, formatPlaybook } from "../../lib/agent/niches";
import { PROGRAMS } from "../../lib/monetize/programs";

export const dynamic = "force-dynamic";

export default async function Experiments() {
  const state = await readState();
  const posteriors = state.posteriors;
  const keys = Object.keys(posteriors);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Experiments</h1>
        <p className="text-[var(--muted)]">
          Thompson-sampling bandit over format × hook × length × voice ×
          caption style. Arms with a higher alpha are winning.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Arm posteriors</h2>
        {keys.length === 0 ? (
          <div className="card p-6 text-[var(--muted)]">
            No feedback yet — posteriors start uniform at α=1, β=1.
          </div>
        ) : (
          <div className="space-y-2">
            {keys.slice(0, 20).map((k) => {
              const p = posteriors[k]!;
              const mean = p.alpha / (p.alpha + p.beta);
              return (
                <div key={k} className="card flex items-center gap-4 p-3 text-sm">
                  <span className="flex-1 truncate font-mono">{k}</span>
                  <span>α {p.alpha.toFixed(1)}</span>
                  <span>β {p.beta.toFixed(1)}</span>
                  <span className="w-24">
                    <span className="block h-2 rounded bg-white/10">
                      <span
                        className="block h-2 rounded bg-[var(--accent)]"
                        style={{ width: `${Math.round(mean * 100)}%` }}
                      />
                    </span>
                  </span>
                  <span className="w-12 text-right">{(mean * 100).toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Formats in rotation</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {ALL_FORMATS.map((f) => (
            <div key={f} className="card p-4">
              <div className="flex justify-between">
                <span className="font-bold">{formatPlaybook(f).title}</span>
                <span className="pill">{f}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Affiliate programs</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {PROGRAMS.map((p) => (
            <div key={p.id} className="card p-4 text-sm">
              <div className="font-bold">{p.name}</div>
              <div className="text-[var(--muted)]">{p.commission}</div>
              <ul className="mt-2 list-disc pl-4 text-xs text-[var(--muted)]">
                {p.rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
