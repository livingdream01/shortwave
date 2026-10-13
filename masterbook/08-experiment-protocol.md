# Experiment Protocol

**Goal:** discover, empirically, which formats/hooks/lengths/voices/caption styles
hold a global English-speaking audience — and keep feeding winners.

## Arm space
`format (5) × hook (5) × length (3) × voice (3) × caption (3) = 675` arms
(`lib/experiments/arms.ts`). Arm key: `format|hook|length|voice|caption`.

## Allocation — Thompson sampling
Each arm holds a Beta posterior `(α, β)` starting at `(1, 1)` (uniform).
`chooseArm()` samples each posterior and picks the max; the winner's arm is used
for the next episode. After publishing, `update(posterior, reward)` folds the
observed reward in (`lib/experiments/bandit.ts`).

### Reward function
```
reward = 0.40·retention3s
       + 0.25·avgWatchPct
       + 0.15·completion
       + 0.15·min(1, shareRate·10)
       + 0.05·min(1, saveRate·10)
```
Shares are weighted heavily because they are the strongest distribution signal.

## Measurement
Pull Instagram insights at **24h / 48h / 72h** per post → `metrics` row. Fields:
reach, plays, retention_3s, avg_watch_pct, completion, likes, comments, saves,
shares, follows, clicks.

## Hygiene
1. **One variable at a time when learning; explore freely when cold.** At cold
   start (uniform priors) the bandit naturally explores all five formats.
2. **Minimum sample.** Don't trust an arm below ~5 posts; the prior still dominates.
3. **External shocks.** A platform-wide reach change contaminates all arms — note
   it in `11-decisions-log.md` and pause interpretation.
4. **Test account first.** Run experiments against the test account / trial reels;
   promote winners to the main account.
5. **Log every decision.** Tunings to the reward weights are ADRs.

## Weekly review
- Winning arm per format (α/β means in `/experiments`).
- Retention curve per hook type.
- Affiliate clicks per arm.
- Retire arms with `β − α > 3·(α+β)/n` underperformance.
