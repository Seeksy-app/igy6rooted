/**
 * Google Ads conversion tracking helpers.
 * The global gtag snippet is loaded in index.html.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const AW_ID = "AW-16810284810";
const CONVERSION_LABEL = "MRieCLr2yKgcEIqu4s8-";

/** Fire a Google Ads conversion event */
export function trackConversion(valueDollars = 1.0) {
  window.gtag?.("event", "conversion", {
    send_to: `${AW_ID}/${CONVERSION_LABEL}`,
    value: valueDollars,
    currency: "USD",
  });
}

/** Track "Get Free Estimate" CTA click */
export function trackEstimateClick() {
  trackConversion(1.0);
}

/** Track phone call click */
export function trackPhoneClick() {
  trackConversion(1.0);
}

/** Track referral / offer form submission */
export function trackFormSubmit() {
  trackConversion(1.0);
}
