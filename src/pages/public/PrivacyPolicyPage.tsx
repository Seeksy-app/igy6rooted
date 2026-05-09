import { SEOHead } from "@/components/public/SEOHead";

export default function PrivacyPolicyPage() {
  const lastUpdated = "May 9, 2026";

  return (
    <>
      <SEOHead
        title="Privacy Policy | IGY6 Rooted"
        description="How IGY6 Rooted Stump Grinding & Tree Service collects, uses, and protects your personal information."
        path="/privacy"
      />
      <div className="bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-[hsl(82,25%,18%)] mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: {lastUpdated}</p>

          <div className="prose prose-neutral max-w-none space-y-6 text-foreground/80">
            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">1. Introduction</h2>
              <p>
                IGY6 Rooted Stump Grinding & Tree Service ("we", "us", "our") respects your privacy.
                This Privacy Policy explains what information we collect when you visit our website
                or request our services, how we use it, and the choices you have.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">2. Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Contact details</strong> you provide (name, phone, email, service address) when requesting an estimate or contacting us.</li>
                <li><strong>Project details</strong> such as the type of tree service requested, photos, and notes.</li>
                <li><strong>Usage data</strong> like pages viewed, browser type, device, and approximate location, collected via cookies and analytics tools (e.g. Google Analytics, Google Ads).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To respond to estimate requests and schedule service.</li>
                <li>To send appointment confirmations, follow-ups, and service updates.</li>
                <li>To improve our website, marketing, and customer experience.</li>
                <li>To comply with legal obligations and protect our rights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">4. Sharing Your Information</h2>
              <p>
                We do not sell your personal information. We may share it with trusted service
                providers (such as scheduling, CRM, payment, and analytics platforms) who help us
                run our business, and only to the extent needed for them to perform their work.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">5. Cookies & Tracking</h2>
              <p>
                We use cookies and similar technologies to operate the site, measure traffic, and
                improve our advertising. You can disable cookies in your browser, but parts of the
                site may not function properly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">6. SMS & Call Communications</h2>
              <p>
                If you provide your phone number, you consent to receive calls and text messages from
                us regarding your estimate or service. Standard message and data rates may apply.
                Reply STOP to opt out of texts at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">7. Data Security</h2>
              <p>
                We use reasonable administrative, technical, and physical safeguards to protect your
                information. No system is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">8. Your Rights</h2>
              <p>
                You may request access to, correction of, or deletion of your personal information by
                contacting us at the details below. We will respond within a reasonable timeframe.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">9. Children's Privacy</h2>
              <p>
                Our services are not directed to children under 13, and we do not knowingly collect
                personal information from them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. The "Last updated" date above
                indicates when it was last revised.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[hsl(82,25%,18%)]">11. Contact Us</h2>
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
