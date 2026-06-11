import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

/**
 * Maps an automation id to its lazy-loaded view component.
 *
 * Downstream feature agents create the actual component at
 * `src/features/<id>/<Name>View.tsx`. The dynamic import below
 * is intentionally written with @vite-ignore so the build does
 * not fail if a referenced feature module has not been scaffolded
 * yet during development.
 */
const registry: Record<string, LazyExoticComponent<ComponentType>> = {
  'fashion-audit': lazy(() => import('@/features/fashion-audit/FashionAuditView')),
  'fa-deals': lazy(() => import('@/features/fa-deals/FaDealsView')),
  'aahaan-studio': lazy(() => import('@/features/aahaan-studio/AahaanStudioView')),
};

export function getAutomationComponent(
  id: string,
): LazyExoticComponent<ComponentType> | undefined {
  return registry[id];
}
