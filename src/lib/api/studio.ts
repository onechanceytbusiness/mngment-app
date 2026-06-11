import { supabase } from '@/lib/supabase';
import type {
  AvatarIdentity,
  DailyOutfit,
  OutfitStatus,
  ProductLink,
} from '@/lib/types';

/**
 * Normalise a row coming out of Supabase. The jsonb columns
 * (product_links / product_images) can arrive as null when never set,
 * but the rest of the UI assumes arrays — so we coerce here once.
 */
function normaliseOutfit(row: Record<string, unknown>): DailyOutfit {
  const productLinks = Array.isArray(row.product_links)
    ? (row.product_links as ProductLink[])
    : [];
  const productImages = Array.isArray(row.product_images)
    ? (row.product_images as string[])
    : [];
  return {
    ...(row as unknown as DailyOutfit),
    product_links: productLinks,
    product_images: productImages,
  };
}

// ──────────────────────────────────────────────────────────────────
// daily_outfits
// ──────────────────────────────────────────────────────────────────

/** All outfits, newest first by created_at. The board groups by status client-side. */
export async function listOutfits(): Promise<DailyOutfit[]> {
  const { data, error } = await supabase
    .from('daily_outfits')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`listOutfits: ${error.message}`);
  return (data ?? []).map((row) => normaliseOutfit(row as Record<string, unknown>));
}

export async function updateOutfit(
  id: string,
  patch: Partial<Omit<DailyOutfit, 'id' | 'created_at'>>,
): Promise<DailyOutfit> {
  // Supabase auto-updates updated_at via a trigger in most setups; if your
  // schema doesn't, uncomment:
  // patch.updated_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('daily_outfits')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`updateOutfit: ${error.message}`);
  return normaliseOutfit(data as Record<string, unknown>);
}

export async function deleteOutfit(id: string): Promise<void> {
  const { error } = await supabase.from('daily_outfits').delete().eq('id', id);
  if (error) throw new Error(`deleteOutfit: ${error.message}`);
}

/** Convenience for the modal's status dropdown (calls updateOutfit). */
export async function setOutfitStatus(
  id: string,
  status: OutfitStatus,
): Promise<DailyOutfit> {
  return updateOutfit(id, { status });
}

// ──────────────────────────────────────────────────────────────────
// avatar_identity (single row)
// ──────────────────────────────────────────────────────────────────

/** Returns the single row if it exists, or null on first run. */
export async function getAvatarIdentity(): Promise<AvatarIdentity | null> {
  const { data, error } = await supabase
    .from('avatar_identity')
    .select('*')
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getAvatarIdentity: ${error.message}`);
  return (data as AvatarIdentity | null) ?? null;
}

// ──────────────────────────────────────────────────────────────────
// Storage — product screenshots
// ──────────────────────────────────────────────────────────────────

const PRODUCT_SHOTS_BUCKET = 'product-shots';

/**
 * Upload a single product screenshot to Supabase Storage and return its
 * public URL. The bucket must exist and be set to "public" so the URLs
 * resolve without a signed-URL flow (see README for setup).
 */
export async function uploadProductShot(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are supported.');
  }

  // Random-ish filename to avoid collisions and keep the bucket flat.
  // Extension is sanitised (lowercase, max 5 chars) so a malformed
  // file.name can't produce a weird path.
  const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const ext = rawExt.replace(/[^a-z0-9]/g, '').slice(0, 5) || 'jpg';
  const rand = Math.random().toString(36).slice(2, 12);
  const path = `${Date.now()}_${rand}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_SHOTS_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from(PRODUCT_SHOTS_BUCKET)
    .getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error(
      'Upload succeeded but the public URL could not be resolved. Is the bucket public?',
    );
  }

  return data.publicUrl;
}

/**
 * Save the identity. If we already have an id, update; otherwise insert
 * (Supabase generates the uuid). Returns the persisted row.
 */
export async function saveAvatarIdentity(
  patch: Partial<Omit<AvatarIdentity, 'created_at' | 'updated_at'>>,
): Promise<AvatarIdentity> {
  if (patch.id) {
    const { data, error } = await supabase
      .from('avatar_identity')
      .update(patch)
      .eq('id', patch.id)
      .select()
      .single();
    if (error) throw new Error(`saveAvatarIdentity (update): ${error.message}`);
    return data as AvatarIdentity;
  }
  // First-time insert. Strip id so the DB default generator handles it.
  const { id: _ignore, ...insertable } = patch;
  void _ignore;
  const { data, error } = await supabase
    .from('avatar_identity')
    .insert(insertable)
    .select()
    .single();
  if (error) throw new Error(`saveAvatarIdentity (insert): ${error.message}`);
  return data as AvatarIdentity;
}
