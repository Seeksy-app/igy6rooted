import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Shield, CheckCircle, Star, Phone, Award, Heart } from "lucide-react";
import craigPhoto from "@/assets/craig-orner.avif";
import { SITE_CONFIG } from "@/config/site.config";

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Craig Orner & IGY6 Rooted | Veteran-Owned Tree Service</title>
        <meta
          name="description"
          content="Meet Craig Orner, USAF Reservist and founder of IGY6 Rooted. Veteran-owned tree service in Niceville, FL with military precision and respect for your property."
        />
      </Helmet>

      {/* Hero */}
      <section className="bg-[hsl(82,25%,22%)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-[hsl(82,50%,65%)]" />
              <span className="text-sm font-semibold text-[hsl(82,50%,70%)] uppercase tracking-wider">
                Veteran-Owned & Operated
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              About <span className="text-[hsl(82,50%,65%)]">IGY6 Rooted</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl">
              No gimmicks. Just professionalism. Military precision meets genuine care for your property.
            </p>
          </div>
        </div>
      </section>

      {/* Craig's Story */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-sm font-semibold text-[hsl(82,40%,40%)] uppercase tracking-wider">
                The Owner
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(82,25%,20%)] mt-2 mb-6">
                Meet Craig Orner
              </h2>
              <p className="text-[hsl(82,10%,40%)] mb-4 leading-relaxed">
                Craig Orner is a Pavements & Construction Equipment Specialist in the U.S. Air Force Reserve
                and the owner of IGY6 Rooted. He's been grinding stumps and trimming trees long before he
                ever wore a uniform.
              </p>
              <p className="text-[hsl(82,10%,40%)] mb-4 leading-relaxed">
                Known for being honest, respectful, and quick to get the job done right, Craig's business is
                built on referrals and results, not fluff. He doesn't just show up with fancy equipment — he
                shows up with care, clean lines, and clear communication.
              </p>
              <p className="text-[hsl(82,10%,40%)] mb-6 leading-relaxed">
                That's why tree companies, churches, and homeowners all keep calling him back. Since founding
                IGY6 Rooted in April 2024, the company has quickly become one of the most trusted tree service
                providers across Okaloosa, Walton, Santa Rosa, and Escambia counties.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-[hsl(82,40%,40%)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[hsl(82,25%,20%)]">U.S. Air Force Reserve</p>
                    <p className="text-sm text-[hsl(82,10%,50%)]">Pavements & Construction Equipment Specialist</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-[hsl(82,40%,40%)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[hsl(82,25%,20%)]">IGY6 — "I Got Your Six"</p>
                    <p className="text-sm text-[hsl(82,10%,50%)]">Military term meaning "I've got your back" — the foundation of how we serve every customer.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl overflow-hidden mb-6">
                <img
                  src={craigPhoto}
                  alt="Craig Orner, owner of IGY6 Rooted Tree Service"
                  className="w-full h-auto object-cover rounded-2xl"
                />
              </div>
              <div className="bg-[hsl(82,15%,95%)] rounded-2xl p-8">
                <h3 className="font-bold text-xl text-[hsl(82,25%,20%)] mb-6">Our Values</h3>
                <div className="space-y-4">
                  {[
                    { title: "Integrity", desc: "Honest assessments, fair pricing, no surprises." },
                    { title: "Respect for Your Yard", desc: "We leave your property cleaner than we found it." },
                    { title: "Reliability", desc: "On time, every time. We do what we say we'll do." },
                    { title: "Safety First", desc: "DigSafe checks, proper insurance, debris protection on every job." },
                    { title: "Military Precision", desc: "Attention to detail that comes from years of service." },
                  ].map((v) => (
                    <div key={v.title} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-[hsl(82,40%,40%)] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[hsl(82,25%,20%)]">{v.title}</p>
                        <p className="text-sm text-[hsl(82,10%,50%)]">{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[hsl(82,10%,96%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold text-[hsl(82,25%,20%)] text-center mb-12">
            What Customers Are Saying
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                text: "Craig was fantastic. He assessed the trees carefully, gave us an honest recommendation, and had everything cleaned up the same day. You can tell this is a man who takes pride in his work.",
                name: "David P.",
                location: "Valparaiso, FL",
              },
              {
                text: "After a bad storm took down two trees in our front yard, IGY6 Rooted was there within hours. They handled everything professionally and even cleaned up debris from our neighbor's yard. Above and beyond.",
                name: "Michelle K.",
                location: "Bluewater Bay, FL",
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-xl p-8 border border-[hsl(82,15%,90%)]">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[hsl(45,90%,50%)] text-[hsl(45,90%,50%)]" />
                  ))}
                </div>
                <p className="text-[hsl(82,10%,35%)] mb-4 leading-relaxed">"{t.text}"</p>
                <p className="font-semibold text-[hsl(82,25%,20%)]">{t.name}</p>
                <p className="text-sm text-[hsl(82,10%,50%)]">{t.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[hsl(82,25%,28%)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Call us for a free, no-obligation estimate. We'll assess your situation and give you our honest recommendation.
          </p>
          <a
            href="{SITE_CONFIG.business.jobberUrl}"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[hsl(82,25%,25%)] px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/90 transition-colors"
          >
            Get Free Estimate
          </a>
        </div>
      </section>
    </>
  );
}
