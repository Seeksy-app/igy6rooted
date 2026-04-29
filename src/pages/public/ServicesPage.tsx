import { Link } from "react-router-dom";
import { SEOHead } from "@/components/public/SEOHead";
import { TreePine, ArrowRight, Phone } from "lucide-react";
import { SITE_CONFIG } from "@/config/site.config";

const services = SITE_CONFIG.services;

export default function ServicesPage() {
  return (
    <>
      <SEOHead
        title="Tree Services in Niceville & Destin, FL | IGY6 Rooted"
        description="Full-service tree care in Northwest Florida: removal, trimming, pruning, stump grinding, 24/7 emergency response, land & lot clearing. Free estimates — (518) 265-0275."
        path="/services"
        image="/og/services.jpg"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "IGY6 Rooted Tree Services",
          itemListElement: services.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.name,
            url: `https://igy6rooted.com${s.href}`,
          })),
        }}
      />

      {/* Hero */}
      <section className="bg-[hsl(82,25%,22%)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="text-sm font-semibold text-[hsl(82,50%,70%)] uppercase tracking-wider">
              Our Services
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mt-2 mb-6">
              Professional Tree Services for <span className="text-[hsl(82,50%,65%)]">Northwest Florida</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl">
              From routine maintenance to emergency storm response — veteran-owned quality you can trust across Niceville, Destin, Fort Walton Beach, and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="bg-[hsl(82,10%,96%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-[hsl(82,40%,40%)] uppercase tracking-wider">
              What We Do
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(82,25%,20%)] mt-2">
              Our Tree Services
            </h2>
            <p className="text-[hsl(82,10%,45%)] mt-3 max-w-2xl mx-auto">
              Click any service to learn more, see what's included, and request your free estimate.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={`${service.href}-${service.name}`}
                to={service.href}
                className="group bg-white rounded-xl overflow-hidden border border-[hsl(82,15%,90%)] hover:border-[hsl(82,30%,50%)] hover:shadow-xl transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[hsl(82,15%,93%)]">
                  <img
                    src={service.image}
                    alt={(service as any).alt ?? `${service.name} in Northwest Florida`}
                    width={1024}
                    height={768}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <TreePine className="h-4 w-4 text-[hsl(82,30%,40%)]" />
                    <h3 className="font-semibold text-[hsl(82,25%,20%)] group-hover:text-[hsl(82,30%,35%)] transition-colors">
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-sm text-[hsl(82,10%,50%)]">{service.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-sm font-semibold text-[hsl(82,40%,35%)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-[hsl(82,25%,28%)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Not sure which service you need?</h2>
            <p className="text-white/75 mt-1">Call us — we'll walk your property and give you a free, honest estimate.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://clienthub.getjobber.com/hubs/098c4d0e-40ac-4280-b8c9-70e5a93704f7/public/requests/2162555/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[hsl(82,40%,45%)] hover:bg-[hsl(82,40%,38%)] px-6 py-3 rounded-lg font-bold transition-colors"
            >
              Get Free Estimate
            </a>
            <a
              href="tel:+15182650275"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg font-semibold border border-white/20 transition-colors"
            >
              <Phone className="h-4 w-4" />
              (518) 265-0275
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
