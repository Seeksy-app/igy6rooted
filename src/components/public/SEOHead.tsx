import { Helmet } from "react-helmet-async";

const SITE_URL = "https://igy6rooted.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.jpg`;
const SITE_NAME = "IGY6 Rooted";

interface SEOHeadProps {
  /** <title> tag — keep under 60 chars including brand */
  title: string;
  /** <meta description> — keep 140-160 chars */
  description: string;
  /** Path-only canonical (e.g. "/about"). Will be prefixed with SITE_URL. */
  path: string;
  /** Absolute or root-relative OG/Twitter image URL. Defaults to branded default. */
  image?: string;
  /** Override OG title (defaults to title). */
  ogTitle?: string;
  /** Override OG description (defaults to description). */
  ogDescription?: string;
  /** Page type for Open Graph (default "website"). Use "article" for blog posts. */
  type?: "website" | "article";
  /** Set to "noindex,nofollow" to keep page out of search. */
  robots?: string;
  /** Optional JSON-LD structured data object. */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

/**
 * Centralized SEO head: title, description, canonical, Open Graph, Twitter,
 * and optional JSON-LD. Use on every public page.
 */
export function SEOHead({
  title,
  description,
  path,
  image,
  ogTitle,
  ogDescription,
  type = "website",
  robots = "index,follow",
  jsonLd,
}: SEOHeadProps) {
  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const resolvedImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`
    : DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={ogTitle ?? title} />
      <meta property="og:description" content={ogDescription ?? description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={ogTitle ?? title} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle ?? title} />
      <meta name="twitter:description" content={ogDescription ?? description} />
      <meta name="twitter:image" content={resolvedImage} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
