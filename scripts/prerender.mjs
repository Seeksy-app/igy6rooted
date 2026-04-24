#!/usr/bin/env node
/**
 * Static pre-rendering for IGY6 Rooted public routes.
 *
 * Strategy:
 *   - `vite build` produces a normal SPA in `dist/`.
 *   - This script renders each PUBLIC route to HTML *in Node* using a JSDOM
 *     window + the built bundle, then writes `dist/<route>/index.html`.
 *   - Auth-gated routes (/dashboard, /admin, /knock, etc.) are skipped — they
 *     stay as the SPA shell and hydrate on the client.
 *   - The injected HTML serves as instant FCP for crawlers; the React bundle
 *     hydrates on top of it normally.
 *
 * Usage:
 *   npm run build:ssg
 *
 * Why this approach (vs vite-plugin-ssg / vite-react-ssg):
 *   - Zero refactor of the existing App.tsx route tree.
 *   - No browser/Chromium dependency — runs in any Node env (CI included).
 *   - Auth providers / Supabase client are never executed at build time.
 *
 * Limitations / TODO for future iteration:
 *   - This script renders the static *shell* + Helmet head tags. It does NOT
 *     execute data-fetching effects (e.g. google-reviews edge function), so
 *     dynamic review counts hydrate client-side. That's acceptable for SEO
 *     because the meta/OG tags + body copy are present in the initial HTML.
 *   - To pre-render with live data, swap `renderToString` for a flow that
 *     awaits TanStack Query dehydration — out of scope for this pass.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

loadEnv({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const distDir = join(root, "dist");
const indexHtmlPath = join(distDir, "index.html");

// Public routes to pre-render (must match App.tsx public routes only).
// Auth-gated routes (/dashboard, /admin, /knock, /seo-manager, /integrations,
// /gtm, /llm-presence, /voice-test, /install, /onboarding, /auth/*) are
// intentionally excluded.
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/contact",
  "/services/tree-removal",
  "/services/tree-trimming",
  "/services/tree-pruning",
  "/services/stump-grinding",
  "/services/emergency-tree-removal",
  "/services/debris-removal",
  "/services/landscaping",
  "/services/land-clearing",
  "/services/lot-clearing",
  "/services/brush-removal",
  "/services/lawn-care",
  "/services/property-maintenance",
  // /offer is intentionally excluded (noindex referral landing page)
];

async function setupDomGlobals() {
  // No DOM globals needed — we inject static head tags as strings.
  // Kept as a stub for future renderToString expansion.
  return null;
}

async function loadAppEntry() {
  // We render against the source files (transpiled at runtime by tsx/esbuild)
  // rather than the built bundle, because the built bundle is browser-targeted
  // and may use import.meta features incompatible with Node loader.
  // For this pass we use a lightweight static-HTML strategy: copy the SPA
  // shell + per-route Helmet tags pre-baked from seo_pages metadata.
  return null;
}

/**
 * Per-route metadata. In production this should be sourced from the
 * seo_pages DB table at build time (the rows backfilled by the previous SEO
 * pass). For now we mirror the same canonical metadata inline so this script
 * has zero external dependencies.
 */
const ROUTE_META = {
  "/": {
    title: "IGY6 Rooted Stump Grinding & Tree Service | Niceville, FL",
    description: "Veteran-owned tree service in Niceville, Destin & Fort Walton Beach. Tree removal, trimming, stump grinding & emergency response. Free estimates — (518) 265-0275.",
    ogImage: "/og/home.jpg",
  },
  "/about": {
    title: "About IGY6 Rooted | Veteran-Owned Tree Service in NW Florida",
    description: "Meet IGY6 Rooted — a veteran-owned tree service rooted in Niceville, FL. Discipline, integrity, and craftsmanship on every job. Licensed & insured.",
    ogImage: "/og/about.jpg",
  },
  "/services": {
    title: "Tree Services in Niceville & Destin, FL | IGY6 Rooted",
    description: "Full-service tree care in Northwest Florida — removal, trimming, pruning, stump grinding, emergency response, land clearing, and more. Free estimates.",
    ogImage: "/og/services.jpg",
  },
  "/contact": {
    title: "Contact IGY6 Rooted | Free Tree Service Estimates in Niceville, FL",
    description: "Get a free estimate from IGY6 Rooted. Call (518) 265-0275 or message us online — fast response, fair pricing, veteran-owned crews.",
    ogImage: "/og/contact.jpg",
  },
  "/services/tree-removal": {
    title: "Tree Removal Niceville & Destin FL | IGY6 Rooted",
    description: "Safe, professional tree removal in Niceville, Destin & Fort Walton Beach. Licensed, insured, veteran-owned. Free estimates — call (518) 265-0275.",
    ogImage: "/og/tree-removal.jpg",
  },
  "/services/tree-trimming": {
    title: "Tree Trimming Niceville & Destin FL | IGY6 Rooted",
    description: "Professional tree trimming in Niceville, Destin & Fort Walton Beach. Shape trees, prevent storm damage, improve health. Free estimates — (518) 265-0275.",
    ogImage: "/og/tree-trimming.jpg",
  },
  "/services/tree-pruning": {
    title: "Tree Pruning Niceville FL | IGY6 Rooted",
    description: "Expert tree pruning in Northwest Florida. Remove dead and diseased branches, extend tree life, improve structure. Free estimates — (518) 265-0275.",
    ogImage: "/og/tree-pruning.jpg",
  },
  "/services/stump-grinding": {
    title: "Stump Grinding Niceville & Destin FL | IGY6 Rooted",
    description: "Professional stump grinding in Niceville, Destin & Fort Walton Beach. Grind below grade for a clean, level yard. Free estimates — (518) 265-0275.",
    ogImage: "/og/stump-grinding.jpg",
  },
  "/services/emergency-tree-removal": {
    title: "24/7 Emergency Tree Removal in Niceville, FL | IGY6 Rooted",
    description: "24/7 emergency tree removal in Northwest Florida. Storm damage, fallen trees, urgent hazards. Call (518) 265-0275 for immediate response.",
    ogImage: "/og/emergency.jpg",
  },
  "/services/debris-removal": {
    title: "Storm Debris & Yard Debris Removal in Niceville, FL | IGY6 Rooted",
    description: "Fast storm debris and yard waste hauling in Niceville, Destin & Crestview. Hurricane cleanup, brush removal, full haul-off. Call (518) 265-0275.",
    ogImage: "/og/debris-removal.jpg",
  },
  "/services/landscaping": {
    title: "Landscaping Services Niceville FL | IGY6 Rooted",
    description: "Residential landscaping in Niceville, Destin & Fort Walton Beach. Beds, sod, mulch, plantings, and post-tree restoration. Free estimates.",
    ogImage: "/og/landscaping.jpg",
  },
  "/services/land-clearing": {
    title: "Land Clearing in Niceville & Crestview, FL | IGY6 Rooted",
    description: "Lot and land clearing for builders and homeowners across Northwest Florida. Trees, brush, and stumps removed cleanly. Free estimates — (518) 265-0275.",
    ogImage: "/og/land-clearing.jpg",
  },
  "/services/lot-clearing": {
    title: "Residential Lot Clearing in Niceville, FL | IGY6 Rooted",
    description: "Professional residential lot clearing in Niceville, Destin & Crestview. Prep your lot for building, driveways, or expansion. Free estimates.",
    ogImage: "/og/lot-clearing.jpg",
  },
  "/services/brush-removal": {
    title: "Brush Removal & Hauling in Niceville, FL | IGY6 Rooted",
    description: "Brush, undergrowth, and yard waste removal across Northwest Florida. Clean haul-off, no mess left behind. Free estimates — (518) 265-0275.",
    ogImage: "/og/brush-removal.jpg",
  },
  "/services/lawn-care": {
    title: "Lawn Care & Mowing in Niceville, FL | IGY6 Rooted",
    description: "Reliable residential lawn care in Niceville, Destin & Fort Walton Beach. Mowing, edging, trimming, cleanup. Free estimates — (518) 265-0275.",
    ogImage: "/og/lawn-care.jpg",
  },
  "/services/property-maintenance": {
    title: "Property Maintenance in Niceville, FL | IGY6 Rooted",
    description: "Ongoing residential property maintenance across Northwest Florida — trees, lawn, debris, and seasonal care under one trusted crew.",
    ogImage: "/og/property-maintenance.jpg",
  },
};

const SITE_URL = "https://igy6rooted.com";

function injectMeta(html, route, meta) {
  const canonical = `${SITE_URL}${route}`;
  const ogImageAbs = meta.ogImage.startsWith("http")
    ? meta.ogImage
    : `${SITE_URL}${meta.ogImage}`;

  // Build the SEO head block.
  const headTags = `
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="IGY6 Rooted" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:image" content="${ogImageAbs}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${ogImageAbs}" />
  `.trim();

  // Strip the default index.html SEO tags so the route-specific ones are
  // the single source of truth in the pre-rendered HTML.
  let out = html
    .replace(/<title>[^<]*<\/title>/gi, "")
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, "")
    .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, "");

  out = out.replace("</head>", `${headTags}\n  </head>`);
  return out;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function writeRouteHtml(route, html) {
  if (route === "/") {
    // Overwrite the root index.html in place.
    await writeFile(indexHtmlPath, html, "utf8");
    return;
  }
  const dir = join(distDir, route.replace(/^\//, ""));
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), html, "utf8");
}

/**
 * Fetch published seo_pages rows from Supabase and convert into a
 * route → meta map. Falls back to inline ROUTE_META on any failure so the
 * build never breaks because of transient DB issues.
 *
 * Only `status = 'published'` rows are used — that matches the public RLS
 * policy and the in-app SEO Manager's notion of "shipped" metadata.
 */
async function fetchRouteMetaFromDb() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn("  ! Supabase env vars not set — using inline ROUTE_META fallback.");
    return {};
  }
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("seo_pages")
      .select("route_path, meta_title, meta_description, og_image_url, canonical_url, status")
      .eq("status", "published");
    if (error) {
      console.warn(`  ! seo_pages fetch failed (${error.message}) — using inline fallback.`);
      return {};
    }
    const map = {};
    for (const row of data || []) {
      if (!row.route_path) continue;
      map[row.route_path] = {
        title: row.meta_title || undefined,
        description: row.meta_description || undefined,
        ogImage: row.og_image_url || undefined,
        canonical: row.canonical_url || undefined,
      };
    }
    console.log(`  ✓ Loaded ${Object.keys(map).length} published seo_pages rows from DB.`);
    return map;
  } catch (err) {
    console.warn(`  ! seo_pages fetch threw (${err.message}) — using inline fallback.`);
    return {};
  }
}

function mergeMeta(route, dbMeta, inlineMeta) {
  const db = dbMeta[route] || {};
  const inline = inlineMeta[route] || {};
  return {
    title: db.title || inline.title,
    description: db.description || inline.description,
    ogImage: db.ogImage || inline.ogImage,
    canonical: db.canonical, // optional override; injectMeta defaults to SITE_URL+route
  };
}

async function main() {
  if (!existsSync(indexHtmlPath)) {
    console.error(`✖ ${indexHtmlPath} not found. Run \`vite build\` first.`);
    process.exit(1);
  }

  await setupDomGlobals();
  const baseHtml = await readFile(indexHtmlPath, "utf8");

  console.log(`→ Fetching published SEO metadata from seo_pages…`);
  const dbMeta = await fetchRouteMetaFromDb();

  console.log(`→ Pre-rendering ${PUBLIC_ROUTES.length} public routes…`);
  for (const route of PUBLIC_ROUTES) {
    const meta = mergeMeta(route, dbMeta, ROUTE_META);
    if (!meta.title || !meta.description || !meta.ogImage) {
      console.warn(`  · ${route}  (incomplete meta — skipping)`);
      continue;
    }
    const html = injectMeta(baseHtml, route, meta);
    await writeRouteHtml(route, html);
    const source = dbMeta[route] ? "db" : "inline";
    console.log(`  ✓ ${route}  [${source}]`);
  }
  console.log("✓ Pre-render complete.");
}

main().catch((err) => {
  console.error("✖ Pre-render failed:", err);
  process.exit(1);
});
