import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Phone, Mail, MapPin, Clock, Shield } from "lucide-react";

export default function ContactPage() {
  useEffect(() => {
    // Load Jobber embed stylesheet
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://d3ey4dbjkt2f6s.cloudfront.net/assets/external/work_request_embed.css";
    link.media = "screen";
    document.head.appendChild(link);

    // Load Jobber embed script
    const script = document.createElement("script");
    script.src = "https://d3ey4dbjkt2f6s.cloudfront.net/assets/static_link/work_request_embed_snippet.js";
    script.setAttribute("clienthub_id", "098c4d0e-40ac-4280-b8c9-70e5a93704f7-2162555");
    script.setAttribute("form_url", "https://clienthub.getjobber.com/client_hubs/098c4d0e-40ac-4280-b8c9-70e5a93704f7/public/work_request/embedded_work_request_form?form_id=2162555");
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Contact IGY6 Rooted | Free Tree Service Estimate in Niceville, FL</title>
        <meta
          name="description"
          content="Contact IGY6 Rooted for a free tree service estimate in Northwest Florida. Call (518) 265-0275. Open 7 days a week, 7am-9pm. Emergency services available."
        />
      </Helmet>

      {/* Hero */}
      <section className="bg-[hsl(82,25%,22%)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="text-sm font-semibold text-[hsl(82,50%,70%)] uppercase tracking-wider">
              Get In Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mt-2 mb-6">
              Contact <span className="text-[hsl(82,50%,65%)]">IGY6 Rooted</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl">
              Ready for a free estimate? Fill out the form below or give us a call. We respond quickly.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Jobber Embed Form */}
            <div>
              <h2 className="text-2xl font-bold text-[hsl(82,25%,20%)] mb-6">Request a Free Estimate</h2>
              <div
                id="098c4d0e-40ac-4280-b8c9-70e5a93704f7-2162555"
                className="rounded-xl border border-[hsl(82,15%,90%)] p-1 min-h-[500px]"
              />
            </div>

            {/* Contact info */}
            <div>
              <h2 className="text-2xl font-bold text-[hsl(82,25%,20%)] mb-8">Other Ways to Reach Us</h2>
              <div className="space-y-6">
                <a
                  href="tel:+15182650275"
                  className="flex items-center gap-4 p-5 rounded-xl bg-[hsl(82,30%,93%)] hover:bg-[hsl(82,30%,88%)] transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-[hsl(82,30%,40%)] flex items-center justify-center">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(82,25%,20%)]">(518) 265-0275</p>
                    <p className="text-sm text-[hsl(82,10%,50%)]">Call us anytime during business hours</p>
                  </div>
                </a>
                <a
                  href="mailto:CO@IGY6Rooted.com"
                  className="flex items-center gap-4 p-5 rounded-xl bg-[hsl(82,10%,96%)] hover:bg-[hsl(82,10%,93%)] transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-[hsl(82,25%,30%)] flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(82,25%,20%)]">CO@IGY6Rooted.com</p>
                    <p className="text-sm text-[hsl(82,10%,50%)]">Send us a message anytime</p>
                  </div>
                </a>
                <div className="flex items-center gap-4 p-5 rounded-xl bg-[hsl(82,10%,96%)]">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(82,25%,30%)] flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(82,25%,20%)]">1639 Parkside Cir</p>
                    <p className="text-sm text-[hsl(82,10%,50%)]">Niceville, FL 32578</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-xl bg-[hsl(82,10%,96%)]">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(82,25%,30%)] flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(82,25%,20%)]">Mon–Sun: 7:00 AM – 9:00 PM CST</p>
                    <p className="text-sm text-[hsl(82,10%,50%)]">Emergency services available outside hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-xl bg-[hsl(82,10%,96%)]">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(82,25%,30%)] flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[hsl(82,25%,20%)]">Fully Licensed & Insured</p>
                    <p className="text-sm text-[hsl(82,10%,50%)]">Veteran-owned and operated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
