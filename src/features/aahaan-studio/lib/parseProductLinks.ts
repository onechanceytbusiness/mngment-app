import type { ProductLink } from '@/lib/types';

/**
 * Parse the product-links textarea into a clean ProductLink[].
 * Each non-empty line is split on the first " | " (or just "|" with
 * forgiving whitespace) into [label, url]. Lines without a URL are
 * silently dropped — the editor shouldn't fight the user, but it
 * also shouldn't write garbage to the DB.
 */
export function parseProductLinks(text: string): ProductLink[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const pipe = line.indexOf('|');
      if (pipe === -1) {
        // No separator — treat the whole line as a URL with no label.
        return { label: '', url: line };
      }
      return {
        label: line.slice(0, pipe).trim(),
        url: line.slice(pipe + 1).trim(),
      };
    })
    .filter((p) => p.url.length > 0);
}

export function stringifyProductLinks(links: ProductLink[]): string {
  return links
    .map((l) => (l.label ? `${l.label} | ${l.url}` : l.url))
    .join('\n');
}

/** Product-images textarea: one URL per line. */
export function parseProductImages(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function stringifyProductImages(images: string[]): string {
  return images.join('\n');
}
