import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";
import { LocalBusinessSchema } from "./LocalBusinessSchema";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();

  // Fire Google Ads "Page view (1)" conversion on every public page view
  useEffect(() => {
    window.gtag?.("event", "conversion", {
      send_to: "AW-16810284810/5DxVCNqo5KocEIqu4s8-",
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <LocalBusinessSchema />
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
