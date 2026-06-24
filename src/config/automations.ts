import type { AutomationDef } from '@/lib/types';

/**
 * Registry of automations shown on the hub home screen.
 *
 * To add a new automation:
 *   1. Build the feature under `src/features/<id>/`.
 *   2. Add a lazy import for it in `src/config/automationRegistry.tsx`.
 *   3. Add an entry here. Example:
 *
 *      {
 *        id: 'invoice-extractor',
 *        name: 'Invoice Extractor',
 *        description: 'Parse PDF invoices into structured rows',
 *        icon: 'Receipt',
 *        status: 'active',
 *      }
 */
export const automations: AutomationDef[] = [
  {
    id: 'fashion-audit',
    name: 'FA Blog Automation',
    description:
      'Manual drafts and a live inbox of high-priority stories — review and publish to WordPress.',
    icon: 'Newspaper',
    status: 'active',
  },
  {
    id: 'fa-deals',
    name: 'FA Deals Automation',
    description:
      'Find, convert, and post product deals to your Telegram channels — review and publish.',
    icon: 'Tag',
    status: 'active',
  },
];
