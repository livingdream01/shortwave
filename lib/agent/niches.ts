import type { Format } from "../types";

export interface FormatPlaybook {
  key: Format;
  title: string;
  premise: string;
  tone: string;
  cast: { name: string; role: string }[];
  hookPatterns: string[];
  visualStyle: string;
  beats: string[];
  exampleTitles: string[];
  cta: string;
}

export const FORMATS: Record<Format, FormatPlaybook> = {
  pet_soap: {
    key: "pet_soap",
    title: "Pet Micro-Soap",
    premise:
      "Anthropomorphic pets in a cozy apartment building live a serialized soap opera of tiny dramas.",
    tone: "warm, comedic, wholesome",
    cast: [
      { name: "Mochi", role: "dramatic cat, the gossip ringleader" },
      { name: "Biscuit", role: "loyal golden retriever, the loyal one" },
      { name: "Pixel", role: "sardonic parrot, drops the truth bombs" },
    ],
    hookPatterns: [
      "Nobody warned {name} about what happened next…",
      "POV: your {pet} finds out {secret}",
      "It started as a normal Tuesday for {name}.",
      "Wait for the twist at the end. —",
    ],
    visualStyle: "stylized 3D animation, soft cinematic lighting, cozy palette",
    beats: [
      "0-3s hook that states the conflict",
      "setup: normalcy",
      "spark: the inciting secret",
      "escalation: the reaction",
      "cliffhanger + soft CTA",
    ],
    exampleTitles: ["The Secret in Apartment 4B", "Biscuit's Bad Day", "Pixel Knows Too Much"],
    cta: "Follow for tomorrow's episode.",
  },
  school_gossip: {
    key: "school_gossip",
    title: "School / Workplace Gossip Drama",
    premise:
      "Relatable stylized characters navigating rumor, rivalry and secret crushes.",
    tone: "chatty, dramatic, relatable",
    cast: [
      { name: "Mia", role: "the new student with a secret" },
      { name: "Jordan", role: "the popular one hiding an insecurity" },
    ],
    hookPatterns: [
      "Everyone at school thinks {name} is {x} — they're wrong.",
      "The rumor about {name} spread in one day.",
      "POV: you just heard what {name} did.",
    ],
    visualStyle:
      "stylized 3D, bright corridor lighting, expressive but non-photoreal faces",
    beats: [
      "0-3s hook states the rumor",
      "the whisper spreads",
      "a confrontation",
      "a reveal",
      "cliffhanger + CTA",
    ],
    exampleTitles: ["The Note Everyone Saw", "Locker 213", "The Group Chat Leak"],
    cta: "Which side are you on? Comment below.",
  },
  mythology: {
    key: "mythology",
    title: "Mythology / Folklore Retold",
    premise:
      "Public-domain myth and folklore retold as a fast, cinematic micro-episode. Original interpretation only — no copyrighted adaptations.",
    tone: "epic, mysterious, awe",
    cast: [
      { name: "Narrator", role: "the fireside storyteller" },
    ],
    hookPatterns: [
      "The gods made one mistake. It cost them everything.",
      "This myth was almost erased from history.",
      "They were told never to look back…",
    ],
    visualStyle: "painterly cinematic, volumetric light, mythic scale",
    beats: [
      "0-3s mythic hook",
      "the world before",
      "the transgression",
      "the consequence",
      "the moral / cliffhanger",
    ],
    exampleTitles: ["The Wager of the Sun", "The River That Forgets"],
    cta: "Follow for the next legend.",
  },
  micro_horror: {
    key: "micro_horror",
    title: "Micro-Horror",
    premise:
      "A self-contained 30-45s scare: a normal moment that goes very wrong. Atmospheric, not gory.",
    tone: "eerie, tense, unsettling",
    cast: [{ name: "The Resident", role: "an ordinary person, off-screen-facing" }],
    hookPatterns: [
      "The apartment was empty. So who locked the door?",
      "She got the text from her own number.",
      "It only appears when the lights are off.",
    ],
    visualStyle: "moody low-key lighting, desaturated, shallow depth of field",
    beats: [
      "0-3s unease hook",
      "normalcy",
      "the anomaly",
      "build",
      "the scare + cold CTA",
    ],
    exampleTitles: ["The Second Shadow", "Do Not Answer at 3:00"],
    cta: "Follow — if you can sleep tonight.",
  },
  heist: {
    key: "heist",
    title: "Heist / Crime Thriller",
    premise:
      "A slick crew pulls a miniature heist; the plan goes sideways. Product-placeable props.",
    tone: "slick, tense, stylish",
    cast: [
      { name: "The Planner", role: "cool, always three steps ahead" },
      { name: "The Wildcard", role: "improvises, causes trouble" },
    ],
    hookPatterns: [
      "The vault had one flaw — and {name} found it.",
      "90 seconds to pull the perfect crime…",
      "They only had one shot at this.",
    ],
    visualStyle: "high-contrast neo-noir, neon accents, crisp motion",
    beats: [
      "0-3s hook sets the score",
      "the plan",
      "the complication",
      "the improvisation",
      "cliffhanger + CTA",
    ],
    exampleTitles: ["The Ten-Second Vault", "Neon Getaway"],
    cta: "Would you have made it? Follow for Part 2.",
  },
};

export const ALL_FORMATS: Format[] = Object.keys(FORMATS) as Format[];

export function formatPlaybook(format: Format): FormatPlaybook {
  const p = FORMATS[format];
  if (!p) throw new Error(`Unknown format: ${format}`);
  return p;
}
