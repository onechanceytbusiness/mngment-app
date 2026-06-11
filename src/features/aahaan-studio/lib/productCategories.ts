/**
 * Per-category upload slots in the Aahaan Studio outfit editor.
 *
 * To avoid a schema change on `daily_outfits.product_images` (still
 * `text[]` / array of URL strings), the category is encoded in the
 * Supabase Storage upload PATH itself:
 *
 *   product-shots/{category}/{timestamp}_{random}.{ext}
 *
 * On read, categoryFromUrl() pulls the segment after the bucket name
 * back out. URLs uploaded before this feature existed (or any URL not
 * matching a known category) fall into the "Other" group in the UI.
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

const CATEGORY_SET = new Set<string>(PRODUCT_CATEGORIES);

/**
 * Pull the category segment out of a Supabase Storage public URL.
 *
 *   https://…/storage/v1/object/public/product-shots/topwear/123.jpg
 *                                                 └─────┬─────┘
 *                                                      "topwear"
 *
 * Returns null for legacy URLs that were uploaded before the per-
 * category split (path is just `product-shots/{filename}` with no
 * subfolder) — these render under the "Other" group.
 */
export function categoryFromUrl(url: string): ProductCategory | null {
  const match = url.match(/\/product-shots\/([^/?]+)\//);
  if (!match) return null;
  const segment = match[1];
  if (CATEGORY_SET.has(segment)) {
    return segment as ProductCategory;
  }
  return null;
}
