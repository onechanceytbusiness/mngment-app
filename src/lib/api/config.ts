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
} as const;

export type ApiConfig = typeof apiConfig;
