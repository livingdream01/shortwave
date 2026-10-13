import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { config } from "../config";

/**
 * Upload a local file to the public Supabase storage bucket and return
 * its public URL. Instagram fetches the video by URL, so the object
 * MUST be publicly reachable.
 */
export async function uploadPublic(
  localPath: string,
  destPath: string,
  contentType = "video/mp4",
): Promise<string> {
  const { url, serviceRoleKey, bucket } = config.supabase;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase storage is not configured (SUPABASE_URL / SERVICE_ROLE_KEY)");
  }
  const sb = createClient(url, serviceRoleKey);
  const data = await readFile(localPath);
  const { error } = await sb.storage
    .from(bucket)
    .upload(destPath, data, { contentType, upsert: true });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data: pub } = sb.storage.from(bucket).getPublicUrl(destPath);
  return pub.publicUrl;
}
