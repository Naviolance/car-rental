import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The secret key (sb_secret_...) is Supabase's current replacement for
// the legacy JWT-based service_role key (deprecated by end of 2026) — a
// drop-in swap in createClient(), and it additionally refuses to work
// from a browser at all (blocked by User-Agent), which the old key never
// did. Either way, this bypasses Row Level Security entirely, so this
// module must only ever run server-side — the `server-only` import
// guards that the same way it does in src/lib/leakedPassword.ts.
//
// Created lazily, not at module scope: any page importing this module
// (even transitively, via admin.ts) would otherwise fail to even build
// the moment SUPABASE_SECRET_KEY is unset — regardless of whether that
// page actually uploads anything.
let supabase: SupabaseClient | undefined;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
  }
  return supabase;
}

const CAR_IMAGES_BUCKET = "car-images";

export async function uploadCarImage(file: File): Promise<string> {
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await getSupabase()
    .storage.from(CAR_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = getSupabase().storage.from(CAR_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
