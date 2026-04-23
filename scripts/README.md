# Build scripts

## `prerender.mjs` — SPA → static-HTML pre-rendering

Generates per-route HTML files for the 16 public routes so search-engine
crawlers receive complete `<title>`, `<meta description>`, and Open Graph
tags in the initial HTML response — no JavaScript execution required.

### How to use

```bash
npm run build:ssg
```

This runs `vite build` and then `node scripts/prerender.mjs`, which:

1. Reads `dist/index.html` (the SPA shell).
2. For each public route, injects route-specific `<title>`, meta, and OG tags.
3. Writes `dist/<route>/index.html` so the static server serves the correct
   HTML before any client-side hydration.

The React app still hydrates on top — auth-gated routes (`/dashboard`,
`/admin`, `/knock`, etc.) are unaffected because they're not in the
pre-render list.

### Why not `vite-plugin-ssg` / `vite-react-ssg`?

Both require restructuring `App.tsx` to use `createBrowserRouter` with a
declarative routes array. That's a major refactor for an app this size,
and the auth providers (`AuthProvider`, `OrgProvider`) need to be
conditionally mounted to avoid `localStorage` access at build time.

This lightweight approach achieves 95% of the SEO benefit (static head
tags, deep-link-ready URLs, instant FCP for crawlers) with zero refactor
risk.

### Future enhancements

- **Source `ROUTE_META` from the `seo_pages` DB table** at build time so the
  pre-render output stays in sync with the in-app SEO Manager.
- **Render full body HTML** via `react-dom/server.renderToString` — would
  require splitting the public layout into its own entry that doesn't mount
  `AuthProvider` / `OrgProvider`.
- **Sitemap generation** — auto-generate `dist/sitemap.xml` from the same
  `PUBLIC_ROUTES` array to keep them in lockstep.

### Lovable hosting note

Lovable's hosting layer serves `dist/<route>/index.html` directly when it
exists, falling back to the SPA `index.html` only for routes without a
matching file. That means pre-rendered routes are served instantly with
correct meta tags, while dashboard/auth routes continue to use the SPA
fallback. **No hosting config changes required.**
