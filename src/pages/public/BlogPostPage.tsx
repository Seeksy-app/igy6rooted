import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { SEOHead } from "@/components/public/SEOHead";
import { BLOG_BY_SLUG, BLOG_POSTS } from "@/data/blog";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Phone } from "lucide-react";

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = slug ? BLOG_BY_SLUG[slug] : undefined;

  // Always anchor article landings to the top of the page, not the user's
  // previous scroll position from the home grid.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const related = post.related
    .map((s) => BLOG_BY_SLUG[s])
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  // JSON-LD Article schema for SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
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
        title={`${post.title} | IGY6 Rooted`}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        type="article"
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Hero — green banner with faded background image + dark overlay */}
      <section className="relative bg-[hsl(82,25%,22%)] text-white overflow-hidden">
        <img
          src={post.image}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, hsla(82,25%,15%,0.85), hsla(82,25%,18%,0.78), hsla(82,25%,15%,0.85))',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            All articles
          </Link>
          <div className="flex items-center gap-3 text-xs font-semibold text-[hsl(82,40%,80%)] uppercase tracking-wider mb-4">
            <span>{post.category}</span>
            <span className="text-white/30">·</span>
            <span className="flex items-center gap-1 text-white/70">
              <Clock className="h-3 w-3" />
              {post.readMinutes} min read
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 max-w-3xl">
            {post.title}
          </h1>
          <p className="text-xl text-white/85 max-w-2xl">{post.excerpt}</p>
        </div>
      </section>

      {/* Did-you-know callout (image moved down into body) */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12">
          <div className="bg-[hsl(82,15%,95%)] border-l-4 border-[hsl(82,30%,40%)] rounded-r-lg p-5 sm:p-6">
            <p className="text-[hsl(82,25%,25%)] text-base sm:text-lg font-medium leading-snug">
              <span className="font-bold">Did you know:</span> {post.fact}
            </p>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            <article className="lg:col-span-2 space-y-8">
              <p className="text-lg text-[hsl(82,15%,30%)] leading-relaxed">{post.intro}</p>

              {/* Featured image — placed in the top third of the article body */}
              <figure className="my-2">
                <img
                  src={post.image}
                  alt={post.imageAlt}
                  width={800}
                  height={450}
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-[16/9] object-cover rounded-xl shadow-md border border-[hsl(82,15%,90%)]"
                />
              </figure>

              {post.sections.map((s) => (
                <div key={s.heading}>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(82,25%,18%)] mb-4">{s.heading}</h2>
                  <p className="text-[hsl(82,10%,30%)] leading-relaxed whitespace-pre-line">{s.body}</p>
                </div>
              ))}

              {/* FAQs */}
              {post.faqs.length > 0 && (
                <div className="pt-6 border-t border-[hsl(82,15%,90%)]">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(82,25%,18%)] mb-6">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-5">
                    {post.faqs.map((f) => (
                      <div key={f.q} className="bg-[hsl(82,10%,97%)] rounded-lg p-5 border border-[hsl(82,15%,92%)]">
                        <h3 className="font-bold text-[hsl(82,25%,20%)] mb-2">{f.q}</h3>
                        <p className="text-sm text-[hsl(82,10%,35%)] leading-relaxed">{f.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Sidebar */}
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
                <Link
                  key={r.slug}
                  to={`/blog/${r.slug}`}
                  className="group bg-white rounded-xl overflow-hidden border border-[hsl(82,15%,90%)] hover:border-[hsl(82,30%,50%)] hover:shadow-lg transition-all"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={r.image}
                      alt={r.imageAlt}
                      width={800}
                      height={600}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[hsl(82,25%,18%)] group-hover:text-[hsl(82,30%,32%)] transition-colors leading-snug">
                      {r.title}
                    </h3>
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
