import { apiConfig } from '@/lib/api/config';
import * as mock from '@/lib/api/mock';
import * as real from '@/lib/api/real';
import type {
  Alert,
  Article,
  PublishPayload,
  PublishResult,
  Region,
  Title,
} from '@/lib/types';

const impl = apiConfig.mode === 'real' ? real : mock;

export function generateTitles(
  count?: number,
  region: Region = 'global',
): Promise<Title[]> {
  return impl.generateTitles(count, region);
}

export function generateArticle(
  title: string,
  region: Region = 'global',
): Promise<Article> {
  return impl.generateArticle(title, region);
}

export function publish(payload: PublishPayload): Promise<PublishResult> {
  return impl.publish(payload);
}

export function getAlerts(): Promise<Alert[]> {
  return impl.getAlerts();
}

export function dismissAlert(id: string): Promise<{ ok: true }> {
  return impl.dismissAlert(id);
}

// Deals API (its own module — Supabase CRUD + webhook calls with their
// own mock/real switch). Re-exported so feature code can import from a
// single `@/lib/api` surface.
export {
  enrichDeal,
  postDealToTelegram,
  listDeals,
  countUnpostedDeals,
  insertDeal,
  updateDeal,
  deleteDeal,
} from '@/lib/api/deals';

// Aahaan Studio — Supabase only, no webhooks. Same single-surface
// re-export pattern as the other features.
export {
  listOutfits,
  updateOutfit,
  deleteOutfit,
  setOutfitStatus,
  getAvatarIdentity,
  saveAvatarIdentity,
  uploadProductShot,
} from '@/lib/api/studio';

export { apiConfig };
