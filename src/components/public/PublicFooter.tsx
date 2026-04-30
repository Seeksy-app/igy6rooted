import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Shield } from "lucide-react";
import logo from "@/assets/logo.png";
import { BLOG_POSTS } from "@/data/blog";

const services = [
  { name: "Tree Removal", href: "/services/tree-removal" },
  { name: "Tree Trimming", href: "/services/tree-trimming" },
  { name: "Tree Pruning", href: "/services/tree-pruning" },
  { name: "Stump Grinding", href: "/services/stump-grinding" },
  { name: "Emergency Tree Removal", href: "/services/emergency-tree-removal" },
  { name: "Debris Removal", href: "/services/debris-removal" },
  { name: "Land Clearing", href: "/services/land-clearing" },
  { name: "Lot Clearing", href: "/services/lot-clearing" },
  { name: "Brush Removal", href: "/services/brush-removal" },
];

const insightArticles = BLOG_POSTS.map((p) => ({
  name: p.cardTitle,
  href: `/blog/${p.slug}`,
}));

const serviceAreas = [
  "Niceville", "Destin", "Fort Walton Beach", "Crestview", "Navarre",
  "Bluewater Bay", "Valparaiso", "Shalimar", "Mary Esther", "Santa Rosa Beach",
  "Miramar Beach", "Freeport",
];

export function PublicFooter() {
  return (
    <footer className="bg-[hsl(82,25%,18%)] text-white">
      {/* CTA Banner */}
      <div className="bg-[hsl(82,30%,35%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Ready for a Free Estimate?
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Call us today for a no-obligation assessment of your tree service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href="tel:+15182650275"
              className="inline-flex items-center gap-2 bg-white text-[hsl(82,25%,25%)] px-8 py-3.5 rounded-lg font-bold text-lg hover:bg-white/90 transition-colors"
            >
              <Phone className="h-5 w-5" />
              (518) 265-0275
            </a>
            <a
              href="https://clienthub.getjobber.com/hubs/098c4d0e-40ac-4280-b8c9-70e5a93704f7/public/requests/2162555/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[hsl(82,25%,18%)] text-white border-2 border-white/20 px-8 py-3.5 rounded-lg font-bold text-lg hover:bg-[hsl(82,25%,14%)] transition-colors"
            >
              Get Free Estimate
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={logo} alt="IGY6 Rooted" className="h-12 w-auto brightness-200" />
              <div>
                <span className="block text-lg font-bold leading-tight">IGY6 Rooted</span>
                <span className="block text-xs text-white/60 tracking-wider uppercase">
                  Stump Grinding & Tree Service
                </span>
              </div>
            </Link>
            <p className="text-sm text-white/70 mb-4">
              Veteran-owned tree service bringing military precision and care to every job in Northwest Florida.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Shield className="h-4 w-4" />
              Fully Licensed & Insured
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s.href}>
                  <Link
                    to={s.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">
              Service Areas
            </h3>
            <ul className="space-y-1.5">
              {serviceAreas.map((area) => (
                <li key={area} className="text-sm text-white/70">
                  {area}, FL
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+15182650275"
                  className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  (518) 265-0275
                </a>
              </li>
              <li>
                <a
                  href="mailto:CO@IGY6Rooted.com"
                  className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  CO@IGY6Rooted.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                Niceville, FL 32578
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/70">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p>Mon–Sun: 7am – 9pm CST</p>
                  <p className="text-white/50">Emergency services available</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} IGY6 Rooted Stump Grinding & Tree Service. All rights reserved.
          </p>
          <Link
            to="/login"
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
