# Hook Library

The hook is the first 0–3 seconds. It decides whether everything else is seen.
Hook styles are an experiment axis (`HookStyle` in `lib/types.ts`).

| Style | Shape | Example |
|---|---|---|
| `question` | pose a question the viewer can't answer | "Who locked the door?" |
| `shock` | state the impossible plainly | "She got a text from her own number." |
| `cold_open` | drop into the middle of action | "—and that's when the lights went out." |
| `pov` | put the viewer in the scene | "POV: you just heard what Mochi did." |
| `countdown` | create a ticking clock | "90 seconds to pull the perfect crime…" |

## Rules
1. **Conflict in the first sentence.** No greeting, no logo-first, no context.
2. **Curiosity gap.** Promise a payoff; don't give it away in the hook.
3. **One idea.** Two hooks = no hook.
4. **Name the stakes.** "{name}" + a consequence.
5. **Match the format.** Pet soap = warm/funny; micro-horror = unease; heist = slick.

## Per-format patterns
- **Pet soap:** "Nobody warned {name} about…", "It started as a normal Tuesday for {name}."
- **School gossip:** "Everyone thinks {name} is {x} — they're wrong."
- **Mythology:** "The gods made one mistake. It cost them everything."
- **Micro-horror:** "The apartment was empty. So who locked the door?"
- **Heist:** "The vault had one flaw — and {name} found it."

## Testing
Each hook style is an arm dimension. After ~5 posts per style, compare `retention3s`
in `/experiments` and let the bandit weight the winner.

## CTA (ends, not opens)
Soft, return-driven: "Follow for tomorrow's episode.", "Which side are you on?",
"Would you have made it? Part 2 tomorrow." — never a hard sell.
