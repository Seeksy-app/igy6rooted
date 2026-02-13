import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Phone, CheckCircle, ArrowLeft, TreePine } from "lucide-react";

interface ServicePageTemplateProps {
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroText: string;
  sections: { heading: string; content: string }[];
  benefits: string[];
  relatedServices: { name: string; href: string }[];
}

export function ServicePageTemplate({
  title,
  metaTitle,
  metaDescription,
  heroText,
  sections,
  benefits,
  relatedServices,
}: ServicePageTemplateProps) {
  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>

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
            {title} in <span className="text-[hsl(82,50%,65%)]">Northwest Florida</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl">{heroText}</p>
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
                  <p className="text-[hsl(82,10%,40%)] leading-relaxed whitespace-pre-line">{s.content}</p>
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
                  href="tel:+15182650275"
                  className="flex items-center justify-center gap-2 bg-white text-[hsl(82,25%,25%)] px-6 py-3 rounded-lg font-bold hover:bg-white/90 transition-colors"
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
