import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import { cn } from '@/lib/cn';
import { generateTitles, generateArticle } from '@/lib/api';
import type { Article, PublishResult, Region, Title } from '@/lib/types';

const REGIONS: { value: Region; label: string; hint: string; flag: string }[] = [
  {
    value: 'global',
    label: 'Global',
    hint: 'Business of Fashion, WWD, Vogue Business, Reuters',
    flag: '🌍',
  },
  {
    value: 'india',
    label: 'India',
    hint: 'Vogue India, Mint, Economic Times, Voice of Fashion',
    flag: '🇮🇳',
  },
];

function RegionToggle({
  value,
  onChange,
  disabled,
}: {
  value: Region;
  onChange: (r: Region) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="tablist"
      aria-label="News region"
      className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-1"
    >
      {REGIONS.map((r) => {
        const active = value === r.value;
        return (
          <button
            key={r.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(r.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-white text-stone-900 shadow-soft'
                : 'text-stone-500 hover:text-stone-700',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <span aria-hidden>{r.flag}</span>
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
import { TitleGrid } from '@/features/fashion-audit/components/TitleGrid';
import { ArticleEditor } from '@/features/fashion-audit/components/ArticleEditor';
import { FeaturedImageUploader } from '@/features/fashion-audit/components/FeaturedImageUploader';
import { PublishPanel } from '@/features/fashion-audit/components/PublishPanel';

type Step = 'idle' | 'titles' | 'editing' | 'published';

interface State {
  step: Step;
  titles: Title[];
  selectedTitle: Title | null;
  article: Article | null;
  featuredImage: string | null;
  publishResult: PublishResult | null;
  publishStatus: 'publish' | 'draft' | null;
}

const initialState: State = {
  step: 'idle',
  titles: [],
  selectedTitle: null,
  article: null,
  featuredImage: null,
  publishResult: null,
  publishStatus: null,
};

function TitlesSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-stone-500">
        Pulling latest fashion news and drafting ideas… this can take up to a
        minute
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-5/6" />
            <Skeleton className="mt-4 h-3 w-1/3" />
          </Card>
        ))}
      </div>
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-stone-500">
        Drafting article… this can take ~30 seconds
      </p>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-10 w-2/3" />
          <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white p-6 shadow-soft">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-11/12" />
            <Skeleton className="mt-6 h-6 w-1/3" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-10/12" />
            <Skeleton className="mt-2 h-4 w-full" />
          </div>
          <Skeleton className="mt-4 h-20 w-full" />
        </div>
        <div className="shrink-0 lg:w-80">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="mt-4 h-10 w-full" />
          <Skeleton className="mt-2 h-10 w-full" />
          <Skeleton className="mt-2 h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ManualFlow() {
  const toast = useToast();
  const [state, setState] = useState<State>(initialState);
  const [count, setCount] = useState<number>(8);
  const [region, setRegion] = useState<Region>('global');
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(false);

  const fetchTitles = async (r: Region) => {
    setLoadingTitles(true);
    setState((s) => ({ ...s, step: 'titles', titles: [] }));
    try {
      const titles = await generateTitles(count, r);
      setState((s) => ({ ...s, titles }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load titles');
      setState((s) => ({ ...s, step: 'idle' }));
    } finally {
      setLoadingTitles(false);
    }
  };

  const handleGenerateTitles = () => fetchTitles(region);

  const handleSelectTitle = async (t: Title) => {
    setState((s) => ({ ...s, selectedTitle: t, step: 'editing' }));
    setLoadingArticle(true);
    try {
      const article = await generateArticle(t.headline, region);
      setState((s) => ({ ...s, article }));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to draft article',
      );
      setState((s) => ({ ...s, step: 'titles', selectedTitle: null }));
    } finally {
      setLoadingArticle(false);
    }
  };

  const handleRegenerateArticle = async () => {
    if (!state.selectedTitle) return;
    setLoadingArticle(true);
    try {
      const article = await generateArticle(state.selectedTitle.headline, region);
      setState((s) => ({ ...s, article }));
      toast.info('Article regenerated');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to regenerate article',
      );
    } finally {
      setLoadingArticle(false);
    }
  };

  const handleBackToTitles = () => {
    setState((s) => ({
      ...s,
      step: 'titles',
      selectedTitle: null,
      article: null,
      featuredImage: null,
    }));
  };

  const handleBackToIdle = () => {
    // Reset the in-flow state (titles, article, image, etc.) but keep the
    // user's region + count selections — they likely want to tweak inputs,
    // not start completely over.
    setState(initialState);
  };

  const handlePublished = (
    result: PublishResult,
    status: 'publish' | 'draft',
  ) => {
    setState((s) => ({
      ...s,
      step: 'published',
      publishResult: result,
      publishStatus: status,
    }));
    toast.success(
      status === 'publish'
        ? 'Published to WordPress'
        : 'Draft saved to WordPress',
    );
  };

  const handlePublishError = (err: string) => {
    toast.error(err);
  };

  const handleStartOver = () => {
    setState(initialState);
  };

  const activeRegion = REGIONS.find((r) => r.value === region)!;

  if (state.step === 'idle') {
    return (
      <div className="mx-auto max-w-3xl py-6 md:py-10">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-card sm:p-8 md:p-10">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
            <Sparkles className="h-4 w-4" />
            <span>Step 1 · Brainstorm</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Generate fresh fashion-news ideas
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-500 sm:text-base">
            We'll scan recent headlines from trusted sources and surface a list
            of draftable angles. Pick a region to focus on.
          </p>

          <div className="mt-8">
            <label className="text-sm font-semibold text-stone-900">
              News region
            </label>
            <div
              role="tablist"
              aria-label="News region"
              className="mt-2 grid grid-cols-2 gap-1 rounded-xl border border-stone-200 bg-stone-50 p-1"
            >
              {REGIONS.map((r) => {
                const active = region === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setRegion(r.value)}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
                      active
                        ? 'bg-white text-stone-900 shadow-soft'
                        : 'text-stone-500 hover:text-stone-700',
                    )}
                  >
                    <span aria-hidden>{r.flag}</span>
                    {r.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-stone-500">
              Sources: {activeRegion.hint}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="flex w-full flex-col gap-1.5 sm:w-28 sm:shrink-0">
              <label
                htmlFor="count"
                className="text-sm font-semibold text-stone-900"
              >
                Count
              </label>
              <input
                id="count"
                type="number"
                min={4}
                max={12}
                value={count}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isNaN(n)) return;
                  setCount(Math.max(4, Math.min(12, n)));
                }}
                className="h-12 w-full rounded-lg border border-stone-200 bg-white px-3 text-base text-stone-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <Button
              size="lg"
              variant="gradient"
              onClick={handleGenerateTitles}
              leftIcon={<Sparkles className="h-5 w-5" />}
              className="h-12 w-full whitespace-nowrap sm:flex-1"
            >
              Generate Titles
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state.step === 'titles') {
    return (
      <div className="mx-auto max-w-5xl py-6 md:py-8">
        <button
          type="button"
          onClick={handleBackToIdle}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-stone-900 md:text-2xl">
                Pick a title to draft
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                Showing{' '}
                <span className="font-medium text-stone-700">
                  {activeRegion.label}
                </span>{' '}
                news. Choose one and we'll write the article.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGenerateTitles}
              loading={loadingTitles}
              leftIcon={<RefreshCw className="h-4 w-4" />}
              aria-label="Regenerate titles"
              className="!px-2 sm:!px-3"
            >
              <span className="hidden sm:inline">Regenerate</span>
            </Button>
          </div>
          <div className="flex">
            <RegionToggle
              value={region}
              onChange={(r) => {
                setRegion(r);
                if (!loadingTitles && r !== region) {
                  fetchTitles(r);
                }
              }}
              disabled={loadingTitles}
            />
          </div>
        </div>
        {loadingTitles ? (
          <TitlesSkeleton />
        ) : (
          <TitleGrid titles={state.titles} onSelect={handleSelectTitle} />
        )}
      </div>
    );
  }

  if (state.step === 'editing') {
    return (
      <div className="mx-auto max-w-6xl py-6 md:py-8">
        {loadingArticle || !state.article ? (
          <ArticleSkeleton />
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="min-w-0 flex-1">
              <ArticleEditor
                article={state.article}
                onChange={(next) =>
                  setState((s) => ({ ...s, article: next }))
                }
              />
            </div>
            <div className="flex shrink-0 flex-col gap-5 lg:w-80">
              <FeaturedImageUploader
                image={state.featuredImage}
                onChange={(img) =>
                  setState((s) => ({ ...s, featuredImage: img }))
                }
              />
              <PublishPanel
                article={state.article}
                featuredImage={state.featuredImage}
                onPublished={handlePublished}
                onError={handlePublishError}
                onRegenerate={handleRegenerateArticle}
              />
              <button
                type="button"
                onClick={handleBackToTitles}
                className="inline-flex items-center gap-1.5 self-start text-sm text-stone-500 transition-colors hover:text-stone-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to titles
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-16">
      <Card className="flex flex-col items-center gap-5 px-8 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-stone-900">
            {state.publishStatus === 'publish'
              ? 'Published to WordPress'
              : 'Saved as draft'}
          </h2>
          {state.publishResult?.message ? (
            <p className="text-sm text-stone-500">
              {state.publishResult.message}
            </p>
          ) : null}
        </div>
        {state.publishResult?.postUrl ? (
          <a
            href={state.publishResult.postUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View on WordPress
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
        <Button variant="secondary" onClick={handleStartOver}>
          Start over
        </Button>
      </Card>
    </div>
  );
}
