import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { SEOHead } from "@/components/public/SEOHead";
import { BLOG_BY_SLUG } from "@/data/blog";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Phone } from "lucide-react";

interface DbPost {
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  author_display: string | null;
  published_at: string | null;
  tags: string[];
  status: string;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const staticPost = slug ? BLOG_BY_SLUG[slug] : undefined;

  const [dbPost, setDbPost] = useState<DbPost | null>(null);
  const [loading, setLoading] = useState(!staticPost);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Fetch from DB only when there's no static post
  useEffect(() => {
    if (staticPost || !slug) return;
    setLoading(true);
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDbPost(data as DbPost);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      });
  }, [slug, staticPost]);

  // --- Static post path (existing behaviour) ---
  if (staticPost) {
    const related = staticPost.related
      .map((s) => BLOG_BY_SLUG[s])
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: staticPost.title,
      description: staticPost.excerpt,
      author: { "@type": "Organization", name: "IGY6 Rooted" },
      publisher: {
        "@type": "Organization",
        name: "IGY6 Rooted",
        logo: { "@type": "ImageObject", url: "https://igy6rooted.lovable.app/logo.png" },
      },
    };

    return (
      <>
        <SEOHead
          title={`${staticPost.title} | IGY6 Rooted`}
          description={staticPost.excerpt}
          path={`/blog/${staticPost.slug}`}
          type="article"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />

        {/* Hero */}
        <section className="relative bg-[hsl(82,25%,22%)] text-white overflow-hidden">
          <img src={staticPost.image} alt="" aria-hidden="true" loading="eager" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, hsla(82,25%,15%,0.85), hsla(82,25%,18%,0.78), hsla(82,25%,15%,0.85))' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" /> All articles
            </Link>
            <div className="flex items-center gap-3 text-xs font-semibold text-[hsl(82,40%,80%)] uppercase tracking-wider mb-4">
              <span>{staticPost.category}</span>
              <span className="text-white/30">·</span>
              <span className="flex items-center gap-1 text-white/70"><Clock className="h-3 w-3" />{staticPost.readMinutes} min read</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 max-w-3xl">{staticPost.title}</h1>
            <p className="text-xl text-white/85 max-w-2xl">{staticPost.excerpt}</p>
          </div>
        </section>

        {/* Did-you-know */}
        <section className="bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12">
            <div className="bg-[hsl(82,15%,95%)] border-l-4 border-[hsl(82,30%,40%)] rounded-r-lg p-5 sm:p-6">
              <p className="text-[hsl(82,25%,25%)] text-base sm:text-lg font-medium leading-snug">
                <span className="font-bold">Did you know:</span> {staticPost.fact}
              </p>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="grid lg:grid-cols-3 gap-12">
              <article className="lg:col-span-2 space-y-8">
                <p className="text-lg text-[hsl(82,15%,30%)] leading-relaxed">{staticPost.intro}</p>
                <figure className="my-2">
                  <img src={staticPost.image} alt={staticPost.imageAlt} width={800} height={450} loading="lazy" decoding="async" className="w-full aspect-[16/9] object-cover rounded-xl shadow-md border border-[hsl(82,15%,90%)]" />
                </figure>
                {staticPost.sections.map((s) => (
                  <div key={s.heading}>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(82,25%,18%)] mb-4">{s.heading}</h2>
                    <p className="text-[hsl(82,10%,30%)] leading-relaxed whitespace-pre-line">{s.body}</p>
                  </div>
                ))}
                {staticPost.faqs.length > 0 && (
                  <div className="pt-6 border-t border-[hsl(82,15%,90%)]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(82,25%,18%)] mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-5">
                      {staticPost.faqs.map((f) => (
                        <div key={f.q} className="bg-[hsl(82,10%,97%)] rounded-lg p-5 border border-[hsl(82,15%,92%)]">
                          <h3 className="font-bold text-[hsl(82,25%,20%)] mb-2">{f.q}</h3>
                          <p className="text-sm text-[hsl(82,10%,35%)] leading-relaxed">{f.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
              <Sidebar />
            </div>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="bg-[hsl(82,10%,96%)] border-t border-[hsl(82,15%,90%)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <h2 className="text-2xl font-bold text-[hsl(82,25%,18%)] mb-8">Keep reading</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((r) => (
                  <Link key={r.slug} to={`/blog/${r.slug}`} className="group bg-white rounded-xl overflow-hidden border border-[hsl(82,15%,90%)] hover:border-[hsl(82,30%,50%)] hover:shadow-lg transition-all">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={r.image} alt={r.imageAlt} width={800} height={600} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-[hsl(82,25%,18%)] group-hover:text-[hsl(82,30%,32%)] transition-colors leading-snug">{r.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </>
    );
  }

  // --- Dynamic DB post path ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse text-[hsl(82,25%,40%)] text-lg">Loading article…</div>
      </div>
    );
  }

  if (notFound || !dbPost) {
    return <Navigate to="/blog" replace />;
  }

  const estimatedRead = Math.max(1, Math.ceil((dbPost.content?.length || 0) / 1200));
  const heroImage = dbPost.featured_image || "";
  const firstTag = dbPost.tags?.[0] || "Article";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: dbPost.title,
    description: dbPost.excerpt || "",
    author: { "@type": "Organization", name: "IGY6 Rooted" },
    publisher: {
      "@type": "Organization",
      name: "IGY6 Rooted",
      logo: { "@type": "ImageObject", url: "https://igy6rooted.lovable.app/logo.png" },
    },
  };

  return (
    <>
      <SEOHead
        title={`${dbPost.title} | IGY6 Rooted`}
        description={dbPost.excerpt || ""}
        path={`/blog/${dbPost.slug}`}
        type="article"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Hero */}
      <section className="relative bg-[hsl(82,25%,22%)] text-white overflow-hidden">
        {heroImage && (
          <img src={heroImage} alt="" aria-hidden="true" loading="eager" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, hsla(82,25%,15%,0.85), hsla(82,25%,18%,0.78), hsla(82,25%,15%,0.85))' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> All articles
          </Link>
          <div className="flex items-center gap-3 text-xs font-semibold text-[hsl(82,40%,80%)] uppercase tracking-wider mb-4">
            <span>{firstTag}</span>
            <span className="text-white/30">·</span>
            <span className="flex items-center gap-1 text-white/70"><Clock className="h-3 w-3" />{estimatedRead} min read</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 max-w-3xl">{dbPost.title}</h1>
          {dbPost.excerpt && <p className="text-xl text-white/85 max-w-2xl">{dbPost.excerpt}</p>}
        </div>
      </section>

      {/* Body — render raw HTML from Empowerify */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            <article className="lg:col-span-2">
              {/* Featured image in body top-third */}
              {heroImage && (
                <figure className="mb-8">
                  <img src={heroImage} alt={dbPost.title} width={800} height={450} loading="lazy" decoding="async" className="w-full aspect-[16/9] object-cover rounded-xl shadow-md border border-[hsl(82,15%,90%)]" />
                </figure>
              )}
              <div
                className="prose prose-lg max-w-none prose-headings:text-[hsl(82,25%,18%)] prose-p:text-[hsl(82,10%,30%)] prose-a:text-[hsl(82,40%,35%)] prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: dbPost.content }}
              />
            </article>
            <Sidebar />
          </div>
        </div>
      </section>
    </>
  );
}

/* Shared sidebar CTA */
function Sidebar() {
  return (
    <aside className="space-y-6">
      <div className="bg-[hsl(82,25%,28%)] rounded-xl p-6 text-white sticky top-24">
        <h3 className="font-bold text-lg mb-2">Get a free estimate</h3>
        <p className="text-sm text-white/85 leading-snug mb-5">Let us help you prepare for the next storm — quick, no-pressure quote from a local veteran-owned crew.</p>
        <a
          href="https://clienthub.getjobber.com/hubs/098c4d0e-40ac-4280-b8c9-70e5a93704f7/public/requests/2162555/new"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-white text-[hsl(82,25%,25%)] px-5 py-3 rounded-lg font-bold hover:bg-white/90 transition-colors mb-3"
        >
          Get Free Estimate <ArrowRight className="h-4 w-4" />
        </a>
        <a
          href="tel:+15182650275"
          className="flex items-center justify-center gap-2 border border-white/40 text-white px-5 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
        >
          <Phone className="h-4 w-4" />
          (518) 265-0275
        </a>
      </div>

      <div className="bg-[hsl(82,10%,97%)] rounded-xl p-6 border border-[hsl(82,15%,92%)]">
        <h3 className="font-bold text-[hsl(82,25%,20%)] mb-4">Why IGY6 Rooted</h3>
        <ul className="space-y-3 text-sm text-[hsl(82,10%,35%)]">
          {[
            "Veteran-owned & operated",
            "Fully insured (GL + workers' comp)",
            "Free written estimates",
            "Local crew — Niceville, FL",
            "24/7 emergency response",
          ].map((b) => (
            <li key={b} className="flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 text-[hsl(82,40%,40%)] shrink-0 mt-0.5" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
