import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/public/SEOHead";
import { LocalBusinessSchema } from "@/components/public/LocalBusinessSchema";
import { Phone, Shield, Star, TreePine, Clock, CheckCircle, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-tree-service.jpg";
import heroOption1 from "@/assets/hero-option-1.jpg";
import heroOption2 from "@/assets/hero-option-2.jpg";
import heroOption3 from "@/assets/hero-option-3.jpg";
import heroOption4 from "@/assets/hero-option-4.jpg";
import { SITE_CONFIG } from "@/config/site.config";
import { supabase } from "@/integrations/supabase/client";

type GoogleReview = {
  author: string;
  photo: string | null;
  rating: number;
  text: string;
  relativeTime: string;
};

type GoogleReviewsPayload = {
  rating: number | null;
  totalRatings: number | null;
  mapsUrl: string | null;
  reviews: GoogleReview[];
};

const services = SITE_CONFIG.services;

const heroImages = [
  { src: heroImage, alt: "Beautifully manicured residential lawn and tree care in Northwest Florida" },
  { src: heroOption1, alt: "Cozy Florida ranch home with healthy oak trees and a freshly mowed lawn" },
  { src: heroOption2, alt: "Lush green backyard with mature pine and oak trees in Northwest Florida" },
  { src: heroOption3, alt: "Striped manicured lawn next to a healthy oak tree at a residential home" },
  { src: heroOption4, alt: "White coastal-style Florida home with palms and crisp green hedges" },
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
  const [activeHero, setActiveHero] = useState(0);
  const [google, setGoogle] = useState<GoogleReviewsPayload | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveHero((i) => (i + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("google-reviews");
        if (!cancelled && !error && data) setGoogle(data as GoogleReviewsPayload);
      } catch (e) {
        console.warn("Failed to load Google reviews", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayReviews =
    google?.reviews && google.reviews.length > 0
      ? google.reviews.slice(0, 3).map((r) => ({
          name: r.author,
          location: r.relativeTime,
          text: r.text,
          rating: r.rating,
          photo: r.photo,
        }))
      : testimonials.map((t) => ({ ...t, photo: null as string | null }));

  return (
    <>
      <SEOHead
        title="Tree Service & Stump Grinding in Niceville, FL | IGY6 Rooted"
        description="Veteran-owned tree service in Niceville, Destin & Fort Walton Beach, FL. Tree removal, stump grinding, trimming, and 24/7 emergency response. Free estimates — (518) 265-0275."
        path="/"
        image="/og/home.jpg"
      />
      <LocalBusinessSchema />

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 overflow-hidden">
          {heroImages.map((img, i) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.alt}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
                i === activeHero ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, hsla(82,25%,10%,0.55), hsla(82,25%,10%,0.40), hsla(82,25%,10%,0.05))' }} />
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
              {SITE_CONFIG.hero.title}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-lg">
              {SITE_CONFIG.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://clienthub.getjobber.com/hubs/098c4d0e-40ac-4280-b8c9-70e5a93704f7/public/requests/2162555/new"
                target="_blank"
                rel="noopener noreferrer"
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

      {/* Services grid */}
      <section id="services" className="bg-[hsl(82,10%,96%)] scroll-mt-24">
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link
                key={service.href}
                to={service.href}
                className="group bg-white rounded-xl overflow-hidden border border-[hsl(82,15%,90%)] hover:border-[hsl(82,30%,50%)] hover:shadow-xl transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[hsl(82,15%,93%)]">
                  <img
                    src={service.image}
                    alt={(service as any).alt ?? service.name}
                    width={800}
                    height={600}
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
                {SITE_CONFIG.about.title}
              </h2>
              <p className="text-[hsl(82,10%,40%)] mb-4 leading-relaxed">
                Since founding IGY6 Rooted in April 2024, we've been helping homeowners and businesses across
                the Destin–Fort Walton Beach area maintain healthy, safe trees on their properties.
              </p>
              <p className="text-[hsl(82,10%,40%)] mb-6 leading-relaxed">
                {SITE_CONFIG.about.body2}
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
                {(() => {
                  const top = google?.reviews
                    ?.filter((r) => r.rating >= 5 && r.text.length > 60)
                    .sort((a, b) => b.text.length - a.text.length)[0];
                  if (top) {
                    return (
                      <>
                        <blockquote className="text-lg italic text-[hsl(82,10%,30%)] mb-4 line-clamp-6">
                          "{top.text}"
                        </blockquote>
                        <div className="flex">
                          {[...Array(top.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-[hsl(45,90%,50%)] text-[hsl(45,90%,50%)]" />
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                          {top.photo && (
                            <img
                              src={top.photo}
                              alt={top.author}
                              className="h-10 w-10 rounded-full object-cover"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-[hsl(82,25%,20%)]">{top.author}</p>
                            <p className="text-xs text-[hsl(82,10%,50%)]">Verified Google Review</p>
                          </div>
                        </div>
                      </>
                    );
                  }
                  return (
                    <>
                      <blockquote className="text-lg italic text-[hsl(82,10%,30%)] mb-4">
                        "He doesn't just show up with fancy equipment. He shows up with care, clean lines, and clear communication.
                        That's why tree companies, churches, and homeowners all keep calling him back."
                      </blockquote>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-[hsl(45,90%,50%)] text-[hsl(45,90%,50%)]" />
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="bg-white scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-[hsl(82,40%,40%)] uppercase tracking-wider">
              {google ? "Google Reviews" : "Testimonials"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(82,25%,20%)] mt-2">
              What Our Customers Say
            </h2>
            {google?.rating && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(google.rating ?? 0)
                          ? "fill-[hsl(45,90%,50%)] text-[hsl(45,90%,50%)]"
                          : "text-[hsl(82,10%,70%)]"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[hsl(82,10%,40%)] font-medium">
                  {google.rating.toFixed(1)} · {google.totalRatings ?? 0} reviews on Google
                </span>
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {displayReviews.map((t, idx) => (
              <div
                key={`${t.name}-${idx}`}
                className="bg-[hsl(82,10%,97%)] rounded-xl p-6 border border-[hsl(82,15%,92%)]"
              >
                <div className="flex mb-3">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[hsl(45,90%,50%)] text-[hsl(45,90%,50%)]" />
                  ))}
                </div>
                <p className="text-[hsl(82,10%,35%)] mb-4 leading-relaxed line-clamp-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  {t.photo && (
                    <img
                      src={t.photo}
                      alt={t.name}
                      className="h-10 w-10 rounded-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-[hsl(82,25%,20%)]">{t.name}</p>
                    <p className="text-sm text-[hsl(82,10%,50%)]">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {google?.mapsUrl && (
            <div className="text-center mt-8">
              <a
                href={google.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[hsl(82,40%,35%)] font-semibold hover:underline"
              >
                See all reviews on Google
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          )}
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
