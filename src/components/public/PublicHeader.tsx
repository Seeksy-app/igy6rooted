import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import logo from "@/assets/logo.png";

const services = [
  { name: "Tree Removal", href: "/services/tree-removal" },
  { name: "Tree Trimming", href: "/services/tree-trimming" },
  { name: "Tree Pruning", href: "/services/tree-pruning" },
  { name: "Stump Grinding", href: "/services/stump-grinding" },
  { name: "Emergency Tree Removal", href: "/services/emergency-tree-removal" },
  { name: "Debris Removal", href: "/services/debris-removal" },
  { name: "Landscaping", href: "/services/landscaping" },
  { name: "Land Clearing", href: "/services/land-clearing" },
  { name: "Lot Clearing", href: "/services/lot-clearing" },
  { name: "Brush Removal", href: "/services/brush-removal" },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isServicesActive = location.pathname.startsWith("/services");

  return (
    <>
      {/* Top bar */}
      <div className="bg-[hsl(82,25%,28%)] text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10">
          <span className="hidden sm:block font-medium">Veteran-Owned Tree Service · Niceville, FL</span>
          <a
            href="tel:+15182650275"
            className="flex items-center gap-2 font-semibold hover:text-white/80 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            (518) 265-0275 · Free Estimates
          </a>
        </div>
      </div>

      {/* Main nav */}
      <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-[hsl(82,15%,85%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="IGY6 Rooted" className="h-14 w-auto" />
              <div className="hidden sm:block">
                <span className="block text-lg font-bold text-[hsl(82,25%,28%)] leading-tight">
                  IGY6 Rooted
                </span>
                <span className="block text-xs text-[hsl(82,15%,45%)] tracking-wider uppercase">
                  Stump Grinding & Tree Service
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "bg-[hsl(82,25%,28%)] text-white"
                    : "text-[hsl(82,15%,30%)] hover:bg-[hsl(82,15%,93%)]"
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/about")
                    ? "bg-[hsl(82,25%,28%)] text-white"
                    : "text-[hsl(82,15%,30%)] hover:bg-[hsl(82,15%,93%)]"
                }`}
              >
                About
              </Link>

              {/* Services dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <Link
                  to="/services"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    isServicesActive
                      ? "bg-[hsl(82,25%,28%)] text-white"
                      : "text-[hsl(82,15%,30%)] hover:bg-[hsl(82,15%,93%)]"
                  }`}
                >
                  Services
                  <ChevronDown className="h-3.5 w-3.5" />
                </Link>

                {servicesOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-[hsl(82,15%,90%)] py-2 z-50">
                    {services.map((s) => (
                      <Link
                        key={s.href}
                        to={s.href}
                        className={`block px-4 py-2.5 text-sm transition-colors ${
                          isActive(s.href)
                            ? "bg-[hsl(82,25%,28%)] text-white"
                            : "text-[hsl(82,15%,30%)] hover:bg-[hsl(82,15%,95%)]"
                        }`}
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/contact"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/contact")
                    ? "bg-[hsl(82,25%,28%)] text-white"
                    : "text-[hsl(82,15%,30%)] hover:bg-[hsl(82,15%,93%)]"
                }`}
              >
                Contact
              </Link>
            </nav>

            {/* CTA + mobile toggle */}
            <div className="flex items-center gap-3">
              <a
                href="https://clienthub.getjobber.com/hubs/098c4d0e-40ac-4280-b8c9-70e5a93704f7/public/requests/2162555/new"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 bg-[hsl(82,25%,28%)] hover:bg-[hsl(82,25%,22%)] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <Phone className="h-4 w-4" />
                Get Free Estimate
              </a>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-[hsl(82,15%,93%)] transition-colors"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[hsl(82,15%,90%)] bg-white">
            <div className="px-4 py-4 space-y-1">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-[hsl(82,15%,30%)] hover:bg-[hsl(82,15%,95%)]"
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-[hsl(82,15%,30%)] hover:bg-[hsl(82,15%,95%)]"
              >
                About
              </Link>
              <Link
                to="/services"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-[hsl(82,15%,30%)] hover:bg-[hsl(82,15%,95%)]"
              >
                All Services
              </Link>
              {services.map((s) => (
                <Link
                  key={s.href}
                  to={s.href}
                  onClick={() => setMobileOpen(false)}
                  className="block pl-8 pr-4 py-2.5 rounded-lg text-sm text-[hsl(82,15%,45%)] hover:bg-[hsl(82,15%,95%)]"
                >
                  {s.name}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-[hsl(82,15%,30%)] hover:bg-[hsl(82,15%,95%)]"
              >
                Contact
              </Link>
              <a
                href="tel:+15182650275"
                className="flex items-center justify-center gap-2 bg-[hsl(82,25%,28%)] text-white px-4 py-3 rounded-lg text-sm font-semibold mt-3"
              >
                <Phone className="h-4 w-4" />
                (518) 265-0275
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
