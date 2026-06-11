import type React from 'react';

export type Region = 'global' | 'india';

export interface Title {
  id: string;
  headline: string;
  rationale?: string;
  source?: string;
  region?: Region;
}

export interface Article {
  title: string;
  content_html: string;
  excerpt: string;
}

export interface PublishPayload {
  title: string;
  content_html: string;
  excerpt: string;
  featuredImage: string | null;
  status: 'publish' | 'draft';
}

export interface PublishResult {
  ok: boolean;
  postUrl?: string;
  postId?: number;
  message?: string;
}

export interface AutomationDef {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  icon: string;
  status: 'active' | 'coming-soon';
  component?: React.ComponentType;
}

export type AlertStatus = 'new' | 'draft' | 'published';

export interface Alert {
  id: string;
  title: string;
  reason: string;
  score: number; // 0-100
  source: string;
  sourceUrl: string;
  status: AlertStatus;
  createdAt: string; // ISO timestamp
  content_html: string;
  excerpt: string;
}

// ---------- Deals ----------

export type Audience = 'men' | 'women';
export type LinkStatus = 'auto' | 'manual';
export type DealStatus = 'found' | 'posted';

/**
 * Categories the enrich webhook is known to return. Kept open as `string`
 * everywhere a Deal is stored so a new server-side category never breaks
 * the type, but the filter chip set uses this union.
 */
export const KNOWN_CATEGORIES = [
  'fashion',
  'electronics',
  'home',
  'skincare',
  'beauty',
] as const;
export type KnownCategory = (typeof KNOWN_CATEGORIES)[number];

/** Input the user fills in the "Add deal" form. */
export interface EnrichDealInput {
  name: string;
  store: string;
  mrp: number;
  price: number;
  link: string;
  image?: string;
  audienceHint: Audience;
}

/**
 * Shape the enrich webhook returns. This is also the canonical row written
 * to the `deals` table (with id + status appended on insert).
 */
export interface EnrichedDeal {
  audience: Audience;
  category: string;
  store: string | null;
  product_name: string;
  mrp: number | null;
  price: number | null;
  discount_pct: number | null;
  image_url: string | null;
  raw_link: string | null;
  affiliate_link: string | null;
  link_status: LinkStatus;
  glow_title: string | null;
  pitch: string | null;
  status: DealStatus;
}

/** Persisted deal row (matches the `deals` table schema). */
export interface Deal extends EnrichedDeal {
  id: number;
  posted_to: string[];
  created_at: string;
}

export interface PostDealResult {
  ok: boolean;
  channel?: string;
  message_id?: number;
  message?: string;
}

// ---------- Aahaan Studio ----------

export type OutfitStatus =
  | 'idea'
  | 'sourced'
  | 'generated'
  | 'edited'
  | 'ready'
  | 'posted';

/** Pipeline order — drives the kanban column layout. */
export const OUTFIT_STATUSES: OutfitStatus[] = [
  'idea',
  'sourced',
  'generated',
  'edited',
  'ready',
  'posted',
];

export interface ProductLink {
  label: string;
  url: string;
}

/** Mirrors the daily_outfits table schema exactly. */
export interface DailyOutfit {
  id: string;
  outfit_date: string | null; // ISO date (yyyy-mm-dd)
  outfit_no: number | null;
  title: string | null;
  thoughts: string | null;
  top: string | null;
  bottom: string | null;
  footwear: string | null;
  accessories: string | null;
  background: string | null;
  product_links: ProductLink[];
  product_images: string[];
  status: OutfitStatus;
  caption: string | null;
  hashtags: string | null;
  created_at: string;
  updated_at: string;
}

/** Mirrors the avatar_identity single-row table. */
export interface AvatarIdentity {
  id: string;
  name: string | null;
  profile: string | null;
  hero_image_url: string | null;
  identity_folder_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
