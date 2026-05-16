import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { LocalBusinessSchema } from "./LocalBusinessSchema";
import { trackPageView } from "@/lib/analytics";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();

  useEffect(() => {
    // Google Ads "Page view (1)" conversion
    window.gtag?.("event", "conversion", {
      send_to: "AW-16810284810/5DxVCNqo5KocEIqu4s8-",
    });
    // GA4 page_view + internal page_views log (for dashboard funnel)
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex flex-col">
      <LocalBusinessSchema />
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
