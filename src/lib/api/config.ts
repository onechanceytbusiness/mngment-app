type ApiMode = 'mock' | 'real';

const rawMode = (import.meta.env.VITE_API_MODE ?? 'mock').toLowerCase();
const mode: ApiMode = rawMode === 'real' ? 'real' : 'mock';

const baseUrl = (import.meta.env.VITE_N8N_BASE_URL ?? '').replace(/\/+$/, '');

const generateTitles =
  import.meta.env.VITE_N8N_GENERATE_TITLES_PATH ?? '/generate-titles';
const generateArticle =
  import.meta.env.VITE_N8N_GENERATE_ARTICLE_PATH ?? '/generate-article';
const publish = import.meta.env.VITE_N8N_PUBLISH_PATH ?? '/publish';
const alerts = import.meta.env.VITE_N8N_ALERTS_PATH ?? '/alerts';
const dismissAlert =
  import.meta.env.VITE_N8N_DISMISS_ALERT_PATH ?? '/alerts/:id/dismiss';

/**
 * Deal webhooks are full URLs (not paths under VITE_N8N_BASE_URL) because
 * the user keeps them as standalone env vars per the spec. They still
 * point at the same n8n cloud instance.
 */
const enrichDealUrl = import.meta.env.VITE_ENRICH_DEAL_URL ?? '';
const postDealUrl = import.meta.env.VITE_POST_DEAL_URL ?? '';

export const apiConfig = {
  mode,
  baseUrl,
  paths: {
    generateTitles,
    generateArticle,
    publish,
    alerts,
    dismissAlert,
  },
  urls: {
    enrichDeal: enrichDealUrl,
    postDeal: postDealUrl,
  },
} as const;

export type ApiConfig = typeof apiConfig;
