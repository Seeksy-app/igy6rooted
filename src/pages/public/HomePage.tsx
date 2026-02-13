import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Phone, Shield, Star, TreePine, Clock, CheckCircle, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-tree-service.jpg";

const services = [
  {
    name: "Tree Removal",
    href: "/services/tree-removal",
    desc: "Safe, efficient removal of hazardous or unwanted trees from your property.",
  },
  {
    name: "Tree Trimming",
    href: "/services/tree-trimming",
    desc: "Professional shaping and overgrowth management for healthy, attractive trees.",
  },
  {
    name: "Tree Pruning",
    href: "/services/tree-pruning",
    desc: "Targeted removal of dead or diseased branches for improved tree health.",
  },
  {
    name: "Stump Grinding",
    href: "/services/stump-grinding",
    desc: "Complete stump removal below ground level for a clean, usable yard.",
  },
  {
    name: "Emergency Tree Removal",
    href: "/services/emergency-tree-removal",
    desc: "24/7 response for storm damage, fallen trees, and urgent safety hazards.",
  },
  {
    name: "Debris Removal",
    href: "/services/debris-removal",
    desc: "Full cleanup and hauling of branches, limbs, and storm debris.",
  },
  {
    name: "Landscaping",
    href: "/services/landscaping",
    desc: "Design and installation to transform your outdoor spaces.",
  },
  {
    name: "Land Clearing",
    href: "/services/land-clearing",
    desc: "Prepare your property for construction or development projects.",
  },
  {
    name: "Lot Clearing",
    href: "/services/lot-clearing",
    desc: "Complete lot preparation including vegetation and debris removal.",
  },
  {
    name: "Brush Removal",
    href: "/services/brush-removal",
    desc: "Clear overgrown brush and vegetation for a safer, cleaner property.",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    location: "Niceville, FL",
    text: "Craig and his team were incredible. They removed a massive oak that was threatening our roof and left the yard cleaner than when they arrived. Highly recommend!",
    rating: 5,
  },
  {
    name: "James T.",
    location: "Destin, FL",
    text: "After Hurricane season, IGY6 Rooted was the only company that could come out the same week. Professional, fast, and fair pricing. True military precision.",
    rating: 5,
  },
  {
    name: "Linda R.",
    location: "Fort Walton Beach, FL",
    text: "We've used them three times now for trimming and stump grinding. Always on time, always respectful of our property. It's rare to find that kind of service.",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>IGY6 Rooted | Stump Grinding & Tree Service in Niceville, FL</title>
        <meta
          name="description"
          content="Veteran-owned tree service in Northwest Florida. Stump grinding, tree removal, trimming, pruning, and emergency services. Free estimates. Call (518) 265-0275."
        />
        <link rel="canonical" href="https://igy6rooted.com" />
      </Helmet>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Professional stump grinding service in Northwest Florida"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(82,25%,10%)/0.95] via-[hsl(82,25%,10%)/0.85] to-[hsl(82,25%,10%)/0.55]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-[hsl(82,50%,65%)]" />
              <span className="text-sm font-semibold text-[hsl(82,50%,70%)] uppercase tracking-wider">
                Veteran-Owned & Operated
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Stump Grinding &
              <br />
              <span className="text-[hsl(82,50%,65%)]">Tree Service</span>
              <br />
              in Niceville, FL
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-lg">
              Clean. Fast. No damage. We bring military precision and respect for your yard to every job across Northwest Florida.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="tel:+15182650275"
                className="inline-flex items-center justify-center gap-2 bg-[hsl(82,40%,45%)] hover:bg-[hsl(82,40%,38%)] text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
              >
                <Phone className="h-5 w-5" />
                Get Free Estimate
              </a>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors backdrop-blur-sm border border-white/20"
              >
                Our Services
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section className="bg-[hsl(82,25%,28%)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-white/70">Licensed & Insured</p>
            </div>
            <div>
              <p className="text-2xl font-bold">7 Days</p>
              <p className="text-sm text-white/70">A Week Service</p>
            </div>
            <div>
              <p className="text-2xl font-bold">Free</p>
              <p className="text-sm text-white/70">Estimates Always</p>
            </div>
            <div>
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-white/70">Emergency Response</p>
            </div>
          </div>
        </div>
      </section>

      {/* About preview */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-[hsl(82,40%,40%)] uppercase tracking-wider">
                About IGY6 Rooted
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(82,25%,20%)] mt-2 mb-6">
                Proudly Serving Northwest Florida — One Tree at a Time
              </h2>
              <p className="text-[hsl(82,10%,40%)] mb-4 leading-relaxed">
                Since founding IGY6 Rooted in April 2024, we've been helping homeowners and businesses across
                the Destin–Fort Walton Beach area maintain healthy, safe trees on their properties.
              </p>
              <p className="text-[hsl(82,10%,40%)] mb-6 leading-relaxed">
                Craig Orner — a Pavements & Construction Equipment Specialist in the U.S. Air Force Reserve — brings
                decades of experience and military precision to every job. No gimmicks. Just professionalism.
              </p>
              <div className="space-y-3 mb-8">
                {["Respect for your yard — always", "Complete cleanup included", "Honest assessments, fair pricing", "DigSafe utility checks on every job"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-[hsl(82,40%,40%)] shrink-0" />
                    <span className="text-[hsl(82,10%,35%)] font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-[hsl(82,40%,35%)] font-semibold hover:underline"
              >
                More About Craig & IGY6 Rooted
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="bg-[hsl(82,15%,93%)] rounded-2xl p-8 lg:p-10">
                <blockquote className="text-lg italic text-[hsl(82,10%,30%)] mb-4">
                  "He doesn't just show up with fancy equipment. He shows up with care, clean lines, and clear communication.
                  That's why tree companies, churches, and homeowners all keep calling him back."
                </blockquote>
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[hsl(45,90%,50%)] text-[hsl(45,90%,50%)]" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
              Our Tree & Yard Services
            </h2>
            <p className="text-[hsl(82,10%,45%)] mt-3 max-w-2xl mx-auto">
              From routine trimming to emergency storm response, we handle every aspect of tree care
              for residential and commercial properties across Okaloosa, Walton, Santa Rosa, and Escambia counties.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.href}
                to={service.href}
                className="bg-white rounded-xl p-6 border border-[hsl(82,15%,90%)] hover:border-[hsl(82,30%,50%)] hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(82,30%,90%)] flex items-center justify-center shrink-0 group-hover:bg-[hsl(82,30%,40%)] transition-colors">
                    <TreePine className="h-5 w-5 text-[hsl(82,30%,40%)] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[hsl(82,25%,20%)] group-hover:text-[hsl(82,30%,35%)] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-[hsl(82,10%,50%)] mt-1">{service.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-[hsl(82,40%,40%)] uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(82,25%,20%)] mt-2">
              What Our Customers Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-[hsl(82,10%,97%)] rounded-xl p-6 border border-[hsl(82,15%,92%)]"
              >
                <div className="flex mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[hsl(45,90%,50%)] text-[hsl(45,90%,50%)]" />
                  ))}
                </div>
                <p className="text-[hsl(82,10%,35%)] mb-4 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-[hsl(82,25%,20%)]">{t.name}</p>
                  <p className="text-sm text-[hsl(82,10%,50%)]">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service area map */}
      <section className="bg-[hsl(82,10%,96%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-sm font-semibold text-[hsl(82,40%,40%)] uppercase tracking-wider">
                Service Area
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(82,25%,20%)] mt-2 mb-6">
                Serving Northwest Florida
              </h2>
              <p className="text-[hsl(82,10%,40%)] mb-6 leading-relaxed">
                We proudly serve homeowners and businesses across Okaloosa, Walton, Santa Rosa, and Escambia counties.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Niceville", "Destin", "Fort Walton Beach", "Crestview",
                  "Navarre", "Bluewater Bay", "Valparaiso", "Shalimar",
                  "Mary Esther", "Santa Rosa Beach", "Miramar Beach", "Freeport",
                ].map((area) => (
                  <div key={area} className="flex items-center gap-2 text-sm text-[hsl(82,10%,35%)]">
                    <CheckCircle className="h-3.5 w-3.5 text-[hsl(82,40%,40%)] shrink-0" />
                    {area}, FL
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-3">
                <Clock className="h-5 w-5 text-[hsl(82,40%,40%)]" />
                <div>
                  <p className="font-semibold text-[hsl(82,25%,20%)]">Open 7 Days a Week</p>
                  <p className="text-sm text-[hsl(82,10%,50%)]">7:00 AM – 9:00 PM CST · Emergency services available</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg border border-[hsl(82,15%,90%)]">
              <iframe
                title="IGY6 Rooted Service Area Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110068.39445012387!2d-86.5543!3d30.5169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8893e0d8e34a4f91%3A0x2567a2d79f99de62!2sNiceville%2C%20FL%2032578!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
