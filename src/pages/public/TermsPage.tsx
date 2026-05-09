import { SEOHead } from "@/components/public/SEOHead";

export default function TermsPage() {
  const lastUpdated = "May 9, 2026";

  return (
    <>
      <SEOHead
        title="Terms & Conditions | IGY6 Rooted"
        description="The terms and conditions governing your use of IGY6 Rooted's website and tree care services in Northwest Florida."
        path="/terms"
      />
      <div className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-[hsl(82,25%,18%)] mb-2">Terms & Conditions</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: {lastUpdated}</p>

          <div className="prose prose-neutral max-w-none space-y-6 text-foreground/80">
            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">1. Agreement</h2>
              <p>
                These Terms & Conditions ("Terms") govern your use of the IGY6 Rooted Stump Grinding
                & Tree Service ("IGY6 Rooted", "we", "us") website and any services we provide. By
                using our site or hiring us, you agree to these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">2. Estimates</h2>
              <p>
                Estimates are provided in good faith based on information available at the time of
                inspection. Final pricing may be adjusted if the scope of work changes, conditions
                differ from those observed during estimation, or hidden hazards are discovered.
                Estimates are valid for 30 days unless otherwise stated.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">3. Scheduling & Cancellations</h2>
              <p>
                Service dates are scheduled by mutual agreement and may be affected by weather, prior
                jobs running long, or emergency calls. We will make reasonable efforts to provide
                advance notice of any rescheduling. Customers may cancel up to 24 hours before a
                scheduled job without charge.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">4. Property Access & Authorization</h2>
              <p>
                By scheduling service, you confirm that you are the property owner or are authorized
                to approve the work, including the removal, trimming, or grinding described. You are
                responsible for identifying property lines, underground utilities not marked by 811,
                irrigation, septic, and any other hidden infrastructure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">5. Payment</h2>
              <p>
                Payment is due upon completion of the work unless other terms are agreed in writing.
                We accept cash, check, and major credit cards. Past-due balances may accrue interest
                and collection costs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">6. Workmanship & Warranty</h2>
              <p>
                We are licensed and insured and perform our work to industry standards. We do not
                warrant the future health of trees or stumps not removed in full, the survival of
                trimmed trees, or root regrowth. Any specific warranty will be stated in writing on
                your work order.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">7. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, IGY6 Rooted is not liable for indirect,
                incidental, or consequential damages arising from our services or your use of this
                website. Our total liability for any claim is limited to the amount paid by you for
                the specific service giving rise to the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">8. Website Use</h2>
              <p>
                Content on this website is provided for informational purposes. You may not copy,
                redistribute, or use our content, logos, or photographs for commercial purposes
                without prior written permission. We may modify or remove content at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">9. Communications Consent</h2>
              <p>
                When you submit a contact or estimate form, you consent to be contacted by phone,
                text, or email regarding your request. Reply STOP to opt out of text messages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">10. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the State of Florida, without regard to its
                conflict of laws principles. Any disputes will be resolved in the state or federal
                courts located in Okaloosa County, Florida.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">11. Changes</h2>
              <p>
                We may update these Terms from time to time. Continued use of our website or services
                after changes constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">12. Contact</h2>
              <p>
                IGY6 Rooted Stump Grinding & Tree Service<br />
                Niceville, FL 32578<br />
                Phone: <a href="tel:+15182650275" className="text-[hsl(82,30%,35%)] underline">(518) 265-0275</a><br />
                Email: <a href="mailto:CO@IGY6Rooted.com" className="text-[hsl(82,30%,35%)] underline">CO@IGY6Rooted.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
