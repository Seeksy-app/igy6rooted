import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENDJIM_BASE = "https://api.sendjim.com/api";

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

    // Verify admin
    const { data: isAdmin } = await supabase.rpc("is_org_admin", { _org_id: org_id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch neighbor mailings from SendJim (all pages)
    let allRecipients: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 10) {
      const resp = await fetch(
        `${SENDJIM_BASE}/neighbor_mailings?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${SENDJIM_API_KEY}`,
            API_VERSION: "3",
          },
        }
      );
      if (!resp.ok) break;
      const data = await resp.json();
      const items = data?.data || [];
      allRecipients.push(...items);
      hasMore = items.length > 0 && data?.meta?.current_page < data?.meta?.last_page;
      page++;
    }

    console.log(`Fetched ${allRecipients.length} neighbor mailings from SendJim`);

    if (allRecipients.length === 0) {
      return new Response(JSON.stringify({ imported: 0, message: "No neighbor mailings found in SendJim" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get team members for round-robin
    const svc = createClient(supabaseUrl, serviceKey);
    const { data: teamMembers } = await svc
      .from("team_members")
      .select("user_id, role")
      .eq("org_id", org_id);

    // Get display names for team members
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

    // Only assign to sales role members for canvassing
    const assignableMembers = (teamMembers || []).filter((m: any) => m.role === "sales");
    console.log(`Found ${assignableMembers.length} sales team members for round-robin`);

    // Extract addresses from neighbor mailings and build canvassing leads
    // SendJim neighbor mailings contain recipients with address data
    const leads: any[] = [];
    let assignIndex = 0;

    for (const mailing of allRecipients) {
      // Each neighbor mailing may have recipients or be a single address
      const recipients = mailing.recipients || [mailing];
      const mailingDate = mailing.schedule_date || mailing.created_at;
      const code = mailing.tracking_code || mailing.id?.toString();

      for (const r of recipients) {
        const address = r.address || r.address_1 || r.street || "";
        if (!address) continue;

        const assignedMember = assignableMembers.length > 0
          ? assignableMembers[assignIndex % assignableMembers.length]
          : null;

        leads.push({
          org_id,
          address: address,
          city: r.city || mailing.city || null,
          state: r.state || mailing.state || null,
          zip: r.zip || r.zip_code || mailing.zip || null,
          property_type: r.property_type || null,
          sendjim_code: code,
          sendjim_mailing_date: mailingDate ? mailingDate.split("T")[0] : null,
          assigned_to: assignedMember?.user_id || null,
          assigned_to_name: assignedMember ? (memberNames[assignedMember.user_id] || "Team Member") : null,
          status: "unvisited",
        });

        if (assignableMembers.length > 0) assignIndex++;
      }
    }

    console.log(`Prepared ${leads.length} canvassing leads for import`);

    // Upsert (skip duplicates based on unique address constraint)
    let imported = 0;
    let skipped = 0;

    // Batch insert, skip conflicts
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

    skipped = leads.length - imported;

    return new Response(JSON.stringify({
      imported,
      skipped,
      total_fetched: allRecipients.length,
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
