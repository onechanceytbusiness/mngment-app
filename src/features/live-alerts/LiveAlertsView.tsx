import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import { cn } from '@/lib/cn';
import type { Alert, Article, PublishResult } from '@/lib/types';
import { useAlerts } from '@/features/live-alerts/AlertsProvider';
import { AlertCard } from '@/features/live-alerts/components/AlertCard';
import { ArticleEditor } from '@/features/fashion-audit/components/ArticleEditor';
import { FeaturedImageUploader } from '@/features/fashion-audit/components/FeaturedImageUploader';
import { PublishPanel } from '@/features/fashion-audit/components/PublishPanel';
import { timeAgo } from '@/features/live-alerts/lib/timeAgo';

type Filter = 'all' | 'unreviewed' | 'published';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unreviewed', label: 'Unreviewed' },
  { value: 'published', label: 'Published' },
];

function FilterTabs({
  value,
  onChange,
  counts,
}: {
  value: Filter;
  onChange: (v: Filter) => void;
  counts: Record<Filter, number>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter alerts"
      className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-1"
    >
      {FILTERS.map((f) => {
        const active = value === f.value;
        return (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(f.value)}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-white text-stone-900 shadow-soft'
                : 'text-stone-500 hover:text-stone-700',
            )}
          >
            {f.label}
            <span
              className={cn(
                'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                active
                  ? 'bg-stone-900 text-mngment-paper'
                  : 'bg-stone-200 text-stone-600',
              )}
            >
              {counts[f.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AlertsListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-start gap-3">
            <Skeleton className="h-7 w-14 rounded-md" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-2/3" />
            </div>
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
          <Skeleton className="mt-4 h-3 w-1/2" />
          <div className="mt-4 flex justify-end gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Bell className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-semibold text-stone-900">
        No new alerts — your monitor is watching
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-stone-500">
        We'll flag anything worth writing. Hourly scans of the fashion-news feed
        run automatically in the background.
      </p>
    </Card>
  );
}

export default function LiveAlertsView() {
  const toast = useToast();
  const {
    alerts,
    loading,
    lastUpdatedAt,
    refresh,
    dismiss,
    setStatus,
  } = useAlerts();

  const [filter, setFilter] = useState<Filter>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftArticle, setDraftArticle] = useState<Article | null>(null);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(
    null,
  );
  const [publishStatus, setPublishStatus] = useState<'publish' | 'draft' | null>(
    null,
  );
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const editingAlert = useMemo(
    () => (editingId ? alerts.find((a) => a.id === editingId) : null) ?? null,
    [alerts, editingId],
  );

  const counts: Record<Filter, number> = useMemo(() => {
    return {
      all: alerts.length,
      unreviewed: alerts.filter((a) => a.status !== 'published').length,
      published: alerts.filter((a) => a.status === 'published').length,
    };
  }, [alerts]);

  const visibleAlerts = useMemo(() => {
    if (filter === 'unreviewed') {
      return alerts.filter((a) => a.status !== 'published');
    }
    if (filter === 'published') {
      return alerts.filter((a) => a.status === 'published');
    }
    return alerts;
  }, [alerts, filter]);

  const handleRefresh = async () => {
    try {
      await refresh();
      toast.info('Alerts refreshed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to refresh');
    }
  };

  const handleReview = (alert: Alert) => {
    setEditingId(alert.id);
    setDraftArticle({
      title: alert.title,
      content_html: alert.content_html,
      excerpt: alert.excerpt,
    });
    setFeaturedImage(null);
    setPublishResult(null);
    setPublishStatus(null);
    // Mark "new" alerts as draft once the user opens the editor.
    if (alert.status === 'new') {
      setStatus(alert.id, 'draft');
    }
  };

  const handleDismiss = async (alert: Alert) => {
    setDismissingId(alert.id);
    try {
      await dismiss(alert.id);
      toast.success('Alert dismissed');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to dismiss alert',
      );
    } finally {
      setDismissingId(null);
    }
  };

  const exitEditor = () => {
    setEditingId(null);
    setDraftArticle(null);
    setFeaturedImage(null);
    setPublishResult(null);
    setPublishStatus(null);
  };

  const handlePublished = (
    result: PublishResult,
    status: 'publish' | 'draft',
  ) => {
    setPublishResult(result);
    setPublishStatus(status);
    if (editingAlert) {
      setStatus(editingAlert.id, status === 'publish' ? 'published' : 'draft');
    }
    toast.success(
      status === 'publish'
        ? 'Published to WordPress'
        : 'Draft saved to WordPress',
    );
  };

  const handlePublishError = (err: string) => toast.error(err);

  const resetToOriginal = () => {
    if (!editingAlert) return;
    setDraftArticle({
      title: editingAlert.title,
      content_html: editingAlert.content_html,
      excerpt: editingAlert.excerpt,
    });
    toast.info('Reverted to the auto-generated draft');
  };

  // ----- Published success screen -----
  if (editingAlert && publishResult) {
    return (
      <div className="mx-auto max-w-2xl py-16">
        <Card className="flex flex-col items-center gap-5 px-8 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-stone-900">
              {publishStatus === 'publish'
                ? 'Published to WordPress'
                : 'Saved as draft'}
            </h2>
            {publishResult.message ? (
              <p className="text-sm text-stone-500">{publishResult.message}</p>
            ) : null}
          </div>
          {publishResult.postUrl ? (
            <a
              href={publishResult.postUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View on WordPress
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
          <Button variant="secondary" onClick={exitEditor}>
            Back to alerts
          </Button>
        </Card>
      </div>
    );
  }

  // ----- Editor screen -----
  if (editingAlert && draftArticle) {
    return (
      <div className="mx-auto max-w-6xl py-8">
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={exitEditor}
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to alerts
          </button>
          <span className="text-xs text-stone-400">
            From {editingAlert.source} · {timeAgo(editingAlert.createdAt)}
          </span>
        </div>
        <div className="flex gap-6">
          <div className="flex-1">
            <ArticleEditor article={draftArticle} onChange={setDraftArticle} />
          </div>
          <div className="flex w-80 shrink-0 flex-col gap-5">
            <FeaturedImageUploader
              image={featuredImage}
              onChange={setFeaturedImage}
            />
            <PublishPanel
              article={draftArticle}
              featuredImage={featuredImage}
              onPublished={handlePublished}
              onError={handlePublishError}
              onRegenerate={resetToOriginal}
              regenerateLabel="Reset to original draft"
            />
          </div>
        </div>
      </div>
    );
  }

  // ----- List screen -----
  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Live Alerts</h1>
          <p className="mt-1 text-sm text-stone-500">
            High-priority fashion stories your monitor flagged — review and
            publish.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdatedAt ? (
            <span className="text-xs text-stone-400">
              Last checked {timeAgo(new Date(lastUpdatedAt).toISOString())}
            </span>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            loading={loading}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-5">
        <FilterTabs value={filter} onChange={setFilter} counts={counts} />
      </div>

      {loading && alerts.length === 0 ? (
        <AlertsListSkeleton />
      ) : visibleAlerts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-4">
          {visibleAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              dismissing={dismissingId === alert.id}
              onReview={handleReview}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}
