# Monetization & Partner Programs

**Strategy: affiliate-first.** Affiliate income needs no follower threshold, so it
can start on day one — whereas creator-payout funds are gated by growth and region.

## A. Affiliate programs (the "partner harness")
Configs live in `lib/monetize/programs.ts`; links are built and injected by
`lib/monetize/links.ts`.

| Program | Commission | Key rules |
|---|---|---|
| **FacelessReels** (`facelessreels.tolt.io`) | recurring | **organic promotion only — no paid ads**; no self-referral; FTC disclosure |
| **OpenArt** | recurring on referred subscribers | organic only |
| **Oakgen** | 25% for 6 months | 30-day cookie; $10 payout min |

> **OpenGen.ai has no affiliate program** (verified — `/affiliate` 404s). It is a
> model aggregator, not a partner. Don't plan around it.

**Rules we obey globally:**
- **No paid ads** promoting affiliate links (several programs ban this outright).
- **No self-referral** (`allowSelfReferral: false` in the registry).
- **FTC disclosure** — `injectCaption()` appends *"Affiliate links — I may earn a
  commission."* whenever a link is present.

**Where links live:** bio link, pinned first comment, and the caption (via
`injectCaption`). Each link is UTM-tagged (`utm_source=shortwave`) with an optional
`ref` id, so clicks are attributable.

**Product-tie-in formats:** the `heist` format is written to place props/gear, so
Amazon Associates / TikTok Shop links can be attached naturally.

## B. Creator-payout programs (phase 2 — gated)
| Program | Threshold (approx.) | Note |
|---|---|---|
| YouTube Shorts (YPP) | 1k subs **+** 10M Shorts views / 90d | eligible from HK |
| TikTok Creator Rewards | ~10k followers, 100k views / 30d | **requires ≥1-minute videos** — a length arm to test; verify HK eligibility |
| Instagram | bonuses / brand deals | mostly invite-based; brand deals are the real prize |

Track eligibility in `metrics` + `experiments`; the bandit will surface a
long-form (≥60s) arm once a platform signal is available.

## C. Own program (later)
Shortwave's own affiliate program (the Reeloso SaaS model) once the tool is proven.

## Reporting
Every post stores its affiliate links (`posts.affiliate_links`) and click counts
(`metrics.clicks`) so income is attributable per arm and per program.
