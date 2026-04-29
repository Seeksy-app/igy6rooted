import { Link } from "react-router-dom";
import { SEOHead } from "@/components/public/SEOHead";
import { TreePine, ArrowRight, Phone } from "lucide-react";

import treeRemoval from "@/assets/services/client/tree-removal.jpg";
import treeTrimming from "@/assets/services/client/tree-trimming.jpg";
import treePruning from "@/assets/services/client/tree-pruning.jpg";
import stumpGrinding from "@/assets/services/client/stump-grinding-1.jpg";
import stumpGrindingAlt from "@/assets/services/client/stump-grinding-2.jpg";
import emergencyRemoval from "@/assets/services/client/emergency-removal.jpg";
import debrisRemoval from "@/assets/services/client/debris-removal.jpg";
import propertyMaintenance from "@/assets/services/client/property-maintenance.jpg";
import landscaping from "@/assets/services/client/property-maintenance.jpg";
import landClearing from "@/assets/services/client/land-clearing.jpg";
import lotClearing from "@/assets/services/client/stump-grinding-2.jpg";
import brushRemoval from "@/assets/services/client/brush-removal.jpg";
const lawnCare = propertyMaintenance;

const services = [
  { name: "Tree Removal", href: "/services/tree-removal", image: treeRemoval, desc: "Safe, professional removal of hazardous, diseased, or unwanted trees. Complete cleanup included." },
  { name: "Tree Trimming", href: "/services/tree-trimming", image: treeTrimming, desc: "Remove overgrowth, shape trees for safety and appearance, and prevent storm damage." },
  { name: "Tree Pruning", href: "/services/tree-pruning", image: treePruning, desc: "Targeted care to remove dead or diseased branches and improve overall tree health." },
  { name: "Stump Grinding", href: "/services/stump-grinding", image: stumpGrinding, desc: "Grind stumps below ground level for a clean, flat yard. Our specialty since day one." },
  { name: "Emergency Tree Removal", href: "/services/emergency-tree-removal", image: emergencyRemoval, desc: "24/7 rapid response for fallen trees, storm damage, and urgent safety hazards." },
  { name: "Debris Removal", href: "/services/debris-removal", image: debrisRemoval, desc: "Storm cleanup, branch hauling, and full property reset — usually within the same week." },
  { name: "Lawn Care & Mowing", href: "/services/lawn-care", image: lawnCare, desc: "Weekly mowing, edging, and crisp lawn care across Niceville, Destin & Fort Walton Beach." },
  { name: "Property Maintenance", href: "/services/property-maintenance", image: propertyMaintenance, desc: "One crew, one schedule — recurring lawn, tree, and cleanup care year-round." },
  { name: "Landscaping", href: "/services/landscaping", image: landscaping, desc: "Design and installation services to transform and beautify your outdoor spaces." },
  { name: "Land Clearing", href: "/services/land-clearing", image: landClearing, desc: "Prepare raw land for construction, farming, or development with full vegetation removal." },
  { name: "Lot Clearing", href: "/services/lot-clearing", image: lotClearing, desc: "Complete residential or commercial lot preparation including stumps, brush, and debris." },
  { name: "Brush Removal", href: "/services/brush-removal", image: brushRemoval, desc: "Clear overgrown brush and undergrowth for fire safety, aesthetics, and usability." },
];

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

      {/* Services grid — homepage-style image cards */}
      <section className="bg-[hsl(82,10%,96%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-[hsl(82,40%,40%)] uppercase tracking-wider">
              What We Do
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(82,25%,20%)] mt-2">
              Our Tree & Yard Services
            </h2>
            <p className="text-[hsl(82,10%,45%)] mt-3 max-w-2xl mx-auto">
              Click any service to learn more, see what's included, and request your free estimate.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.href}
                to={service.href}
                className="group bg-white rounded-xl overflow-hidden border border-[hsl(82,15%,90%)] hover:border-[hsl(82,30%,50%)] hover:shadow-xl transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[hsl(82,15%,93%)]">
                  <img
                    src={service.image}
                    alt={`${service.name} in Northwest Florida`}
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
