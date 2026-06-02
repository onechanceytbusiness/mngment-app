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
