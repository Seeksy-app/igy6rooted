import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { TreePine, Phone, ArrowRight } from "lucide-react";

const services = [
  {
    name: "Tree Removal",
    href: "/services/tree-removal",
    desc: "Safe, professional removal of hazardous, diseased, or unwanted trees. Complete cleanup included.",
  },
  {
    name: "Tree Trimming",
    href: "/services/tree-trimming",
    desc: "Remove overgrowth, shape trees for safety and appearance, and prevent storm damage.",
  },
  {
    name: "Tree Pruning",
    href: "/services/tree-pruning",
    desc: "Targeted care to remove dead or diseased branches and improve overall tree health.",
  },
  {
    name: "Stump Grinding",
    href: "/services/stump-grinding",
    desc: "Grind stumps below ground level for a clean, flat yard. Our specialty since day one.",
  },
  {
    name: "Emergency Tree Removal",
    href: "/services/emergency-tree-removal",
    desc: "24/7 rapid response for fallen trees, storm damage, and urgent safety hazards.",
  },
  {
    name: "Debris Removal",
    href: "/services/debris-removal",
    desc: "Full cleanup and hauling of branches, limbs, and storm debris from your property.",
  },
  {
    name: "Landscaping",
    href: "/services/landscaping",
    desc: "Design and installation services to transform and beautify your outdoor spaces.",
  },
  {
    name: "Land Clearing",
    href: "/services/land-clearing",
    desc: "Prepare raw land for construction, farming, or development with full vegetation removal.",
  },
  {
    name: "Lot Clearing",
    href: "/services/lot-clearing",
    desc: "Complete residential or commercial lot preparation including stumps, brush, and debris.",
  },
  {
    name: "Brush Removal",
    href: "/services/brush-removal",
    desc: "Clear overgrown brush and undergrowth for fire safety, aesthetics, and usability.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <Helmet>
        <title>Tree Services in Niceville, FL | IGY6 Rooted</title>
        <meta
          name="description"
          content="Complete tree services in Northwest Florida: tree removal, trimming, pruning, stump grinding, emergency services, land clearing, and more. Free estimates."
        />
      </Helmet>

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
              From routine maintenance to emergency storm response — veteran-owned quality you can trust.
            </p>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid sm:grid-cols-2 gap-6">
            {services.map((service) => (
              <Link
                key={service.href}
                to={service.href}
                className="group bg-[hsl(82,10%,97%)] rounded-xl p-8 border border-[hsl(82,15%,92%)] hover:border-[hsl(82,30%,50%)] hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(82,30%,88%)] flex items-center justify-center shrink-0 group-hover:bg-[hsl(82,30%,40%)] transition-colors">
                    <TreePine className="h-6 w-6 text-[hsl(82,30%,40%)] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-[hsl(82,25%,20%)] group-hover:text-[hsl(82,30%,35%)] transition-colors">
                        {service.name}
                      </h2>
                      <ArrowRight className="h-5 w-5 text-[hsl(82,15%,70%)] group-hover:text-[hsl(82,30%,40%)] transition-colors" />
                    </div>
                    <p className="text-[hsl(82,10%,50%)] mt-2">{service.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
