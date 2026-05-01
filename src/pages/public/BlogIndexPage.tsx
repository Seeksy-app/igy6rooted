import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/public/SEOHead";
import { BLOG_POSTS } from "@/data/blog";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Clock, BookOpen, Search } from "lucide-react";

const ALL = "All" as const;

interface UnifiedPost {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  category: string;
  readMinutes: number;
  source: "static" | "db";
}

export default function BlogIndexPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [dbPosts, setDbPosts] = useState<UnifiedPost[]>([]);

  // Fetch DB posts once
  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("slug, title, excerpt, featured_image, tags, content, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        // Only include posts that don't already exist in static data
        const staticSlugs = new Set(BLOG_POSTS.map((p) => p.slug));
        const mapped: UnifiedPost[] = data
          .filter((d) => !staticSlugs.has(d.slug))
          .map((d) => ({
            slug: d.slug,
            title: d.title,
            excerpt: d.excerpt || "",
            image: d.featured_image || "",
            imageAlt: d.title,
            category: d.tags?.[0] || "Article",
            readMinutes: Math.max(1, Math.ceil((d.content?.length || 0) / 1200)),
            source: "db" as const,
          }));
        setDbPosts(mapped);
      });
  }, []);

  const staticUnified: UnifiedPost[] = useMemo(
    () =>
      BLOG_POSTS.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        image: p.image,
        imageAlt: p.imageAlt,
        category: p.category,
        readMinutes: p.readMinutes,
        source: "static" as const,
      })),
    []
  );

  const allPosts = useMemo(() => [...dbPosts, ...staticUnified], [dbPosts, staticUnified]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allPosts.forEach((p) => set.add(p.category));
    return [ALL, ...Array.from(set).sort()];
  }, [allPosts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allPosts.filter((p) => {
      if (category !== ALL && p.category !== category) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q);
    });
  }, [query, category, allPosts]);

  return (
    <>
      <SEOHead
        title="Tree Care Insights & Homeowner Guides | IGY6 Rooted"
        description="Real-world tree care, storm prep, and property guidance from a veteran-owned crew serving Niceville, Destin, Fort Walton Beach, and all of Northwest Florida."
        path="/blog"
      />

      {/* Hero */}
      <section className="bg-[hsl(82,25%,22%)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="flex items-center gap-2 mb-4 text-[hsl(82,40%,75%)]">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">The IGY6 Insights Blog</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6 max-w-3xl">
            Real Tree Care Knowledge for Northwest Florida Homeowners
          </h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Plain-spoken guides on tree health, storm prep, and property care from a veteran-owned local crew.
          </p>
        </div>
      </section>

      {/* Search + filters */}
      <section className="bg-white border-b border-[hsl(82,15%,90%)] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(82,10%,55%)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles…"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[hsl(82,15%,85%)] bg-white text-[hsl(82,25%,18%)] placeholder:text-[hsl(82,10%,55%)] focus:outline-none focus:border-[hsl(82,40%,40%)]"
              aria-label="Search articles"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors border ${
                  category === c
                    ? "bg-[hsl(82,30%,35%)] text-white border-[hsl(82,30%,35%)]"
                    : "bg-white text-[hsl(82,25%,25%)] border-[hsl(82,15%,85%)] hover:border-[hsl(82,30%,50%)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="bg-[hsl(82,10%,97%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mb-6 text-sm text-[hsl(82,10%,45%)]">
            Showing <span className="font-semibold text-[hsl(82,25%,20%)]">{filtered.length}</span> of {allPosts.length} articles
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-[hsl(82,15%,90%)] p-10 text-center">
              <p className="text-[hsl(82,10%,40%)]">
                No articles match your search. Try a different keyword or category.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl overflow-hidden border border-[hsl(82,15%,90%)] hover:border-[hsl(82,30%,50%)] hover:shadow-xl transition-all"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[hsl(82,15%,93%)]">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.imageAlt}
                        width={800}
                        height={600}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[hsl(82,15%,70%)]">
                        <BookOpen className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs font-semibold text-[hsl(82,30%,40%)] uppercase tracking-wider mb-2">
                      <span>{post.category}</span>
                      <span className="text-[hsl(82,15%,75%)]">·</span>
                      <span className="flex items-center gap-1 text-[hsl(82,10%,55%)]">
                        <Clock className="h-3 w-3" />
                        {post.readMinutes} min read
                      </span>
                    </div>
                    <h2 className="font-bold text-[hsl(82,25%,18%)] group-hover:text-[hsl(82,30%,32%)] transition-colors leading-snug mb-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-[hsl(82,10%,45%)] leading-snug line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center gap-1 mt-4 text-sm font-semibold text-[hsl(82,40%,35%)]">
                      Read article <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
