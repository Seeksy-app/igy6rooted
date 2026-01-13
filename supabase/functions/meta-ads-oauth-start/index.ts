import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const orgId = url.searchParams.get("org_id");
    const redirectUri = url.searchParams.get("redirect_uri");

    if (!orgId) {
      return new Response(JSON.stringify({ error: "org_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!redirectUri) {
      return new Response(JSON.stringify({ error: "redirect_uri is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const appId = Deno.env.get("META_APP_ID");
    if (!appId) {
      console.error("META_APP_ID not configured");
      return new Response(JSON.stringify({ error: "Meta OAuth not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Meta Marketing API scopes
    const scopes = [
      "ads_read",
      "ads_management",
      "business_management",
      "read_insights",
      "pages_show_list"
    ].join(",");

    // State includes org_id for the callback
    const state = btoa(JSON.stringify({ org_id: orgId, provider: "meta_ads" }));

    const authUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
    authUrl.searchParams.set("client_id", appId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("state", state);

    console.log(`Starting Meta Ads OAuth for org ${orgId}`);

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        "Location": authUrl.toString(),
      },
    });
  } catch (error) {
    console.error("Error starting Meta Ads OAuth:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
