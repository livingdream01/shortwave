import Link from "next/link";
import { ALL_FORMATS, formatPlaybook } from "../lib/agent/niches";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="pill inline-block">autonomous · bilingual EN/中文 · IG-first</p>
        <h1 className="text-4xl font-extrabold leading-tight">
          An AI drama studio that writes, renders, posts and learns.
        </h1>
        <p className="max-w-2xl text-[var(--muted)]">
          Shortwave runs an agent loop — scout → write → critique → generate →
          assemble → publish → measure — producing original, serialized
          short-form drama and auto-posting it to Instagram. It experiments
          across formats and attaches affiliate monetization.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard"
            className="rounded-full bg-[var(--accent)] px-5 py-2 font-semibold text-black"
          >
            Open dashboard
          </Link>
          <Link
            href="/mission-control"
            className="rounded-full border border-white/15 px-5 py-2"
          >
            Mission Control
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Five formats, live from day one</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {ALL_FORMATS.map((f) => {
            const p = formatPlaybook(f);
            return (
              <div key={f} className="card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{p.title}</h3>
                  <span className="pill">{f}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{p.premise}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3 text-sm">
        <div className="card p-5">
          <h3 className="font-bold">Publish</h3>
          <p className="text-[var(--muted)]">
            Instagram Content Publishing API — container → poll → publish, with
            AI disclosure.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-bold">Experiment</h3>
          <p className="text-[var(--muted)]">
            Thompson-sampling bandit over format × hook × length × voice ×
            caption style.
          </p>
        </div>
        <div className="card p-5">
          <h3 className="font-bold">Monetize</h3>
          <p className="text-[var(--muted)]">
            Affiliate link registry with UTM tracking and required disclosure.
          </p>
        </div>
      </section>
    </div>
  );
}
