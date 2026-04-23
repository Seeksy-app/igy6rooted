import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/public/SEOHead";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

interface PageContent {
  sections?: { heading: string; content: string }[];
  benefits?: string[];
  cta?: { text: string; url: string };
}

export default function ArticlePage() {
  const { slug } = useParams();
  const routePath = `/articles/${slug}`;

  // Try /articles/:slug first, then fall back to /services/:slug
  const { data: page, isLoading } = useQuery({
    queryKey: ["public-article", slug],
    queryFn: async () => {
      // Try articles path first
      let { data } = await supabase
        .from("seo_pages")
        .select("*")
        .eq("route_path", routePath)
        .eq("status", "published")
        .maybeSingle();

      if (!data) {
        // Fall back to services path
        const servicePath = `/services/${slug}`;
        const res = await supabase
          .from("seo_pages")
          .select("*")
          .eq("route_path", servicePath)
          .eq("status", "published")
          .maybeSingle();
        data = res.data;
      }

      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!page || !page.page_content) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">This article doesn't exist or hasn't been published yet.</p>
        <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const content = page.page_content as PageContent;
  const publishedUrl = "https://igy6rooted.lovable.app";

  return (
    <>
      <SEOHead
        title={page.meta_title || `${page.page_name} | IGY6 Rooted`}
        description={
          page.meta_description ||
          `${page.page_name} — guidance from IGY6 Rooted, veteran-owned tree service in Northwest Florida.`
        }
        path={page.route_path || `/articles/${slug}`}
        image={page.og_image_url || "/og/default.jpg"}
        ogTitle={page.og_title || undefined}
        ogDescription={page.og_description || undefined}
        type="article"
        robots={page.robots || "index,follow"}
      />

      {/* Hero */}
      <section className="bg-[hsl(82,25%,22%)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            All Services
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            {page.h1_override || page.page_name}
          </h1>
          {page.meta_description && (
            <p className="text-xl text-white/80 max-w-2xl">{page.meta_description}</p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {content.sections?.map((s, i) => (
                <div key={i}>
                  <h2 className="text-2xl font-bold text-[hsl(82,25%,20%)] mb-4">{s.heading}</h2>
                  <p className="text-[hsl(82,10%,40%)] leading-relaxed whitespace-pre-line">{s.content}</p>
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {content.cta && (
                <div className="bg-[hsl(82,25%,28%)] rounded-xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-3">Get Started</h3>
                  <a
                    href={content.cta.url}
                    className="flex items-center justify-center gap-2 bg-white text-[hsl(82,25%,25%)] px-6 py-3 rounded-lg font-bold hover:bg-white/90 transition-colors"
                  >
                    {content.cta.text}
                  </a>
                </div>
              )}

              {content.benefits && content.benefits.length > 0 && (
                <div className="bg-[hsl(82,10%,96%)] rounded-xl p-6 border border-[hsl(82,15%,92%)]">
                  <h3 className="font-bold text-[hsl(82,25%,20%)] mb-4">Why IGY6 Rooted?</h3>
                  <div className="space-y-3">
                    {content.benefits.map((b) => (
                      <div key={b} className="flex items-start gap-2.5">
                        <CheckCircle className="h-4 w-4 text-[hsl(82,40%,40%)] shrink-0 mt-0.5" />
                        <span className="text-sm text-[hsl(82,10%,40%)]">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
