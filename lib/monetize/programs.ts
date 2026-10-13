export interface AffiliateProgram {
  id: string;
  name: string;
  url: string;
  commission: string;
  recurring: boolean;
  /** Some programs ban self-referral — never inject our own link for ourselves. */
  allowSelfReferral: boolean;
  requiresDisclosure: boolean;
  rules: string[];
}

export const PROGRAMS: AffiliateProgram[] = [
  {
    id: "facelessreels",
    name: "FacelessReels",
    url: "https://facelessreels.tolt.io",
    commission: "recurring",
    recurring: true,
    allowSelfReferral: false,
    requiresDisclosure: true,
    rules: ["organic promotion only — no paid ads", "no self-referral"],
  },
  {
    id: "openart",
    name: "OpenArt",
    url: "https://openart.ai/programs/affiliate",
    commission: "recurring on referred subscribers",
    recurring: true,
    allowSelfReferral: false,
    requiresDisclosure: true,
    rules: ["organic promotion only"],
  },
  {
    id: "oakgen",
    name: "Oakgen",
    url: "https://oakgen.ai",
    commission: "25% for 6 months",
    recurring: false,
    allowSelfReferral: false,
    requiresDisclosure: true,
    rules: ["30-day cookie", "$10 payout minimum"],
  },
];

export function program(id: string): AffiliateProgram {
  const p = PROGRAMS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown affiliate program: ${id}`);
  return p;
}
