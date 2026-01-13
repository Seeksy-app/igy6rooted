import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useOrg } from "@/contexts/OrgContext";

export default function GoogleAdsCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentOrg } = useOrg();
  const [status, setStatus] = useState<"processing" | "error">("processing");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("OAuth error:", error);
      navigate(`/integrations?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!code || !state) {
      navigate("/integrations?error=missing_params");
      return;
    }

    // Forward to edge function for token exchange
    const callbackUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-ads-oauth-callback`;
    const params = new URLSearchParams({
      code,
      state,
      redirect_uri: `${window.location.origin}/integrations/google-ads/callback`,
      base_url: window.location.origin,
    });

    window.location.href = `${callbackUrl}?${params.toString()}`;
  }, [searchParams, navigate, currentOrg]);

  if (status === "error") {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">Connection failed. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Connecting your Google Ads account...</p>
    </div>
  );
}
