import { apiConfig } from '@/lib/api/config';
import * as dealsMock from '@/lib/api/dealsMock';
import { supabase } from '@/lib/supabase';
import type {
  Audience,
  Deal,
  DealStatus,
  EnrichDealInput,
  EnrichedDeal,
  PostDealResult,
} from '@/lib/types';

// ───────────────────────────────────────────────────────────────
// Webhook calls — mock or real based on VITE_API_MODE
// ───────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function postWebhook<TBody, TResult>(
  fullUrl: string,
  body: TBody,
  webhookName: string,
): Promise<TResult> {
  if (!fullUrl) {
    throw new Error(
      `${webhookName} webhook URL is not set. Configure it in .env.local or switch VITE_API_MODE=mock.`,
    );
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const token = await getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(fullUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `${webhookName} failed: ${res.status} ${res.statusText}${
        text ? ` — ${text}` : ''
      }`,
    );
  }
  return (await res.json()) as TResult;
}

/**
 * Hit the enrich webhook. In mock mode, the local impl runs instead and
 * returns a believable enriched-deal shape.
 */
export async function enrichDeal(
  input: EnrichDealInput,
): Promise<EnrichedDeal> {
  if (apiConfig.mode === 'mock') {
    return dealsMock.enrichDeal(input);
  }
  return postWebhook<EnrichDealInput, EnrichedDeal>(
    apiConfig.urls.enrichDeal,
    input,
    'enrich-deal',
  );
}

/**
 * Hit the post webhook. ⚠ posts to a LIVE Telegram channel in real mode —
 * the caller MUST have already confirmed with the user.
 */
export async function postDealToTelegram(deal: Deal): Promise<PostDealResult> {
  if (apiConfig.mode === 'mock') {
    return dealsMock.postDeal(deal);
  }
  return postWebhook<Deal, PostDealResult>(
    apiConfig.urls.postDeal,
    deal,
    'post-deal',
  );
}

// ───────────────────────────────────────────────────────────────
// Supabase CRUD — always real (no mock layer for the data store)
// ───────────────────────────────────────────────────────────────

export interface ListDealsFilters {
  category?: string;
  status?: DealStatus;
}

/**
 * Read deals for a given audience, optionally filtered by category +
 * status. Ordered by newest first.
 */
export async function listDeals(
  audience: Audience,
  filters: ListDealsFilters = {},
): Promise<Deal[]> {
  let query = supabase
    .from('deals')
    .select('*')
    .eq('audience', audience)
    .order('created_at', { ascending: false });

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.status) query = query.eq('status', filters.status);

  const { data, error } = await query;
  if (error) throw new Error(`listDeals: ${error.message}`);
  return (data ?? []) as Deal[];
}

/**
 * Lightweight count for the sidebar badge. Returns just the integer so
 * we don't pull rows we don't need.
 */
export async function countUnpostedDeals(): Promise<number> {
  const { count, error } = await supabase
    .from('deals')
    .select('id', { count: 'exact', head: true })
    .neq('status', 'posted');
  if (error) throw new Error(`countUnpostedDeals: ${error.message}`);
  return count ?? 0;
}

export async function insertDeal(deal: EnrichedDeal): Promise<Deal> {
  // Strip undefined keys — Supabase rejects them in some payloads.
  const payload = {
    audience: deal.audience,
    category: deal.category,
    store: deal.store,
    product_name: deal.product_name,
    mrp: deal.mrp,
    price: deal.price,
    discount_pct: deal.discount_pct,
    image_url: deal.image_url,
    raw_link: deal.raw_link,
    affiliate_link: deal.affiliate_link,
    link_status: deal.link_status,
    glow_title: deal.glow_title,
    pitch: deal.pitch,
    status: deal.status,
  };
  const { data, error } = await supabase
    .from('deals')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(`insertDeal: ${error.message}`);
  return data as Deal;
}

export async function updateDeal(
  id: number,
  patch: Partial<Omit<Deal, 'id' | 'created_at'>>,
): Promise<Deal> {
  const { data, error } = await supabase
    .from('deals')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`updateDeal: ${error.message}`);
  return data as Deal;
}

export async function deleteDeal(id: number): Promise<void> {
  const { error } = await supabase.from('deals').delete().eq('id', id);
  if (error) throw new Error(`deleteDeal: ${error.message}`);
}
