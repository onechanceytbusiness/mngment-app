/**
 * Per-category upload slots in the Aahaan Studio outfit editor.
 *
 * To avoid a schema change on `daily_outfits.product_images` (still
 * `text[]` / array of URL strings), the category AND the view are
 * encoded in the Supabase Storage upload PATH itself:
 *
 *   product-shots/{category}/{view}/{timestamp}_{random}.{ext}
 *
 *   - {category} is one of PRODUCT_CATEGORIES below.
 *   - {view} is 'front' | 'back' for clothing categories
 *     (topwear, extra-layer, bottomwear) and 'single' for the others.
 *
 * On read, categoryFromUrl() pulls both segments back out. URLs from
 * before this split (path was just `{category}/{filename}` with no
 * view subfolder) default to view 'front' for clothing categories and
 * 'single' for the rest, so legacy uploads still land somewhere
 * visible. URLs without a known category fall into the "Other" group.
 */
export const PRODUCT_CATEGORIES = [
  'topwear',
  'extra-layer',
  'bottomwear',
  'headwear',
  'accessories',
  'footwear',
  'eyewear',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  topwear: 'Topwear',
  'extra-layer': 'Extra layer',
  bottomwear: 'Bottomwear',
  headwear: 'Headwear',
  accessories: 'Accessories',
  footwear: 'Footwear',
  eyewear: 'Eyewear',
};

/** Categories that need front + back reference shots. */
export const CLOTHING_CATEGORIES = [
  'topwear',
  'extra-layer',
  'bottomwear',
] as const;

export type ClothingCategory = (typeof CLOTHING_CATEGORIES)[number];

const CATEGORY_SET = new Set<string>(PRODUCT_CATEGORIES);
const CLOTHING_SET = new Set<string>(CLOTHING_CATEGORIES);

/** Type-guard for narrowing ProductCategory to ClothingCategory. */
export function isClothingCategory(
  category: ProductCategory,
): category is ClothingCategory {
  return CLOTHING_SET.has(category);
}

/** Three possible view values stored under {category}/{view}/. */
export type View = 'front' | 'back' | 'single';

const KNOWN_VIEWS = new Set<string>(['front', 'back', 'single']);

/**
 * Sensible legacy fallback when a URL has a known category but no
 * view segment (uploads from before the front/back split). Clothing
 * categories default to 'front'; single-view categories default to
 * 'single' so the image lands in their only slot rather than a slot
 * that doesn't exist for that category.
 */
function defaultViewFor(category: ProductCategory): View {
  return CLOTHING_SET.has(category) ? 'front' : 'single';
}

/**
 * Pull the category + view out of a Supabase Storage public URL.
 *
 *   https://…/storage/v1/object/public/product-shots/topwear/front/123.jpg
 *                                                 └───┬───┘ └─┬─┘
 *                                                  category   view
 *
 * Returns null for URLs that don't reference a known category (legacy
 * unknown buckets, manual uploads, etc.) — these render in the
 * fallback "Other" group in the modal.
 *
 * Robust to LEGACY URLs that have no view segment:
 *   product-shots/topwear/123.jpg   →  { category: 'topwear', view: 'front' }
 *   product-shots/headwear/123.jpg  →  { category: 'headwear', view: 'single' }
 */
export function categoryFromUrl(
  url: string,
): { category: ProductCategory; view: View } | null {
  // Capture everything after the bucket name and before a query string
  // or end of URL. Then split on slashes so we can inspect each
  // segment independently — much easier than fighting a single regex.
  const match = url.match(/\/product-shots\/(.+?)(?:\?|$)/);
  if (!match) return null;
  const parts = match[1].split('/').filter(Boolean);
  if (parts.length === 0) return null;

  const cat = parts[0];
  if (!CATEGORY_SET.has(cat)) return null;
  const category = cat as ProductCategory;

  // Second segment is either a known view OR the filename (legacy).
  // Filenames I generate look like "{timestamp}_{random}.{ext}" so
  // they never collide with the three known view names.
  const possibleView = parts[1];
  if (possibleView && KNOWN_VIEWS.has(possibleView)) {
    return { category, view: possibleView as View };
  }

  return { category, view: defaultViewFor(category) };
}
