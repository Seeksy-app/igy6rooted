import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Phone, Mail, MapPin, CheckCircle, Loader2, TreePine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(7, "Phone number is required").max(20),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export default function ReferralLandingPage() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref") || "postcard";
  const campaign = searchParams.get("campaign") || "";
  const offer = searchParams.get("offer") || "";

  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Also load the Jobber embed as a fallback
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://d3ey4dbjkt2f6s.cloudfront.net/assets/external/work_request_embed.css";
    link.media = "screen";
    document.head.appendChild(link);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = leadSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || "Please check your info");
      return;
    }

    setSubmitting(true);
    try {
      // We need to find the org for IGY6 Rooted — use the first org or a known one
      // For public submissions, we insert via the edge function or directly with service key
      // Since this is a public page, we'll call an edge function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/integration-proxy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: "submit_referral_lead",
          customer_name: parsed.data.name,
          customer_phone: parsed.data.phone,
          customer_email: parsed.data.email || null,
          address: parsed.data.address || null,
          notes: parsed.data.notes || null,
          referral_source: ref,
          campaign: campaign,
          offer: offer,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      setSubmitted(true);
      toast.success("We got your info! We'll be in touch soon.");
    } catch (err) {
      toast.error("Something went wrong. Please call us instead at (518) 265-0275.");
    } finally {
      setSubmitting(false);
    }
  };

  const offerText = offer || "a Free Estimate";

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Thank You | IGY6 Rooted Tree Service</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b from-[hsl(82,25%,22%)] to-[hsl(82,20%,30%)] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
            <CheckCircle className="h-16 w-16 text-[hsl(82,40%,45%)] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[hsl(82,25%,20%)] mb-2">Thank You!</h1>
            <p className="text-[hsl(82,10%,40%)] mb-6">
              We received your request. A team member will reach out shortly to schedule your service.
            </p>
            <a
              href="tel:+15182650275"
              className="inline-flex items-center gap-2 bg-[hsl(82,30%,40%)] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[hsl(82,30%,35%)] transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call (518) 265-0275
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Special Offer | IGY6 Rooted Tree Service - Niceville, FL</title>
        <meta
          name="description"
          content="Claim your special offer from IGY6 Rooted. Veteran-owned tree service in Northwest Florida. Free estimates available."
        />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[hsl(82,25%,22%)] to-[hsl(82,20%,28%)] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium text-[hsl(82,50%,70%)] mb-6">
              <TreePine className="h-4 w-4" />
              Veteran-Owned & Operated
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
              Claim Your <span className="text-[hsl(82,50%,65%)]">{offerText}</span>
            </h1>
            <p className="text-lg text-white/75">
              Fill out the form below and we'll get back to you within 24 hours. Professional tree service you can trust.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-[hsl(82,25%,20%)] mb-6">Get Your {offerText}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[hsl(82,15%,30%)] mb-1">Full Name *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="John Smith"
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[hsl(82,15%,30%)] mb-1">Phone Number *</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    type="tel"
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[hsl(82,15%,30%)] mb-1">Email (optional)</label>
                  <Input
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="john@example.com"
                    type="email"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[hsl(82,15%,30%)] mb-1">Service Address (optional)</label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="123 Main St, Niceville, FL"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[hsl(82,15%,30%)] mb-1">What do you need help with?</label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="e.g., Large oak tree needs trimming, stump removal..."
                    rows={3}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-[hsl(82,30%,40%)] hover:bg-[hsl(82,30%,35%)] text-white text-base font-semibold"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    `Claim ${offerText}`
                  )}
                </Button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[hsl(82,30%,93%)] rounded-xl p-6">
                <h3 className="font-bold text-[hsl(82,25%,20%)] mb-4">Why Choose IGY6 Rooted?</h3>
                <ul className="space-y-3 text-sm text-[hsl(82,15%,30%)]">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[hsl(82,40%,45%)] mt-0.5 shrink-0" />
                    <span>Veteran-owned & operated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[hsl(82,40%,45%)] mt-0.5 shrink-0" />
                    <span>Fully licensed & insured</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[hsl(82,40%,45%)] mt-0.5 shrink-0" />
                    <span>Free estimates, no obligation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[hsl(82,40%,45%)] mt-0.5 shrink-0" />
                    <span>Serving all of Northwest Florida</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[hsl(82,40%,45%)] mt-0.5 shrink-0" />
                    <span>Emergency services available</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <a
                  href="tel:+15182650275"
                  className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(82,10%,96%)] hover:bg-[hsl(82,10%,93%)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[hsl(82,30%,40%)] flex items-center justify-center">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[hsl(82,25%,20%)]">(518) 265-0275</p>
                    <p className="text-xs text-[hsl(82,10%,50%)]">Call us anytime</p>
                  </div>
                </a>
                <a
                  href="mailto:CO@IGY6Rooted.com"
                  className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(82,10%,96%)] hover:bg-[hsl(82,10%,93%)] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[hsl(82,25%,30%)] flex items-center justify-center">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[hsl(82,25%,20%)]">CO@IGY6Rooted.com</p>
                    <p className="text-xs text-[hsl(82,10%,50%)]">Email us anytime</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(82,10%,96%)]">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(82,25%,30%)] flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[hsl(82,25%,20%)]">Niceville, FL</p>
                    <p className="text-xs text-[hsl(82,10%,50%)]">Serving NW Florida</p>
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
