/**
 * Unified analytics: GA4 + internal page_views logger.
 * Fires `page_view` to GA4 on every SPA route change and stores a
 * row in the `page_views` Supabase table so we can build dropoff
 * funnels on the dashboard.
 */
import { supabase } from "@/integrations/supabase/client";

const GA4_ID = "G-3EMJJ9VHYY";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

/** Stable per-tab session ID so we can group a visitor's pageviews into a funnel. */
function getSessionId(): string {
  try {
    const KEY = "ig6_sid";
    let sid = sessionStorage.getItem(KEY);
    if (!sid) {
      sid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(KEY, sid);
    }
    return sid;
  } catch {
    return `nostorage-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function getUtms(): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
} {
  try {
    const p = new URLSearchParams(window.location.search);
    return {
      utm_source: p.get("utm_source") || undefined,
      utm_medium: p.get("utm_medium") || undefined,
      utm_campaign: p.get("utm_campaign") || undefined,
    };
  } catch {
    return {};
  }
}

/** Fire a GA4 page_view + log to our DB. Call on every public route change. */
export async function trackPageView(path: string) {
  // GA4
  window.gtag?.("event", "page_view", {
    send_to: GA4_ID,
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });

  // Meta Pixel — fire on SPA route changes
  window.fbq?.("track", "PageView");

  // DB — fire-and-forget; we don't block on failures
  try {
    const utms = getUtms();
    await supabase.functions.invoke("integration-proxy", {
      body: {
        action: "log_page_view",
        path,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        session_id: getSessionId(),
        ...utms,
      },
    });
  } catch (err) {
    console.warn("[analytics] page_view log failed", err);
  }
}

/** GA4 funnel event. Use for view_services, begin_estimate, submit_estimate, etc. */
export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  window.gtag?.("event", eventName, {
    send_to: GA4_ID,
    ...params,
  });
}
