import type { Arm, Format, HookStyle, CaptionStyle, LengthBucket, VoiceStyle } from "../types";
import { ALL_FORMATS } from "../agent/niches";

export const HOOKS: HookStyle[] = ["question", "shock", "cold_open", "pov", "countdown"];
export const LENGTHS: LengthBucket[] = ["short", "medium", "long"];
export const VOICES: VoiceStyle[] = ["narrator", "character", "duet"];
export const CAPTIONS: CaptionStyle[] = ["karaoke", "pop", "minimal"];

export function armKey(arm: Arm): string {
  return [arm.format, arm.hook, arm.length, arm.voice, arm.caption].join("|");
}

export function parseArmKey(key: string): Arm {
  const [format, hook, length, voice, caption] = key.split("|");
  if (!format || !hook || !length || !voice || !caption) {
    throw new Error(`Malformed arm key: ${key}`);
  }
  return {
    format: format as Format,
    hook: hook as HookStyle,
    length: length as LengthBucket,
    voice: voice as VoiceStyle,
    caption: caption as CaptionStyle,
  };
}

/** Full cross-product arm space. */
export function allArms(): Arm[] {
  const arms: Arm[] = [];
  for (const format of ALL_FORMATS) {
    for (const hook of HOOKS) {
      for (const length of LENGTHS) {
        for (const voice of VOICES) {
          for (const caption of CAPTIONS) {
            arms.push({ format, hook, length, voice, caption });
          }
        }
      }
    }
  }
  return arms;
}

export function allArmKeys(): string[] {
  return allArms().map(armKey);
}
