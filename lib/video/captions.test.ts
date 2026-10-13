import { describe, it, expect } from "vitest";
import { wrapCaption, chunkCues } from "./captions";

describe("wrapCaption (Review Focus #4)", () => {
  it("wraps CJK without spaces to at most 2 lines", () => {
    const text = "這是一個非常長的句子需要被正確地換行處理並且絕對不能超過兩行以上";
    const lines = wrapCaption(text, 18, 2);
    expect(lines.length).toBeLessThanOrEqual(2);
    expect(lines.join("")).toBe(text);
  });

  it("wraps long English to at most 2 lines", () => {
    const text =
      "Nobody warned Mochi that the new neighbour would turn the whole building upside down";
    const lines = wrapCaption(text, 18, 2);
    expect(lines.length).toBeLessThanOrEqual(2);
  });

  it("keeps a short single line intact", () => {
    expect(wrapCaption("Day one", 18, 2)).toEqual(["Day one"]);
  });
});

describe("chunkCues", () => {
  it("produces cues that span roughly the total duration", () => {
    const cues = chunkCues("One. Two. Three.", 9, 18);
    expect(cues).toHaveLength(3);
    expect(cues[0]!.start).toBe(0);
    expect(cues.at(-1)!.end).toBeCloseTo(9, 1);
  });

  it("returns [] for empty input", () => {
    expect(chunkCues("", 5)).toEqual([]);
  });
});
