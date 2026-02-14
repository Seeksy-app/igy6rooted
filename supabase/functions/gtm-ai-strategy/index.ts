import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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

    const { gtm_profile_id, strategy_type, org_id } = await req.json();

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(gtm_profile_id) || !uuidRegex.test(org_id)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify membership
    const { data: membership } = await supabase
      .from("team_members")
      .select("role")
      .eq("org_id", org_id)
      .eq("user_id", claimsData.claims.sub)
      .single();

    if (!membership) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch GTM profile
    const { data: profile, error: profileError } = await supabase
      .from("gtm_profiles")
      .select("*")
      .eq("id", gtm_profile_id)
      .eq("org_id", org_id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "GTM profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch competitor data
    const { data: competitors } = await supabase
      .from("competitor_analyses")
      .select("competitor_name, extracted_services, extracted_pricing, extracted_unique_selling_points")
      .eq("org_id", org_id);

    // Fetch existing metrics
    const { data: metrics } = await supabase
      .from("marketing_metrics")
      .select("channel, spend, leads, conversions, revenue")
      .eq("org_id", org_id);

    // Fetch market zones
    const { data: zones } = await supabase
      .from("gtm_market_zones")
      .select("name, zip_codes, priority, target_monthly_leads")
      .eq("org_id", org_id)
      .eq("is_active", true);

    const channelList = (profile.active_channels as string[]) || [];
    const competitorSummary = (competitors || []).map(c => ({
      name: c.competitor_name,
      services: c.extracted_services,
      pricing: c.extracted_pricing,
      usps: c.extracted_unique_selling_points,
    }));

    const metricsSummary = (metrics || []).reduce((acc: Record<string, any>, m: any) => {
      if (!acc[m.channel]) acc[m.channel] = { spend: 0, leads: 0, conversions: 0, revenue: 0 };
      acc[m.channel].spend += Number(m.spend);
      acc[m.channel].leads += Number(m.leads);
      acc[m.channel].conversions += Number(m.conversions);
      acc[m.channel].revenue += Number(m.revenue);
      return acc;
    }, {});

    // Build the AI prompt based on strategy type
    let systemPrompt = `You are an elite Go-To-Market strategist for local service businesses. You specialize in home services, tree care, landscaping, HVAC, plumbing, etc. You provide data-driven, actionable strategies with specific ROI projections. Always use industry benchmarks.`;

    let userPrompt = "";

    if (strategy_type === "full") {
      userPrompt = `Generate a comprehensive Go-To-Market strategy for this business:

BUSINESS PROFILE:
- Name: ${profile.business_name}
- Type: ${profile.business_type}
- Industry: ${profile.industry || "Home Services"}
- Service ZIP Codes: ${(profile.service_zip_codes || []).join(", ")}
- Service Radius: ${profile.service_radius_miles} miles
- Monthly Marketing Budget: $${profile.monthly_marketing_budget}
- Target Monthly Revenue: $${profile.target_monthly_revenue}
- Average Job Value: $${profile.average_job_value}
- Current Monthly Leads: ${profile.current_monthly_leads}
- Target Monthly Leads: ${profile.target_monthly_leads}
- Active Channels: ${channelList.join(", ")}
- Website: ${profile.website_url || "N/A"}
- Google Business Profile: ${profile.gbp_url || "N/A"}

MARKET ZONES:
${JSON.stringify(zones || [], null, 2)}

COMPETITOR INTELLIGENCE:
${JSON.stringify(competitorSummary, null, 2)}

HISTORICAL PERFORMANCE:
${JSON.stringify(metricsSummary, null, 2)}

Return a JSON response with this structure (use tool calling).`;
    } else if (strategy_type === "roi_forecast") {
      userPrompt = `Generate detailed ROI forecasts for each marketing channel for this business:

BUSINESS: ${profile.business_name} (${profile.business_type})
Budget: $${profile.monthly_marketing_budget}/mo
Avg Job Value: $${profile.average_job_value}
Active Channels: ${channelList.join(", ")}
Current Leads: ${profile.current_monthly_leads}/mo
Historical Performance: ${JSON.stringify(metricsSummary, null, 2)}

Provide ROI projections using industry benchmarks for home services. Return JSON via tool calling.`;
    } else {
      userPrompt = `Generate competitor analysis insights and market positioning recommendations:

BUSINESS: ${profile.business_name} (${profile.business_type})
Service Area: ${(profile.service_zip_codes || []).join(", ")}
COMPETITORS: ${JSON.stringify(competitorSummary, null, 2)}

Provide actionable competitive positioning strategy. Return JSON via tool calling.`;
    }

    // Define the tool for structured output
    const tools = [
      {
        type: "function",
        function: {
          name: "deliver_gtm_strategy",
          description: "Deliver the GTM strategy as structured data",
          parameters: {
            type: "object",
            properties: {
              executive_summary: { type: "string", description: "2-3 sentence overview" },
              channel_recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    channel: { type: "string" },
                    priority: { type: "string", enum: ["high", "medium", "low"] },
                    recommended_monthly_spend: { type: "number" },
                    expected_cpl: { type: "number", description: "Cost per lead" },
                    expected_monthly_leads: { type: "number" },
                    expected_conversion_rate: { type: "number", description: "Percentage" },
                    expected_monthly_revenue: { type: "number" },
                    expected_roi_percentage: { type: "number" },
                    tactics: { type: "array", items: { type: "string" } },
                    timeline: { type: "string", description: "When to expect results" },
                  },
                  required: ["channel", "priority", "recommended_monthly_spend", "expected_cpl", "expected_monthly_leads", "expected_roi_percentage", "tactics"],
                  additionalProperties: false,
                },
              },
              competitive_insights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    insight: { type: "string" },
                    action: { type: "string" },
                    impact: { type: "string", enum: ["high", "medium", "low"] },
                  },
                  required: ["insight", "action", "impact"],
                  additionalProperties: false,
                },
              },
              budget_allocation: {
                type: "object",
                properties: {
                  total_recommended_budget: { type: "number" },
                  allocation: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        channel: { type: "string" },
                        amount: { type: "number" },
                        percentage: { type: "number" },
                      },
                      required: ["channel", "amount", "percentage"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["total_recommended_budget", "allocation"],
                additionalProperties: false,
              },
              quick_wins: {
                type: "array",
                items: { type: "string" },
                description: "Immediate actions for fast results",
              },
              ninety_day_plan: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    phase: { type: "string" },
                    weeks: { type: "string" },
                    actions: { type: "array", items: { type: "string" } },
                    expected_outcome: { type: "string" },
                  },
                  required: ["phase", "weeks", "actions", "expected_outcome"],
                  additionalProperties: false,
                },
              },
              total_projected_monthly_roi: { type: "number", description: "Overall projected ROI %" },
              total_projected_monthly_leads: { type: "number" },
              total_projected_monthly_revenue: { type: "number" },
            },
            required: ["executive_summary", "channel_recommendations", "budget_allocation", "quick_wins", "total_projected_monthly_roi"],
            additionalProperties: false,
          },
        },
      },
    ];

    console.log("Calling AI gateway for GTM strategy...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "deliver_gtm_strategy" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", status, errText);
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let strategyContent = {};
    if (toolCall?.function?.arguments) {
      try {
        strategyContent = JSON.parse(toolCall.function.arguments);
      } catch {
        strategyContent = { executive_summary: "Failed to parse AI response", raw: toolCall.function.arguments };
      }
    }

    // Save strategy to database
    const { data: savedStrategy, error: saveError } = await supabase
      .from("gtm_ai_strategies")
      .insert({
        org_id,
        gtm_profile_id,
        strategy_type: strategy_type || "full",
        strategy_content: strategyContent,
        status: "completed",
        ai_model: "google/gemini-3-flash-preview",
      })
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save strategy:", saveError.message);
    }

    return new Response(JSON.stringify({ success: true, strategy: strategyContent, id: savedStrategy?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("GTM strategy error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
