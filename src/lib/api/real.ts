import { apiConfig } from '@/lib/api/config';
import { supabase } from '@/lib/supabase';
import type {
  Alert,
  Article,
  PublishPayload,
  PublishResult,
  Region,
  Title,
} from '@/lib/types';

function url(path: string): string {
  if (!apiConfig.baseUrl) {
    throw new Error(
      'VITE_N8N_BASE_URL is not set. Configure it in .env.local or switch VITE_API_MODE=mock.',
    );
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiConfig.baseUrl}${normalizedPath}`;
}

async function authHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

async function postJson<TBody, TResult>(
  endpoint: string,
  body: TBody,
): Promise<TResult> {
  const res = await fetch(url(endpoint), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(await authHeaders()),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Request to ${endpoint} failed: ${res.status} ${res.statusText}${
        text ? ` — ${text}` : ''
      }`,
    );
  }

  return (await res.json()) as TResult;
}

async function getJson<TResult>(endpoint: string): Promise<TResult> {
  const res = await fetch(url(endpoint), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(await authHeaders()),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `Request to ${endpoint} failed: ${res.status} ${res.statusText}${
        text ? ` — ${text}` : ''
      }`,
    );
  }

  return (await res.json()) as TResult;
}

export async function generateTitles(
  count = 6,
  region: Region = 'global',
): Promise<Title[]> {
  return postJson<{ count: number; region: Region }, Title[]>(
    apiConfig.paths.generateTitles,
    { count, region },
  );
}

export async function generateArticle(
  title: string,
  region: Region = 'global',
): Promise<Article> {
  return postJson<{ title: string; region: Region }, Article>(
    apiConfig.paths.generateArticle,
    { title, region },
  );
}

export async function publish(payload: PublishPayload): Promise<PublishResult> {
  return postJson<PublishPayload, PublishResult>(
    apiConfig.paths.publish,
    payload,
  );
}

export async function getAlerts(): Promise<Alert[]> {
  return getJson<Alert[]>(apiConfig.paths.alerts);
}

export async function dismissAlert(id: string): Promise<{ ok: true }> {
  const path = apiConfig.paths.dismissAlert.replace(
    ':id',
    encodeURIComponent(id),
  );
  return postJson<Record<string, never>, { ok: true }>(path, {});
}
