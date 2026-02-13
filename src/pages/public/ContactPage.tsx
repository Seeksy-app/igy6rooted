import { Helmet } from "react-helmet-async";
import { Phone, Mail, MapPin, Clock, Shield } from "lucide-react";

export default function ContactPage() {
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
              Ready for a free estimate? Call us today or send us an email. We respond quickly.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <div>
              <h2 className="text-2xl font-bold text-[hsl(82,25%,20%)] mb-8">Get Your Free Estimate</h2>
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

            {/* Map */}
            <div className="rounded-xl overflow-hidden shadow-lg border border-[hsl(82,15%,90%)]">
              <iframe
                title="IGY6 Rooted Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.789!2d-86.4822!3d30.5169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8893e0d8e34a4f91%3A0x2567a2d79f99de62!2s1639+Parkside+Cir%2C+Niceville%2C+FL+32578!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "500px" }}
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
