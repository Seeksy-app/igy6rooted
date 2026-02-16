import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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

    const { messages, org_id } = await req.json();
    if (!org_id || !messages) {
      return new Response(JSON.stringify({ error: "Missing messages or org_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch business context from the database
    const svc = createClient(supabaseUrl, serviceKey);

    const [bookingsRes, leadsRes, campaignsRes, agentRes, profileRes] = await Promise.all([
      svc.from("ai_bookings").select("customer_name, service_type, status, slot_start").eq("org_id", org_id).order("created_at", { ascending: false }).limit(10),
      svc.from("marketing_leads").select("customer_name, channel, status, lead_score, created_at").eq("org_id", org_id).order("created_at", { ascending: false }).limit(10),
      svc.from("marketing_campaigns").select("name, channel, status, budget").eq("org_id", org_id).limit(10),
      svc.from("ai_agent_content").select("business_name, services_summary, service_area, business_hours_text").eq("org_id", org_id).maybeSingle(),
      svc.from("gtm_profiles").select("business_name, business_type, industry, monthly_marketing_budget, current_monthly_leads, target_monthly_leads").eq("org_id", org_id).maybeSingle(),
    ]);

    // Fetch live Jobber data and SendJim data in parallel
    let jobberData: any = null;
    let sendjimData: any = null;
    
    const internalHeaders = {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    };

    const [jobberResult, sendjimResult] = await Promise.allSettled([
      fetch(`${supabaseUrl}/functions/v1/jobber-api/leads?org_id=${org_id}&limit=100`, { headers: internalHeaders }).then(r => r.ok ? r.json() : null),
      fetch(`${supabaseUrl}/functions/v1/sendjim-api/summary?org_id=${org_id}`, { headers: internalHeaders }).then(r => r.ok ? r.json() : null),
    ]);

    if (jobberResult.status === "fulfilled") jobberData = jobberResult.value;
    if (sendjimResult.status === "fulfilled") sendjimData = sendjimResult.value;

    const businessName = agentRes.data?.business_name || profileRes.data?.business_name || "the business";

    const contextParts: string[] = [
      `You are an AI business assistant for ${businessName}. Today's date is ${new Date().toISOString().split("T")[0]}. Answer questions about the business data below. Be concise, helpful, and data-driven. When asked about time periods, filter the data by the relevant dates.`,
    ];

    if (agentRes.data) {
      contextParts.push(`Business Info: Services: ${agentRes.data.services_summary || "N/A"}. Area: ${agentRes.data.service_area || "N/A"}. Hours: ${agentRes.data.business_hours_text || "N/A"}.`);
    }
    if (profileRes.data) {
      contextParts.push(`GTM Profile: Type: ${profileRes.data.business_type}, Industry: ${profileRes.data.industry || "N/A"}, Monthly budget: $${profileRes.data.monthly_marketing_budget || 0}, Current leads/mo: ${profileRes.data.current_monthly_leads || 0}, Target leads/mo: ${profileRes.data.target_monthly_leads || 0}.`);
    }
    if (bookingsRes.data?.length) {
      contextParts.push(`Recent AI Bookings (${bookingsRes.data.length}): ${JSON.stringify(bookingsRes.data)}`);
    }
    if (leadsRes.data?.length) {
      contextParts.push(`Marketing Leads (${leadsRes.data.length}): ${JSON.stringify(leadsRes.data)}`);
    }
    if (campaignsRes.data?.length) {
      contextParts.push(`Campaigns (${campaignsRes.data.length}): ${JSON.stringify(campaignsRes.data)}`);
    }

    // Add Jobber CRM data if available
    if (jobberData) {
      const { clients, requests, jobs, summary } = jobberData;
      if (summary) {
        contextParts.push(`Jobber CRM Summary: ${summary.totalClients} total clients, ${summary.activeLeads} active leads, ${summary.totalRequests} requests, ${summary.totalJobs} jobs, ${summary.activeJobs} active jobs, $${summary.totalRevenue.toLocaleString()} total revenue.`);
      }
      if (clients?.length) {
        const clientSummary = clients.map((c: any) => ({
          name: c.name,
          isLead: c.isLead,
          createdAt: c.createdAt,
          tags: c.tags?.nodes?.map((t: any) => t.label) || [],
          companyName: c.companyName,
          city: c.billingAddress?.city,
        }));
        contextParts.push(`Jobber Clients (${clients.length}): ${JSON.stringify(clientSummary)}`);
      }
      if (requests?.length) {
        const reqSummary = requests.map((r: any) => ({
          title: r.title,
          createdAt: r.createdAt,
          client: r.client?.name,
        }));
        contextParts.push(`Jobber Requests (${requests.length}): ${JSON.stringify(reqSummary)}`);
      }
      if (jobs?.length) {
        const jobSummary = jobs.map((j: any) => ({
          title: j.title,
          jobNumber: j.jobNumber,
          status: j.jobStatus,
          total: j.total,
          createdAt: j.createdAt,
          client: j.client?.name,
        }));
        contextParts.push(`Jobber Jobs (${jobs.length}): ${JSON.stringify(jobSummary)}`);
      }
    }

    // Add SendJim direct mail data if available
    if (sendjimData) {
      if (sendjimData.contacts) {
        contextParts.push(`SendJim Contacts (postcard recipients): ${JSON.stringify(sendjimData.contacts)}`);
      }
      if (sendjimData.mailings) {
        contextParts.push(`SendJim Quick Send Mailings (postcards sent): ${JSON.stringify(sendjimData.mailings)}`);
      }
      if (sendjimData.neighborMailings) {
        contextParts.push(`SendJim Neighbor Mailings: ${JSON.stringify(sendjimData.neighborMailings)}`);
      }
    }

    const systemPrompt = contextParts.join("\n\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("dashboard-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
