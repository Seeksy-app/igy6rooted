import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const redirectUri = url.searchParams.get("redirect_uri");

    // Get the base URL for redirects
    const baseUrl = url.searchParams.get("base_url") || url.origin.replace(/\/functions\/v1.*/, "");

    if (error) {
      console.error("OAuth error:", error);
      return new Response(null, {
        status: 302,
        headers: { Location: `${baseUrl}/integrations?error=${encodeURIComponent(error)}` },
      });
    }

    if (!code || !state) {
      return new Response(null, {
        status: 302,
        headers: { Location: `${baseUrl}/integrations?error=missing_params` },
      });
    }

    // Decode state
    let stateData;
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return new Response(null, {
        status: 302,
        headers: { Location: `${baseUrl}/integrations?error=invalid_state` },
      });
    }

    const { org_id } = stateData;
    if (!org_id) {
      return new Response(null, {
        status: 302,
        headers: { Location: `${baseUrl}/integrations?error=missing_org_id` },
      });
    }

    const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      console.error("Google OAuth credentials not configured");
      return new Response(null, {
        status: 302,
        headers: { Location: `${baseUrl}/integrations?error=oauth_not_configured` },
      });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri || `${baseUrl}/integrations/google-ads/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return new Response(null, {
        status: 302,
        headers: { Location: `${baseUrl}/integrations?error=token_exchange_failed` },
      });
    }

    console.log("Google Ads OAuth token obtained successfully");

    // Get user info for account name
    let accountName = "Google Ads Account";
    try {
      const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userInfo = await userInfoResponse.json();
      accountName = userInfo.email || accountName;
    } catch (e) {
      console.log("Could not fetch user info:", e);
    }

    // Store tokens in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    const { error: dbError } = await supabase
      .from("integration_ad_accounts")
      .upsert({
        org_id,
        provider: "google_ads",
        account_name: accountName,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: expiresAt,
        scopes: tokenData.scope?.split(" ") || [],
        status: "connected",
        connected_at: new Date().toISOString(),
        last_error: null,
      }, {
        onConflict: "org_id,provider",
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(null, {
        status: 302,
        headers: { Location: `${baseUrl}/integrations?error=database_error` },
      });
    }

    console.log(`Google Ads connected successfully for org ${org_id}`);

    return new Response(null, {
      status: 302,
      headers: { Location: `${baseUrl}/integrations?success=google_ads_connected` },
    });
  } catch (error) {
    console.error("Error in Google Ads OAuth callback:", error);
    return new Response(null, {
      status: 302,
      headers: { Location: `/integrations?error=internal_error` },
    });
  }
});
