/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MODE?: 'mock' | 'real' | string;
  readonly VITE_N8N_BASE_URL?: string;
  readonly VITE_N8N_GENERATE_TITLES_PATH?: string;
  readonly VITE_N8N_GENERATE_ARTICLE_PATH?: string;
  readonly VITE_N8N_PUBLISH_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
