import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { SEOHead } from "@/components/public/SEOHead";
import { Phone, Shield, Clock, MapPin } from "lucide-react";
import { trackPhoneClick, trackFormSubmit } from "@/lib/gtag";
import { SITE_CONFIG } from "@/config/site.config";

const CLIENTHUB_ID = "098c4d0e-40ac-4280-b8c9-70e5a93704f7-4602732";
const FORM_URL =
  "https://clienthub.getjobber.com/client_hubs/098c4d0e-40ac-4280-b8c9-70e5a93704f7/public/work_request/embedded_work_request_form?form_id=4602732";

export default function FreeEstimatePage() {

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Preload Jobber embed stylesheet
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://d3ey4dbjkt2f6s.cloudfront.net/assets/external/work_request_embed.css";
    link.media = "screen";
    document.head.appendChild(link);

    // Load Jobber embed script
    const script = document.createElement("script");
    script.src =
      "https://d3ey4dbjkt2f6s.cloudfront.net/assets/static_link/work_request_embed_snippet.js";
    script.setAttribute("clienthub_id", CLIENTHUB_ID);
    script.setAttribute("form_url", FORM_URL);
    script.async = true;
    document.body.appendChild(script);

    // Listen for Jobber iframe messages (step changes + submission)
    const onMessage = (e: MessageEvent) => {
      if (typeof e.data !== "string") return;

      // Scroll to top of form on step transitions
      if (
        e.data.includes("work_request_step") ||
        e.data.includes("resize") ||
        e.data.includes("work_request_submitted")
      ) {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // Fire conversions on submit
      if (e.data.includes("work_request_submitted")) {
        trackFormSubmit();
        // Also fire the Free Estimate specific conversion
        window.gtag?.("event", "conversion", {
          send_to: "AW-16810284810/D12VCN_9oKkcEIqu4s8-",
        });
      }
    };
    window.addEventListener("message", onMessage);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <>
      <Helmet>
        <link rel="dns-prefetch" href="https://d3ey4dbjkt2f6s.cloudfront.net" />
        <link rel="preconnect" href="https://d3ey4dbjkt2f6s.cloudfront.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://clienthub.getjobber.com" />
        <link rel="preconnect" href="https://clienthub.getjobber.com" crossOrigin="anonymous" />
      </Helmet>
      <SEOHead
        title="Free Tree Service Estimate | IGY6 Rooted, Niceville FL"
        description="Request a free estimate from IGY6 Rooted — veteran-owned tree service in Niceville, Destin & Fort Walton Beach, FL. Fast response, no obligation."
        path="/free-estimate"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Request a Free Estimate — IGY6 Rooted",
          url: "https://igy6rooted.com/free-estimate",
        }}
      />

      {/* Hero */}
      <section className="bg-[hsl(82,25%,22%)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl">
            <span className="text-sm font-semibold text-[hsl(82,50%,70%)] uppercase tracking-wider">
              No Obligation · 100 % Free
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mt-2 mb-4">
              Get Your <span className="text-[hsl(82,50%,65%)]">Free Estimate</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl">
              Fill out the form below and a member of our team will get back to you quickly — usually within a few hours.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Jobber Embed — takes 3 cols */}
            <div className="lg:col-span-3" ref={formRef}>
              <div
                id={CLIENTHUB_ID}
                className="rounded-xl border border-[hsl(82,15%,90%)] p-1 min-h-[550px]"
              />
            </div>

            {/* Sidebar info */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-[hsl(82,25%,20%)]">
                Why Choose IGY6 Rooted?
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-[hsl(82,30%,93%)]">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(82,30%,40%)] flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(82,25%,20%)]">Fully Licensed & Insured</p>
                    <p className="text-sm text-[hsl(82,10%,45%)]">Veteran-owned and operated in Northwest Florida.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-[hsl(82,10%,96%)]">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(82,25%,30%)] flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(82,25%,20%)]">{SITE_CONFIG.business.hours}</p>
                    <p className="text-sm text-[hsl(82,10%,45%)]">24/7 emergency services available.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-[hsl(82,10%,96%)]">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(82,25%,30%)] flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(82,25%,20%)]">Niceville, FL 32578</p>
                    <p className="text-sm text-[hsl(82,10%,45%)]">Serving Niceville, Destin, FWB & surrounding areas.</p>
                  </div>
                </div>

                <a
                  href="tel:+15182650275"
                  onClick={trackPhoneClick}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(82,25%,28%)] text-white hover:bg-[hsl(82,25%,22%)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{SITE_CONFIG.business.phone}</p>
                    <p className="text-sm text-white/70">Prefer to talk? Give us a call.</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
