export interface CaptionLine {
  text: string;
}

export interface Cue {
  text: string;
  start: number;
  end: number;
}

/** Wrap text to lines. CJK wraps per character; Latin wraps per word.
 *  Guarantees at most `maxLines` lines: if the natural wrap overflows,
 *  it re-wraps at an even width so the block still fits the frame
 *  (Review Focus #4). */
export function wrapCaption(
  text: string,
  maxCharsPerLine = 18,
  maxLines = 2,
): string[] {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return [];
  const hasSpaces = clean.includes(" ");

  const wrapAt = (width: number): string[] => {
    const tokens = hasSpaces ? clean.split(" ") : [...clean];
    const lines: string[] = [];
    let current = "";
    for (const token of tokens) {
      const candidate = current
        ? hasSpaces
          ? `${current} ${token}`
          : current + token
        : token;
      if (candidate.length <= width || current === "") {
        current = candidate;
      } else {
        lines.push(current);
        current = token;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  let lines = wrapAt(maxCharsPerLine);
  if (lines.length <= maxLines) return lines;
  const width = Math.max(maxCharsPerLine, Math.ceil(clean.length / maxLines));
  lines = wrapAt(width);
  return lines.slice(0, maxLines);
}

/** Split a script into timed cues proportional to character length. */
export function chunkCues(
  script: string,
  totalSec: number,
  maxCharsPerLine = 18,
): Cue[] {
  const sentences = script
    .split(/(?<=[.!?。！？])\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return [];

  const totalChars = sentences.reduce((n, s) => n + s.length, 0);
  let t = 0;
  return sentences.map((sentence) => {
    const dur = (sentence.length / totalChars) * totalSec;
    const cue: Cue = {
      text: wrapCaption(sentence, maxCharsPerLine, 2).join(" "),
      start: round(t),
      end: round(t + dur),
    };
    t += dur;
    return cue;
  });
}

const round = (n: number) => Math.round(n * 1000) / 1000;
