# Agent Roles & Ownership (no duplicated work)

**Rule: every role owns exactly one artifact and performs exactly one task.**
No two roles share an artifact or a verb, so the same job is never done twice.
The roster lives in code at `lib/agent/roles.ts`; `lib/agent/roles.test.ts`
enforces the invariant (unique owners, unique tasks, unique keys).

## Roster

| Role | Kind | The single task it does | Owns (unique artifact) | Consumes | Produces |
|---|---|---|---|---|---|
| Trend Scout | reasoning | scan current trends for the format | **trend brief** | series + playbook | angles · sounds · keywords |
| Character Bible | service | maintain cast continuity | **cast canon** | series + playbook | consistent `Character[]` |
| Writer | reasoning | author the episode | **episode script** | trend brief + cast canon | hook · script · shot prompts |
| Critic | reasoning | judge virality + policy | **verdict** | the draft | score · violations |
| Storyboard | service | derive the timed shot list | **shot list** | script + shots | timed shots + captions |
| Director | service | route each shot to a provider/model | **provider plan** | shot list | per-shot provider + model |
| Translator | reasoning | localize captions | **caption translation** | EN captions | zh captions |
| Renderer | service | assemble the 9:16 reel | **MP4 artifact** | props + clips | 1080×1920 H.264 MP4 |
| Publisher | service | post to the platform | **published post** | MP4 + caption | external id |
| Analyst | service | pull insights | **metrics** | post id | MetricSnapshot @24/48/72h |
| Bandit | service | allocate the next arm | **arm allocation** | rewards | next arm + posteriors |

**Reasoning agents (4):** Scout, Writer, Critic, Translator — the only roles that
call an LLM and consume tokens. **Services (7):** deterministic code.

## The anti-duplication guarantee
- One author. Only the **Writer** writes creative copy; every other role consumes
  its output. No second role "also writes".
- One judge. Only the **Critic** scores/gates. It never rewrites (a rewrite
  re-invokes the Writer — logged as a new `write` step in the critic loop).
- One owner per artifact. `character-bible` owns the cast, `storyboard` owns the
  shot list, `director` owns routing, `renderer` owns the file, `publisher` owns
  the post, `analyst` owns metrics, `bandit` owns allocation.

## How this shows up in the trace
A run logs one step per role that actually runs, e.g.:
`scout → character-bible → write → critique → storyboard → director`.

Because each step has a different name and a different output, the Mission
Control trace reads as a sequence of **distinct** jobs, never the same job
repeated by different agents. The only intentional repeat is the Writer being
re-invoked by the Critic loop (capped at 3), which is a *revision*, not a second
agent doing the same thing.

## Changing the roster
1. Add/edit a role in `lib/agent/roles.ts` (unique `owns` + `task`).
2. `roles.test.ts` will fail if the invariant is broken.
3. Wire the stage into `lib/agent/pipeline.ts` (or `run.ts` for post-pipeline
   stages) and record it as a step.
