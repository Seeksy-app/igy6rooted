import { Link } from "react-router-dom";
import { SEOHead } from "@/components/public/SEOHead";
import { CheckCircle, Phone, ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/data/blog";
import { trackPhoneClick } from "@/lib/gtag";

const featured = BLOG_POSTS.slice(0, 3);

export default function ThankYouPage() {
  return (
    <>
      <SEOHead
        title="Thank You | IGY6 Rooted Tree Service"
        description="Thank you for contacting IGY6 Rooted. We'll be in touch shortly with your free estimate."
        path="/thank-you"
      />

      {/* Hero */}
      <section className="bg-[hsl(82,25%,22%)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <CheckCircle className="h-16 w-16 text-[hsl(82,50%,65%)] mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
            Thank You!
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Your request has been received. A member of our team will reach out shortly to schedule your free estimate.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+15182650275"
              onClick={trackPhoneClick}
              className="inline-flex items-center gap-2 bg-white text-[hsl(82,25%,22%)] px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call Us: (518) 265-0275
            </a>
            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[hsl(82,25%,20%)] mb-3">
              While You Wait, Check Out Our Blog
            </h2>
            <p className="text-[hsl(82,10%,45%)] text-lg max-w-2xl mx-auto">
              Tips, insights, and expert advice on tree care for Northwest Florida homeowners.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group rounded-xl overflow-hidden border border-[hsl(82,15%,90%)] hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[16/10] overflow-hidden bg-[hsl(82,10%,95%)]">
                  <img
                    src={post.image}
                    alt={post.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-[hsl(82,30%,40%)] uppercase tracking-wider">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-bold text-[hsl(82,25%,20%)] mt-1 mb-2 line-clamp-2 group-hover:text-[hsl(82,30%,35%)] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-[hsl(82,10%,45%)] line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[hsl(82,30%,35%)]">
                    Read More <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
