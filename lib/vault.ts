import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { config } from "./config";

/** Sealed (encrypted) token at rest. All fields base64. */
export interface Sealed {
  ct: string;
  iv: string;
  tag: string;
}

function key(): Buffer {
  const raw = config.vault.key;
  if (!raw) throw new Error("SW_TOKEN_KEK is not set");
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) {
    throw new Error("SW_TOKEN_KEK must decode to 32 bytes (openssl rand -base64 32)");
  }
  return buf;
}

/** Encrypt a secret with AES-256-GCM. */
export function seal(plaintext: string): Sealed {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    ct: ct.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

/** Decrypt a sealed secret. Throws if the ciphertext or tag was tampered with. */
export function open(sealed: Sealed): string {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(sealed.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(sealed.tag, "base64"));
  const plain = Buffer.concat([
    decipher.update(Buffer.from(sealed.ct, "base64")),
    decipher.final(),
  ]);
  return plain.toString("utf8");
}
