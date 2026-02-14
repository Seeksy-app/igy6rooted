import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const url = new URL(req.url);
    const orgId = url.searchParams.get("org_id");
    const redirectUri = url.searchParams.get("redirect_uri");

    if (!orgId || !UUID_REGEX.test(orgId)) {
      return new Response(JSON.stringify({ error: "Valid org_id is required" }), {
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

    // Validate redirect_uri against allowlist
    const appUrl = supabaseUrl.replace(/\/functions\/.*/, "");
    const allowedOrigins = [appUrl, "http://localhost:5173", "http://localhost:8080"];
    const redirectOrigin = new URL(redirectUri).origin;
    if (!allowedOrigins.some(o => redirectOrigin.startsWith(o))) {
      const isLovableApp = redirectOrigin.endsWith(".lovable.app");
      if (!isLovableApp) {
        return new Response(JSON.stringify({ error: "Invalid redirect_uri" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Verify user is org member
    const serviceSupabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: membership } = await serviceSupabase
      .from("team_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", userId)
      .single();

    if (!membership) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
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

    const scopes = [
      "ads_read",
      "ads_management",
      "business_management",
      "read_insights",
      "pages_show_list"
    ].join(",");

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
