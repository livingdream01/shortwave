export interface Posterior {
  alpha: number; // successes + 1 (Beta prior)
  beta: number; // failures + 1
}

export type Rng = () => number;

/** Default RNG. */
const defaultRng: Rng = Math.random;

function normal(rng: Rng): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Marsaglia–Tsang gamma sampler. */
function gamma(k: number, rng: Rng): number {
  if (k < 1) {
    return gamma(k + 1, rng) * Math.pow(rng() || 1e-9, 1 / k);
  }
  const d = k - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number;
    let v: number;
    do {
      x = normal(rng);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = rng() || 1e-9;
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

/** Sample from Beta(alpha, beta). */
export function betaSample(alpha: number, beta: number, rng: Rng = defaultRng): number {
  const g1 = gamma(Math.max(alpha, 1e-9), rng);
  const g2 = gamma(Math.max(beta, 1e-9), rng);
  return g1 / (g1 + g2);
}

/** Fold an observed reward (0..1) back into a posterior. */
export function update(p: Posterior, reward: number): Posterior {
  const r = Math.min(1, Math.max(0, reward));
  return { alpha: p.alpha + r, beta: p.beta + (1 - r) };
}

/** Thompson sampling: pick the arm with the highest sampled value. */
export function chooseArm(
  posteriors: Record<string, Posterior>,
  rng: Rng = defaultRng,
): string {
  const keys = Object.keys(posteriors);
  if (keys.length === 0) throw new Error("chooseArm: no arms provided");
  let best = keys[0]!;
  let bestSample = -Infinity;
  for (const key of keys) {
    const p = posteriors[key]!;
    const sample = betaSample(p.alpha, p.beta, rng);
    if (sample > bestSample) {
      bestSample = sample;
      best = key;
    }
  }
  return best;
}

/** Reward from a metric snapshot — weighted toward retention + shares. */
export function reward(snapshot: {
  retention3s: number;
  avgWatchPct: number;
  completion: number;
  shares: number;
  saves: number;
  plays: number;
}): number {
  const plays = Math.max(snapshot.plays, 1);
  const shareRate = Math.min(1, snapshot.shares / plays);
  const saveRate = Math.min(1, snapshot.saves / plays);
  const raw =
    0.4 * clamp01(snapshot.retention3s) +
    0.25 * clamp01(snapshot.avgWatchPct) +
    0.15 * clamp01(snapshot.completion) +
    0.15 * Math.min(1, shareRate * 10) +
    0.05 * Math.min(1, saveRate * 10);
  return clamp01(raw);
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
