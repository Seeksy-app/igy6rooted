import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Phone, CheckCircle, ArrowLeft, TreePine } from "lucide-react";
import { SEOHead } from "@/components/public/SEOHead";

interface ServicePageTemplateProps {
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroText: string;
  heroImage: string;
  heroImageAlt: string;
  midImage: string;
  midImageAlt: string;
  midImageCaption?: string;
  sections: { heading: string; content: string }[];
  benefits: string[];
  relatedServices: { name: string; href: string }[];
  /** Optional faded stock background image for the article header */
  headerImage?: string;
  /** Path-only OG image (defaults to /og/services.jpg) */
  ogImage?: string;
  /** Primary keyword for service-specific JSON-LD */
  serviceKeyword?: string;
}

export function ServicePageTemplate({
  title,
  metaTitle,
  metaDescription,
  heroText,
  heroImage,
  heroImageAlt,
  midImage,
  midImageAlt,
  midImageCaption,
  sections,
  benefits,
  relatedServices,
  headerImage,
  ogImage = "/og/services.jpg",
  serviceKeyword,
}: ServicePageTemplateProps) {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Insert mid image roughly halfway through sections
  const midIndex = Math.max(1, Math.floor(sections.length / 2));

  // AggregateRating scaffold — gated until live Google Reviews data is wired.
  // To enable: flip ENABLE_AGGREGATE_RATING = true and source values from the
  // google-reviews edge function. Never enable with placeholder data.
  const ENABLE_AGGREGATE_RATING = false;

  const serviceJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceKeyword ?? title,
    provider: {
      "@type": "LocalBusiness",
      name: "IGY6 Rooted",
      telephone: "+1-518-265-0275",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Niceville",
        addressRegion: "FL",
        postalCode: "32578",
        addressCountry: "US",
      },
    },
    areaServed: [
      "Niceville, FL", "Destin, FL", "Fort Walton Beach, FL", "Crestview, FL",
      "Navarre, FL", "Bluewater Bay, FL", "Valparaiso, FL",
    ],
    description: metaDescription,
  };

  if (ENABLE_AGGREGATE_RATING) {
    serviceJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: "0.0",  // populate from google-reviews edge function
      reviewCount: 0,      // populate from google-reviews edge function
      bestRating: "5",
      worstRating: "1",
    };
  }

  return (
    <>
      <SEOHead
        title={metaTitle}
        description={metaDescription}
        path={location.pathname}
        image={ogImage}
        jsonLd={serviceJsonLd}
      />


      {/* Header (no background image) */}
      <section className="bg-white border-b border-[hsl(82,15%,90%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm text-[hsl(82,10%,45%)] hover:text-[hsl(82,25%,25%)] transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            All Services
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-8">
            <img
              src={heroImage}
              alt={heroImageAlt}
              width={160}
              height={160}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg shadow-sm border border-[hsl(82,15%,90%)] shrink-0 mb-4 sm:mb-0"
            />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 text-[hsl(82,25%,20%)]">
                {title} in <span className="text-[hsl(82,40%,40%)]">Northwest Florida</span>
              </h1>
              <p className="text-lg text-[hsl(82,10%,40%)] max-w-2xl">{heroText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {sections.map((s, i) => (
                <div key={i}>
                  <h2 className="text-2xl font-bold text-[hsl(82,25%,20%)] mb-4">{s.heading}</h2>
                  <p className="text-[hsl(82,10%,40%)] leading-relaxed whitespace-pre-line">
                    {s.content}
                  </p>

                  {i === midIndex - 1 && (
                    <figure className="mt-6 float-right ml-6 mb-4 w-40 sm:w-48">
                      <img
                        src={midImage}
                        alt={midImageAlt}
                        loading="lazy"
                        decoding="async"
                        width={192}
                        height={192}
                        className="w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-lg shadow-sm border border-[hsl(82,15%,90%)]"
                      />
                      {midImageCaption && (
                        <figcaption className="text-xs text-[hsl(82,10%,50%)] mt-2 italic">
                          {midImageCaption}
                        </figcaption>
                      )}
                    </figure>
                  )}
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CTA card */}
              <div className="bg-[hsl(82,25%,28%)] rounded-xl p-6 text-white">
                <h3 className="font-bold text-lg mb-3">Get a Free Estimate</h3>
                <p className="text-white/70 text-sm mb-4">
                  Call us today for a no-obligation assessment.
                </p>
                <a
                  href="https://clienthub.getjobber.com/hubs/098c4d0e-40ac-4280-b8c9-70e5a93704f7/public/requests/2162555/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-white text-[hsl(82,25%,25%)] px-6 py-3 rounded-lg font-bold hover:bg-white/90 transition-colors"
                >
                  Get Free Estimate
                </a>
                <a
                  href="tel:+15182650275"
                  className="flex items-center justify-center gap-2 mt-3 text-white/90 hover:text-white text-sm font-semibold"
                >
                  <Phone className="h-4 w-4" />
                  (518) 265-0275
                </a>
              </div>

              {/* Benefits */}
              <div className="bg-[hsl(82,10%,96%)] rounded-xl p-6 border border-[hsl(82,15%,92%)]">
                <h3 className="font-bold text-[hsl(82,25%,20%)] mb-4">Why IGY6 Rooted?</h3>
                <div className="space-y-3">
                  {benefits.map((b) => (
                    <div key={b} className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-[hsl(82,40%,40%)] shrink-0 mt-0.5" />
                      <span className="text-sm text-[hsl(82,10%,40%)]">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related services */}
              <div className="bg-[hsl(82,10%,96%)] rounded-xl p-6 border border-[hsl(82,15%,92%)]">
                <h3 className="font-bold text-[hsl(82,25%,20%)] mb-4">Related Services</h3>
                <div className="space-y-2">
                  {relatedServices.map((s) => (
                    <Link
                      key={s.href}
                      to={s.href}
                      className="flex items-center gap-2.5 text-sm text-[hsl(82,10%,40%)] hover:text-[hsl(82,30%,35%)] transition-colors"
                    >
                      <TreePine className="h-3.5 w-3.5 shrink-0" />
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
