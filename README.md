# Automation Hub

Automation Hub is a single-page dashboard that wraps a growing set of in-house, n8n-backed workflows behind one clean UI. The first automation it ships with is **FashionAudit**: an end-to-end assistant that generates article titles, drafts long-form articles in a rich-text editor, attaches a featured image, and (only when you click publish) hands the finished post off to an n8n workflow that pushes it to WordPress. Everything talks to n8n over HTTP webhooks, so the app stays a thin client and all credentials, prompt engineering, and integrations live in your n8n instance.

## Quick start

```bash
npm install
npm run dev
```

The app boots in `mock` mode by default, so you can click through the full FashionAudit flow without any backend running. Open the URL Vite prints (typically `http://localhost:5173`).

## Switching from mock to a real n8n backend

1. Copy `.env.example` to `.env.local`.
2. Edit `.env.local` and set:

   | Variable | What it does |
   | --- | --- |
   | `VITE_API_MODE` | Set to `real` to hit n8n. Anything else (or unset) stays in `mock`. |
   | `VITE_N8N_BASE_URL` | Base URL of your n8n webhooks, no trailing slash (e.g. `https://n8n.example.com/webhook`). |
   | `VITE_N8N_GENERATE_TITLES_PATH` | Path appended to the base URL for the "generate titles" workflow. Defaults to `/generate-titles`. |
   | `VITE_N8N_GENERATE_ARTICLE_PATH` | Path appended to the base URL for the "generate article" workflow. Defaults to `/generate-article`. |
   | `VITE_N8N_PUBLISH_PATH` | Path appended to the base URL for the "publish to WordPress" workflow. Defaults to `/publish`. |

3. Restart `npm run dev` so Vite picks up the new env vars.

## Project structure

```
src/
  components/
    layout/          # DashboardLayout, Sidebar, TopBar, NotFound
    ui/              # Button, Card, Toast/ToastProvider, EmptyState, Spinner, Skeleton
  features/
    fashion-audit/   # FashionAuditView + TitleGrid, ArticleEditor, FeaturedImageUploader, PublishPanel
  lib/
    api/             # config.ts, mock.ts, real.ts, index.ts (picks mock or real based on VITE_API_MODE)
  config/
    automations.ts          # Static metadata for every automation card (id, name, description, icon, route)
    automationRegistry.tsx  # Lazy React.lazy() imports keyed by automation id
```

## Adding a new automation

1. Create the view component at `src/features/<id>/<Name>View.tsx`. It can use anything from `src/components/ui` and call into `src/lib/api`.
2. Add an entry to `src/config/automations.ts` with the id, display name, description, lucide icon, and route.
3. Register the lazy import in `src/config/automationRegistry.tsx` so the router knows how to render it.

The sidebar, dashboard tiles, and routing pick the new automation up automatically from those three touch points.

## Deploying to Vercel or Netlify

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Set the same env vars (`VITE_API_MODE`, `VITE_N8N_BASE_URL`, `VITE_N8N_GENERATE_TITLES_PATH`, `VITE_N8N_GENERATE_ARTICLE_PATH`, `VITE_N8N_PUBLISH_PATH`) in the host's environment-variables UI.

No server-side runtime is required; the build output is a static SPA that calls n8n directly from the browser.

## Notes

- **Publishing is always manual.** Nothing is pushed to WordPress (or anywhere else) until the user explicitly clicks the publish button in the PublishPanel. Title and article generation never publish on their own.
- **WordPress credentials live in n8n, never in this app.** The frontend only knows about the n8n webhook URLs; the WordPress username, application password, site URL, and any other secrets are configured inside the n8n workflow nodes. Do not put WP credentials in `.env.local` or anywhere else in this repo.
