# Format Library

Five formats ship live from day one; the bandit allocates across them. Definitions
live in `lib/agent/niches.ts` (playbooks are injected into writer/critic prompts).

| Arm | Premise | Tone | Why it wins |
|---|---|---|---|
| `pet_soap` | Anthropomorphic pets in an apartment building, serialized drama | warm, comedic | cheapest to render, cutest, zero likeness risk, highly shareable |
| `school_gossip` | Stylized students navigate rumor, rivalry, secret crushes | chatty, dramatic | relatable hooks; "which side are you on?" drives comments |
| `mythology` | Public-domain myth/folklore, originally reinterpreted | epic, mysterious | IP-safe; evergreen search demand |
| `micro_horror` | A normal moment that goes very wrong; atmospheric, not gory | eerie, tense | strongest retention curve in short-form |
| `heist` | A slick crew pulls a miniature heist; the plan goes sideways | slick, neo-noir | product-placeable props → affiliate tie-ins |

## Series engine
- Each format defines a **cast** for the Character Bible; `appearancePrompt` is held
  identical across episodes so the on-screen cast stays consistent.
- Episode structure: `hook → setup → spark → escalation → cliffhanger + CTA`.
- Example titles per format are in the playbook and seed the writer.

## Choosing a launch format
The bandit starts with a uniform prior, so day-one output explores all five. Watch
`/experiments` — after ~5 posts per arm the posterior means separate.

## Adding a format
1. Add a key to `Format` in `lib/types.ts`.
2. Add a `FormatPlaybook` entry in `lib/agent/niches.ts` (premise, cast, hook
   patterns, beats, visual style, CTA).
3. It is automatically included in `ALL_FORMATS` → the arm space grows.
