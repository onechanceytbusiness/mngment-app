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

/**
 * All outfits, newest first by created_at. The board groups by status
 * client-side.
 *
 * Disk-IO discipline:
 *   - Explicit column list — skips the heaviest jsonb columns
 *     (product_links, product_images) entirely since the text-only
 *     modal no longer reads them. normaliseOutfit() fills them back as
 *     empty arrays so the DailyOutfit type contract holds.
 *   - `.limit(200)` caps the worst-case read at ~20 days of daily
 *     ideas. Pre-fix this query was effectively unbounded.
 */
const OUTFIT_LIST_COLUMNS = [
  'id',
  'outfit_date',
  'outfit_no',
  'title',
  'thoughts',
  'top',
  'bottom',
  'footwear',
  'accessories',
  'background',
  'caption',
  'hashtags',
  'status',
  'created_at',
  'updated_at',
].join(',');

export async function listOutfits(): Promise<DailyOutfit[]> {
  const { data, error } = await supabase
    .from('daily_outfits')
    .select(OUTFIT_LIST_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw new Error(`listOutfits: ${error.message}`);
  // Cast via `unknown` first — Supabase's stricter typing for
  // `.select(columns)` (vs `.select('*')`) doesn't overlap directly
  // with Record<string, unknown>, but the runtime shape is identical
  // so the unknown bounce is safe.
  return (data ?? []).map((row) =>
    normaliseOutfit(row as unknown as Record<string, unknown>),
  );
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
