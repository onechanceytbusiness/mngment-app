import { useState } from 'react';
import { Send, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { publish } from '@/lib/api';
import type { Article, PublishResult } from '@/lib/types';

export interface PublishPanelProps {
  article: Article;
  featuredImage: string | null;
  onPublished: (result: PublishResult, status: 'publish' | 'draft') => void;
  onError: (err: string) => void;
  /**
   * Optional. When provided, a third "Regenerate" button is rendered.
   * Live-alerts editor omits this since n8n produced the draft and a
   * client-side regenerate has no meaning there.
   */
  onRegenerate?: () => void;
  regenerateLabel?: string;
}

type Pending = 'publish' | 'draft' | null;

export function PublishPanel({
  article,
  featuredImage,
  onPublished,
  onError,
  onRegenerate,
  regenerateLabel,
}: PublishPanelProps) {
  const [pending, setPending] = useState<Pending>(null);

  const run = async (status: 'publish' | 'draft') => {
    setPending(status);
    try {
      const result = await publish({
        title: article.title,
        content_html: article.content_html,
        excerpt: article.excerpt,
        featuredImage,
        status,
      });
      if (!result.ok) {
        onError(result.message ?? 'Publish failed');
        return;
      }
      onPublished(result, status);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPending(null);
    }
  };

  const titleEmpty = article.title.trim().length === 0;
  const anyPending = pending !== null;

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium text-stone-700">Publish</div>
      <Button
        variant="primary"
        size="md"
        loading={pending === 'publish'}
        disabled={titleEmpty || anyPending}
        leftIcon={<Send className="h-4 w-4" />}
        onClick={() => run('publish')}
      >
        Publish to WordPress
      </Button>
      <Button
        variant="secondary"
        size="md"
        loading={pending === 'draft'}
        disabled={anyPending}
        leftIcon={<Save className="h-4 w-4" />}
        onClick={() => run('draft')}
      >
        Save as Draft
      </Button>
      {onRegenerate ? (
        <Button
          variant="ghost"
          size="md"
          disabled={anyPending}
          leftIcon={<RotateCcw className="h-4 w-4" />}
          onClick={onRegenerate}
        >
          {regenerateLabel ?? 'Regenerate article'}
        </Button>
      ) : null}
    </div>
  );
}

export default PublishPanel;
