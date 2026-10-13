import { program } from "./programs";

export interface LinkSpec {
  programId: string;
  label: string;
  targetUrl: string;
  campaign?: string;
  /** Our referral/affiliate id for that program. */
  ref?: string;
}

export const DISCLOSURE = "Affiliate links — I may earn a commission.";

/** Build a tracked URL with UTM params (+ optional referral id). */
export function trackedLink(spec: LinkSpec): string {
  program(spec.programId); // validate the program exists
  const url = new URL(spec.targetUrl);
  url.searchParams.set("utm_source", "shortwave");
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", spec.campaign ?? spec.programId);
  if (spec.ref) url.searchParams.set("ref", spec.ref);
  return url.toString();
}

/**
 * Append tracked links (and the required disclosure) to a caption.
 * Returns the caption unchanged when there are no links.
 */
export function injectCaption(caption: string, links: LinkSpec[]): string {
  if (links.length === 0) return caption;
  const lines = links
    .map((l) => `→ ${l.label}: ${trackedLink(l)}`)
    .join("\n");
  const needsDisclosure = links.some(
    (l) => program(l.programId).requiresDisclosure,
  );
  return [
    caption.trim(),
    "",
    lines,
    needsDisclosure ? `\n${DISCLOSURE}` : "",
  ]
    .join("\n")
    .trim();
}
