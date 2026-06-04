/**
 * Per-store visual treatment for the badge + placeholder image tile.
 *
 * Note on colour discipline: the mngmnt palette is strict — ink/coral/
 * paper + stone neutrals only. So we DON'T tint per-store with amber/
 * sky/pink/etc. Every manual store renders in stone; Amazon (the only
 * "auto" affiliate flow) takes the coral accent so the user can spot
 * post-ready deals from across the page. Store identity is communicated
 * by the label text and the placeholder initial.
 */
export interface StoreMeta {
  label: string;
  /** Tailwind classes for the store pill. */
  pill: string;
  /** Tailwind classes for the placeholder tile (no image). */
  tile: string;
  /** First letter used inside the placeholder tile. */
  initial: string;
}

const AMAZON: StoreMeta = {
  label: 'Amazon',
  pill: 'bg-mngmnt-coral text-mngmnt-paper',
  tile: 'bg-mngmnt-coral text-mngmnt-paper',
  initial: 'A',
};

const STONE_BASE = {
  pill: 'bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-200',
  tile: 'bg-stone-100 text-stone-600',
};

const STORE_META: Record<string, StoreMeta> = {
  amazon: AMAZON,
  flipkart: { label: 'Flipkart', ...STONE_BASE, initial: 'F' },
  myntra: { label: 'Myntra', ...STONE_BASE, initial: 'M' },
  ajio: { label: 'Ajio', ...STONE_BASE, initial: 'A' },
  nykaa: { label: 'Nykaa', ...STONE_BASE, initial: 'N' },
  'tata cliq': { label: 'Tata CLiQ', ...STONE_BASE, initial: 'T' },
};

const FALLBACK: StoreMeta = {
  label: 'Other',
  ...STONE_BASE,
  initial: '·',
};

export function storeMetaFor(store: string | null | undefined): StoreMeta {
  if (!store) return FALLBACK;
  const key = store.toLowerCase().trim();
  if (STORE_META[key]) return STORE_META[key];
  return {
    ...FALLBACK,
    label: store,
    initial: store.charAt(0).toUpperCase() || '·',
  };
}
