import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function refreshGoogleToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    console.error("Google OAuth credentials not configured");
    return null;
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      console.error("Failed to refresh Google token:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error refreshing Google token:", error);
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

    // Get Google Ads connection for this org
    const { data: connection, error: connError } = await supabase
      .from("integration_ad_accounts")
      .select("*")
      .eq("org_id", org_id)
      .eq("provider", "google_ads")
      .eq("status", "connected")
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "Google Ads not connected", connected: false }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let accessToken = connection.access_token;

    // Check if token needs refresh
    if (connection.token_expires_at) {
      const expiresAt = new Date(connection.token_expires_at);
      const now = new Date();
      
      if (expiresAt <= now && connection.refresh_token) {
        console.log("Token expired, refreshing...");
        const newTokens = await refreshGoogleToken(connection.refresh_token);
        
        if (newTokens) {
          accessToken = newTokens.access_token;
          const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();
          
          // Update tokens in database
          await supabase
            .from("integration_ad_accounts")
            .update({
              access_token: accessToken,
              token_expires_at: newExpiresAt,
              updated_at: new Date().toISOString(),
            })
            .eq("id", connection.id);
        } else {
          // Mark connection as error
          await supabase
            .from("integration_ad_accounts")
            .update({
              status: "error",
              last_error: "Token refresh failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", connection.id);

          return new Response(
            JSON.stringify({ error: "Token refresh failed", connected: false }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Calculate date range (default: last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (date_range?.days || 30));

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    // First, get the customer IDs accessible to this user
    const developerToken = Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN");
    
    if (!developerToken) {
      console.log("No developer token configured, returning mock data");
      // Return sample metrics structure when developer token is not available
      return new Response(
        JSON.stringify({
          connected: true,
          account_name: connection.account_name,
          metrics: {
            impressions: 0,
            clicks: 0,
            cost: 0,
            conversions: 0,
            ctr: 0,
            cpc: 0,
            conversion_rate: 0,
          },
          campaigns: [],
          date_range: {
            start: formatDate(startDate),
            end: formatDate(endDate),
          },
          message: "Developer token not configured. Add GOOGLE_ADS_DEVELOPER_TOKEN to fetch real metrics.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get accessible customers
    const customersResponse = await fetch(
      "https://googleads.googleapis.com/v15/customers:listAccessibleCustomers",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "developer-token": developerToken,
        },
      }
    );

    if (!customersResponse.ok) {
      const errorText = await customersResponse.text();
      console.error("Failed to list customers:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch Google Ads data", 
          details: errorText,
          connected: true 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const customersData = await customersResponse.json();
    const customerIds = customersData.resourceNames?.map((r: string) => r.split("/")[1]) || [];

    if (customerIds.length === 0) {
      return new Response(
        JSON.stringify({
          connected: true,
          account_name: connection.account_name,
          metrics: { impressions: 0, clicks: 0, cost: 0, conversions: 0 },
          campaigns: [],
          message: "No Google Ads accounts found",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch metrics from first accessible customer
    const customerId = customerIds[0];
    const query = `
      SELECT
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM campaign
      WHERE segments.date BETWEEN '${formatDate(startDate)}' AND '${formatDate(endDate)}'
    `;

    const metricsResponse = await fetch(
      `https://googleads.googleapis.com/v15/customers/${customerId}/googleAds:search`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "developer-token": developerToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      }
    );

    if (!metricsResponse.ok) {
      const errorText = await metricsResponse.text();
      console.error("Failed to fetch metrics:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch campaign metrics", 
          details: errorText,
          connected: true 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const metricsData = await metricsResponse.json();
    const results = metricsData.results || [];

    // Aggregate metrics
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalCostMicros = 0;
    let totalConversions = 0;

    const campaigns = results.map((row: any) => {
      const impressions = parseInt(row.metrics?.impressions || 0);
      const clicks = parseInt(row.metrics?.clicks || 0);
      const costMicros = parseInt(row.metrics?.costMicros || 0);
      const conversions = parseFloat(row.metrics?.conversions || 0);

      totalImpressions += impressions;
      totalClicks += clicks;
      totalCostMicros += costMicros;
      totalConversions += conversions;

      return {
        name: row.campaign?.name,
        status: row.campaign?.status,
        impressions,
        clicks,
        cost: costMicros / 1_000_000,
        conversions,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        cpc: clicks > 0 ? (costMicros / 1_000_000) / clicks : 0,
      };
    });

    const totalCost = totalCostMicros / 1_000_000;

    return new Response(
      JSON.stringify({
        connected: true,
        account_name: connection.account_name,
        customer_id: customerId,
        metrics: {
          impressions: totalImpressions,
          clicks: totalClicks,
          cost: totalCost,
          conversions: totalConversions,
          ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
          cpc: totalClicks > 0 ? totalCost / totalClicks : 0,
          conversion_rate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
        },
        campaigns,
        date_range: {
          start: formatDate(startDate),
          end: formatDate(endDate),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in google-ads-metrics:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
