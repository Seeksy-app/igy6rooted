import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENDJIM_BASE = "https://api.sendjim.com/api";

async function sendjimFetch(path: string, token: string, apiVersion = "4", page = 1) {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${SENDJIM_BASE}${path}${sep}page=${page}`;
  console.log("SendJim fetch:", url, "API_VERSION:", apiVersion);
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      API_VERSION: apiVersion,
    },
  });
  if (!resp.ok) {
    const text = await resp.text();
    console.error("SendJim API error:", resp.status, text);
    throw new Error(`SendJim API ${resp.status}: ${text}`);
  }
  return resp.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    const SENDJIM_API_KEY = Deno.env.get("SENDJIM_API_KEY");

    if (!SENDJIM_API_KEY) {
      return new Response(JSON.stringify({ error: "SENDJIM_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { org_id } = await req.json();
    if (!org_id) {
      return new Response(JSON.stringify({ error: "org_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabase.rpc("is_org_admin", { _org_id: org_id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try multiple SendJim API endpoints to find mailing data
    let allRecipients: any[] = [];
    let source = "";

    // Attempt 1: Try v4 contacts endpoint (most reliable)
    try {
      let page = 1;
      let hasMore = true;
      while (hasMore && page <= 20) {
        const data = await sendjimFetch("/contacts", SENDJIM_API_KEY, "4", page);
        const items = data?.data || (Array.isArray(data) ? data : []);
        if (items.length === 0) break;
        allRecipients.push(...items);
        hasMore = data?.meta?.current_page < data?.meta?.last_page;
        page++;
      }
      if (allRecipients.length > 0) source = "contacts_v4";
      console.log(`v4 /contacts returned ${allRecipients.length} records`);
    } catch (e) {
      console.error("v4 /contacts failed:", e);
    }

    // Attempt 2: If no contacts, try v3 neighbor_mailings
    if (allRecipients.length === 0) {
      try {
        let page = 1;
        let hasMore = true;
        while (hasMore && page <= 10) {
          const data = await sendjimFetch("/neighbor_mailings", SENDJIM_API_KEY, "3", page);
          const items = data?.data || [];
          if (items.length === 0) break;
          allRecipients.push(...items);
          hasMore = data?.meta?.current_page < data?.meta?.last_page;
          page++;
        }
        if (allRecipients.length > 0) source = "neighbor_mailings_v3";
        console.log(`v3 /neighbor_mailings returned ${allRecipients.length} records`);
      } catch (e) {
        console.error("v3 /neighbor_mailings failed:", e);
      }
    }

    // Attempt 3: Try v4 quicksends for mailing metadata
    let quicksends: any[] = [];
    try {
      const qsData = await sendjimFetch("/quicksends", SENDJIM_API_KEY, "4");
      quicksends = qsData?.data || (Array.isArray(qsData) ? qsData : []);
      console.log(`v4 /quicksends returned ${quicksends.length} records`);
    } catch (e) {
      console.error("v4 /quicksends failed:", e);
    }

    console.log(`Total fetched: ${allRecipients.length} from ${source || "none"}, ${quicksends.length} quicksends`);

    if (allRecipients.length === 0 && quicksends.length === 0) {
      return new Response(JSON.stringify({
        imported: 0,
        message: "No contacts or mailings found in SendJim. Ensure your SendJim account has contacts with addresses.",
        source: "none",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get team members for round-robin
    const svc = createClient(supabaseUrl, serviceKey);
    const { data: teamMembers } = await svc
      .from("team_members")
      .select("user_id, role")
      .eq("org_id", org_id);

    let memberNames: Record<string, string> = {};
    if (teamMembers?.length) {
      const { data: profiles } = await svc
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", teamMembers.map((m: any) => m.user_id));
      profiles?.forEach((p: any) => {
        memberNames[p.user_id] = p.display_name || "Team Member";
      });
    }

    const assignableMembers = (teamMembers || []).filter((m: any) => m.role === "sales");
    console.log(`Found ${assignableMembers.length} sales team members for round-robin`);

    // Build canvassing leads from contacts
    const leads: any[] = [];
    let assignIndex = 0;

    for (const contact of allRecipients) {
      // v4 contacts have address fields directly
      const address = contact.address || contact.address_1 || contact.street || "";
      if (!address) continue;

      const mailingDate = contact.created_at || contact.schedule_date || contact.sent_date || null;
      const code = contact.tracking_code || contact.id?.toString() || null;
      const mailingName = contact.name || contact.mailing_name || contact.campaign_name || null;

      let estimatedDelivery = contact.estimated_delivery_date || contact.delivery_date || null;
      if (!estimatedDelivery && mailingDate) {
        const sent = new Date(mailingDate);
        sent.setDate(sent.getDate() + 7);
        estimatedDelivery = sent.toISOString().split("T")[0];
      }

      const assignedMember = assignableMembers.length > 0
        ? assignableMembers[assignIndex % assignableMembers.length]
        : null;

      leads.push({
        org_id,
        address,
        city: contact.city || null,
        state: contact.state || null,
        zip: contact.zip || contact.zip_code || null,
        property_type: contact.property_type || null,
        sendjim_code: code,
        sendjim_mailing_date: mailingDate ? mailingDate.split("T")[0] : null,
        estimated_delivery_date: estimatedDelivery || null,
        mailing_name: mailingName,
        assigned_to: assignedMember?.user_id || null,
        assigned_to_name: assignedMember ? (memberNames[assignedMember.user_id] || "Team Member") : null,
        status: "unvisited",
      });

      if (assignableMembers.length > 0) assignIndex++;
    }

    console.log(`Prepared ${leads.length} canvassing leads for import`);

    // Upsert (skip duplicates based on unique address constraint)
    let imported = 0;

    for (let i = 0; i < leads.length; i += 50) {
      const batch = leads.slice(i, i + 50);
      const { data: inserted, error: insertError } = await svc
        .from("canvassing_leads")
        .upsert(batch, { onConflict: "org_id,address", ignoreDuplicates: true })
        .select("id");

      if (insertError) {
        console.error("Insert error:", insertError);
      }
      imported += inserted?.length || 0;
    }

    const skipped = leads.length - imported;

    return new Response(JSON.stringify({
      imported,
      skipped,
      total_fetched: allRecipients.length,
      quicksends_found: quicksends.length,
      source,
      team_members_assigned: assignableMembers.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("canvassing-import error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
