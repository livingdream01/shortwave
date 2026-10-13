# Layout & Content Guidelines

## Canvas
| Property | Value |
|---|---|
| Resolution | **1080 × 1920** (9:16) |
| Codec | H.264 (MP4) |
| Frame rate | 30 fps |
| Max length | 90s (sweet spot 20–45s) |
| Audio | −14 LUFS integrated (platform-normalised) |

## Safe zones (Instagram Reels UI)
```
┌───────────────────────────┐ 0
│                           │
│   TOP SAFE  ── 220 px     │ ← keep clear of caption bar / profile
│                           │
│   HOOK TEXT  ── upper ⅓   │ ← first 3s, big, high contrast
│                           │
│   CAPTION    ── ~66% H    │ ← burnt-in subtitles, ≤2 lines
│                           │
│   BOTTOM SAFE ── 420 px   │ ← keep clear of CTA buttons & 音轨
└───────────────────────────┘ 1920
```
- **Hook:** top ~220px reserved; hook sits in the upper third, 2 lines max.
- **Captions:** centred at ~66% height (inside `remotion/ReelVideo.tsx`).
- **Bottom 420px:** never place essential text — it is covered by like/comment/
  share buttons and the caption handle.
- **Logo/brand:** small, top-safe. **CTA:** spoken, plus a line that sits *above*
  the bottom 420px.

## Captions
- Max **18 characters per line**, **2 lines** (`wrapCaption`). CJK wraps per
  character; Latin wraps per word.
- Bold, high contrast, subtle backdrop blur. Never rely on audio alone.
- **Bilingual:** English narration + Simplified-Chinese burned-in captions
  (`series.captions = ["en","zh"]`).

## Hook rules (first 3 seconds)
- State the conflict immediately — no intros, no logos before the hook.
- Use a curiosity gap ("Nobody warned {name}…"), POV, shock, or countdown.
- One idea per hook. Say the payoff is coming without giving it away.

## Series structure
`hook → setup → spark → escalation → cliffhanger + soft CTA`. Keep a recurring
cast (Character Bible) so viewers return for *the characters*, not just the plot.

## Policy — mandatory
1. **Original IP only.** No adaptations of copyrighted works; public-domain
   folklore/myth is fine when *reinterpreted originally*.
2. **No real-person likeness.** Content is stylized, never photoreal humans.
3. **AI disclosure.** Always publish with `is_ai_generated = true` and a caption
   note ("AI-generated"). Meta requires it; hiding it risks enforcement.
4. **No gore / sexual content / hate / harassment / self-harm promotion.**
5. **No medical / financial / safety misinformation.**

## Accessibility
- Contrast ratio ≥ 4.5:1 for caption text.
- Don't flash more than 3 times/second.
- Provide captions even when narration is clear.
