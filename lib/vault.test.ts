import { describe, it, expect } from "vitest";
import { seal, open } from "./vault";

describe("token vault (AES-256-GCM)", () => {
  it("round-trips a secret", () => {
    const sealed = seal("EAAG...long-lived-token");
    expect(sealed.ct).not.toContain("long-lived");
    expect(open(sealed)).toBe("EAAG...long-lived-token");
  });

  it("produces different ciphertext each time (random IV)", () => {
    const a = seal("same");
    const b = seal("same");
    expect(a.ct).not.toBe(b.ct);
    expect(a.iv).not.toBe(b.iv);
  });

  it("rejects a tampered ciphertext", () => {
    const sealed = seal("secret");
    const tampered = { ...sealed, ct: Buffer.from("garbage").toString("base64") };
    expect(() => open(tampered)).toThrow();
  });

  it("rejects a tampered auth tag", () => {
    const sealed = seal("secret");
    const bad = { ...sealed, tag: Buffer.from("0000000000000000").toString("base64") };
    expect(() => open(bad)).toThrow();
  });
});
