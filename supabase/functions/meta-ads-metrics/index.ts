import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function refreshMetaToken(refreshToken: string): Promise<{ access_token: string; expires_in?: number } | null> {
  const appId = Deno.env.get("META_APP_ID");
  const appSecret = Deno.env.get("META_APP_SECRET");

  if (!appId || !appSecret) {
    console.error("Meta OAuth credentials not configured");
    return null;
  }

  try {
    // Meta uses long-lived tokens that can be exchanged for new ones
    const response = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `fb_exchange_token=${refreshToken}`,
      { method: "GET" }
    );

    if (!response.ok) {
      console.error("Failed to refresh Meta token:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error refreshing Meta token:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { org_id, date_range } = await req.json();

    if (!org_id) {
      return new Response(
        JSON.stringify({ error: "org_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Meta Ads connection for this org
    const { data: connection, error: connError } = await supabase
      .from("integration_ad_accounts")
      .select("*")
      .eq("org_id", org_id)
      .eq("provider", "meta_ads")
      .eq("status", "connected")
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "Meta Ads not connected", connected: false }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let accessToken = connection.access_token;

    // Check if token needs refresh (Meta tokens last ~60 days)
    if (connection.token_expires_at) {
      const expiresAt = new Date(connection.token_expires_at);
      const now = new Date();
      
      // Refresh if token expires within 7 days
      const refreshThreshold = new Date();
      refreshThreshold.setDate(refreshThreshold.getDate() + 7);
      
      if (expiresAt <= refreshThreshold && connection.refresh_token) {
        console.log("Token expiring soon, refreshing...");
        const newTokens = await refreshMetaToken(connection.refresh_token || accessToken);
        
        if (newTokens) {
          accessToken = newTokens.access_token;
          const newExpiresAt = newTokens.expires_in 
            ? new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
            : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // Default 60 days
          
          // Update tokens in database
          await supabase
            .from("integration_ad_accounts")
            .update({
              access_token: accessToken,
              refresh_token: accessToken, // Meta uses same token
              token_expires_at: newExpiresAt,
              updated_at: new Date().toISOString(),
            })
            .eq("id", connection.id);
        }
      }
    }

    // Calculate date range (default: last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (date_range?.days || 30));

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    // First, get the ad accounts accessible to this user
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status&access_token=${accessToken}`
    );

    if (!accountsResponse.ok) {
      const errorData = await accountsResponse.json();
      console.error("Failed to fetch ad accounts:", errorData);
      
      if (errorData.error?.code === 190) {
        // Token expired
        await supabase
          .from("integration_ad_accounts")
          .update({
            status: "error",
            last_error: "Access token expired",
            updated_at: new Date().toISOString(),
          })
          .eq("id", connection.id);

        return new Response(
          JSON.stringify({ error: "Token expired, please reconnect", connected: false }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch Meta Ads data", 
          details: errorData.error?.message,
          connected: true 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accountsData = await accountsResponse.json();
    const adAccounts = accountsData.data || [];

    if (adAccounts.length === 0) {
      return new Response(
        JSON.stringify({
          connected: true,
          account_name: connection.account_name,
          metrics: { impressions: 0, clicks: 0, spend: 0, conversions: 0 },
          campaigns: [],
          message: "No ad accounts found",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch insights from all ad accounts
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalConversions = 0;
    let totalReach = 0;
    const allCampaigns: any[] = [];

    for (const account of adAccounts) {
      // Skip inactive accounts
      if (account.account_status !== 1) continue;

      const accountId = account.id;

      // Fetch account-level insights
      const insightsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${accountId}/insights?` +
        `fields=impressions,clicks,spend,reach,actions&` +
        `time_range={'since':'${formatDate(startDate)}','until':'${formatDate(endDate)}'}&` +
        `access_token=${accessToken}`
      );

      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        const insights = insightsData.data?.[0];
        
        if (insights) {
          totalImpressions += parseInt(insights.impressions || 0);
          totalClicks += parseInt(insights.clicks || 0);
          totalSpend += parseFloat(insights.spend || 0);
          totalReach += parseInt(insights.reach || 0);
          
          // Extract conversions from actions
          const actions = insights.actions || [];
          const leadAction = actions.find((a: any) => a.action_type === "lead");
          const purchaseAction = actions.find((a: any) => a.action_type === "purchase");
          totalConversions += parseInt(leadAction?.value || 0) + parseInt(purchaseAction?.value || 0);
        }
      }

      // Fetch campaign-level data
      const campaignsResponse = await fetch(
        `https://graph.facebook.com/v19.0/${accountId}/campaigns?` +
        `fields=id,name,status,objective,insights.time_range({'since':'${formatDate(startDate)}','until':'${formatDate(endDate)}'}){impressions,clicks,spend,reach,actions}&` +
        `access_token=${accessToken}`
      );

      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();
        const campaigns = campaignsData.data || [];

        for (const campaign of campaigns) {
          const insights = campaign.insights?.data?.[0];
          if (insights) {
            const impressions = parseInt(insights.impressions || 0);
            const clicks = parseInt(insights.clicks || 0);
            const spend = parseFloat(insights.spend || 0);
            
            // Extract conversions
            const actions = insights.actions || [];
            const leadAction = actions.find((a: any) => a.action_type === "lead");
            const purchaseAction = actions.find((a: any) => a.action_type === "purchase");
            const conversions = parseInt(leadAction?.value || 0) + parseInt(purchaseAction?.value || 0);

            allCampaigns.push({
              id: campaign.id,
              name: campaign.name,
              status: campaign.status,
              objective: campaign.objective,
              impressions,
              clicks,
              spend,
              reach: parseInt(insights.reach || 0),
              conversions,
              ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
              cpc: clicks > 0 ? spend / clicks : 0,
            });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        connected: true,
        account_name: connection.account_name,
        ad_accounts: adAccounts.map((a: any) => ({ id: a.id, name: a.name })),
        metrics: {
          impressions: totalImpressions,
          clicks: totalClicks,
          spend: totalSpend,
          reach: totalReach,
          conversions: totalConversions,
          ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
          cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
          cpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
          conversion_rate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
        },
        campaigns: allCampaigns,
        date_range: {
          start: formatDate(startDate),
          end: formatDate(endDate),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in meta-ads-metrics:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
