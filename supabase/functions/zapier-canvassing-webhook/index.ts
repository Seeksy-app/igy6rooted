import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Accept org_id from query param or body
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    const orgId = url.searchParams.get("org_id") || body.org_id;
    if (!orgId) {
      return new Response(JSON.stringify({ error: "org_id is required (query param or body field)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Accept single object or array of objects
    const records = Array.isArray(body.leads) ? body.leads : (body.address ? [body] : []);

    if (records.length === 0) {
      return new Response(JSON.stringify({ error: "No lead data found. Send { address, city?, state?, zip?, ... } or { leads: [...] }" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const svc = createClient(supabaseUrl, serviceKey);

    // Verify org exists
    const { data: org } = await svc.from("orgs").select("id").eq("id", orgId).single();
    if (!org) {
      return new Response(JSON.stringify({ error: "Invalid org_id" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get team members for round-robin
    const { data: teamMembers } = await svc
      .from("team_members")
      .select("user_id, role")
      .eq("org_id", orgId);

    const salesMembers = (teamMembers || []).filter((m: any) => m.role === "sales");
    let memberNames: Record<string, string> = {};
    if (salesMembers.length) {
      const { data: profiles } = await svc
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", salesMembers.map((m: any) => m.user_id));
      profiles?.forEach((p: any) => {
        memberNames[p.user_id] = p.display_name || "Team Member";
      });
    }

    let assignIndex = 0;
    const leads = records.map((r: any) => {
      const address = r.address || r.street || r.address_1 || "";
      if (!address) return null;

      const assignedMember = salesMembers.length > 0
        ? salesMembers[assignIndex++ % salesMembers.length]
        : null;

      // Parse estimated delivery: if sent_date provided, add 7 days
      let estimatedDelivery = r.estimated_delivery_date || r.delivery_date || null;
      if (!estimatedDelivery && (r.sent_date || r.mailing_date || r.sent_to_production)) {
        const sent = new Date(r.sent_date || r.mailing_date || r.sent_to_production);
        if (!isNaN(sent.getTime())) {
          sent.setDate(sent.getDate() + 7);
          estimatedDelivery = sent.toISOString().split("T")[0];
        }
      }

      return {
        org_id: orgId,
        address,
        city: r.city || null,
        state: r.state || null,
        zip: r.zip || r.zip_code || r.postal_code || null,
        property_type: r.property_type || null,
        sendjim_code: r.order_id || r.tracking_code || r.sendjim_code || null,
        sendjim_mailing_date: r.sent_date || r.mailing_date || r.sent_to_production || null,
        estimated_delivery_date: estimatedDelivery,
        mailing_name: r.mailing_name || r.order_type || r.campaign_name || null,
        assigned_to: assignedMember?.user_id || null,
        assigned_to_name: assignedMember ? (memberNames[assignedMember.user_id] || "Team Member") : null,
        status: "unvisited",
      };
    }).filter(Boolean);

    if (leads.length === 0) {
      return new Response(JSON.stringify({ error: "No valid addresses found in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert in batches
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

    console.log(`Zapier webhook: imported ${imported}/${leads.length} leads for org ${orgId}`);

    return new Response(JSON.stringify({
      success: true,
      imported,
      skipped: leads.length - imported,
      total_received: records.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("zapier-canvassing-webhook error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
