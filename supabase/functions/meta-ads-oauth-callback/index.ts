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

    const appId = Deno.env.get("META_APP_ID");
    const appSecret = Deno.env.get("META_APP_SECRET");

    if (!appId || !appSecret) {
      console.error("Meta OAuth credentials not configured");
      return new Response(null, {
        status: 302,
        headers: { Location: `${baseUrl}/integrations?error=oauth_not_configured` },
      });
    }

    // Exchange code for tokens
    const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("code", code);
    tokenUrl.searchParams.set("redirect_uri", redirectUri || `${baseUrl}/integrations/meta-ads/callback`);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return new Response(null, {
        status: 302,
        headers: { Location: `${baseUrl}/integrations?error=token_exchange_failed` },
      });
    }

    console.log("Meta Ads OAuth token obtained successfully");

    // Exchange short-lived token for long-lived token
    const longLivedTokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
    longLivedTokenUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedTokenUrl.searchParams.set("client_id", appId);
    longLivedTokenUrl.searchParams.set("client_secret", appSecret);
    longLivedTokenUrl.searchParams.set("fb_exchange_token", tokenData.access_token);

    const longLivedResponse = await fetch(longLivedTokenUrl.toString());
    const longLivedData = await longLivedResponse.json();

    const finalToken = longLivedData.access_token || tokenData.access_token;
    const expiresIn = longLivedData.expires_in || tokenData.expires_in;

    // Get user info for account name
    let accountName = "Meta Ads Account";
    let accountId = null;
    try {
      const userInfoResponse = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${finalToken}`
      );
      const userInfo = await userInfoResponse.json();
      accountName = userInfo.name || userInfo.email || accountName;
      accountId = userInfo.id;
    } catch (e) {
      console.log("Could not fetch user info:", e);
    }

    // Store tokens in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    const { error: dbError } = await supabase
      .from("integration_ad_accounts")
      .upsert({
        org_id,
        provider: "meta_ads",
        account_id: accountId,
        account_name: accountName,
        access_token: finalToken,
        refresh_token: null, // Meta uses long-lived tokens instead of refresh tokens
        token_expires_at: expiresAt,
        scopes: ["ads_read", "ads_management", "business_management", "read_insights"],
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

    console.log(`Meta Ads connected successfully for org ${org_id}`);

    return new Response(null, {
      status: 302,
      headers: { Location: `${baseUrl}/integrations?success=meta_ads_connected` },
    });
  } catch (error) {
    console.error("Error in Meta Ads OAuth callback:", error);
    return new Response(null, {
      status: 302,
      headers: { Location: `/integrations?error=internal_error` },
    });
  }
});
