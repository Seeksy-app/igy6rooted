import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SEMRUSH_BASE = "https://api.semrush.com";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- JWT Authentication ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = claimsData.claims.sub;

    const apiKey = Deno.env.get("SEMRUSH_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "SEMRUSH_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, params, org_id } = await req.json();

    if (!action) {
      return new Response(
        JSON.stringify({ success: false, error: "action is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Org membership check ---
    if (!org_id || !UUID_REGEX.test(org_id)) {
      return new Response(
        JSON.stringify({ success: false, error: "Valid org_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceSupabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: membership } = await serviceSupabase
      .from("team_members")
      .select("role")
      .eq("org_id", org_id)
      .eq("user_id", userId)
      .single();

    if (!membership) {
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let url: string;
    let result: unknown;

    switch (action) {
      // ── Domain Overview (organic) ──
      case "domain_overview": {
        const { domain, database = "us" } = params || {};
        if (!domain) {
          return new Response(
            JSON.stringify({ success: false, error: "domain is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        url = `${SEMRUSH_BASE}/?type=domain_ranks&key=${apiKey}&export_columns=Db,Dn,Rk,Or,Ot,Oc,Ad,At,Ac,Sh,Sv&domain=${encodeURIComponent(domain)}&database=${database}`;
        const res = await fetch(url);
        const text = await res.text();
        if (!res.ok || text.startsWith("ERROR")) {
          return new Response(
            JSON.stringify({ success: false, error: text }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = parseSemrushCsv(text);
        break;
      }

      // ── Domain Organic Keywords ──
      case "domain_organic": {
        const { domain, database = "us", limit = 20 } = params || {};
        if (!domain) {
          return new Response(
            JSON.stringify({ success: false, error: "domain is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        url = `${SEMRUSH_BASE}/?type=domain_organic&key=${apiKey}&export_columns=Ph,Po,Pp,Nq,Cp,Ur,Tr,Tc,Co,Nr&domain=${encodeURIComponent(domain)}&database=${database}&display_limit=${limit}`;
        const res = await fetch(url);
        const text = await res.text();
        if (!res.ok || text.startsWith("ERROR")) {
          return new Response(
            JSON.stringify({ success: false, error: text }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = parseSemrushCsv(text);
        break;
      }

      // ── Keyword Overview (all databases) ──
      case "keyword_overview": {
        const { keyword, database = "us" } = params || {};
        if (!keyword) {
          return new Response(
            JSON.stringify({ success: false, error: "keyword is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        url = `${SEMRUSH_BASE}/?type=phrase_this&key=${apiKey}&export_columns=Ph,Nq,Cp,Co,Nr,Td&phrase=${encodeURIComponent(keyword)}&database=${database}`;
        const res = await fetch(url);
        const text = await res.text();
        if (!res.ok || text.startsWith("ERROR")) {
          return new Response(
            JSON.stringify({ success: false, error: text }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = parseSemrushCsv(text);
        break;
      }

      // ── Related Keywords ──
      case "related_keywords": {
        const { keyword, database = "us", limit = 20 } = params || {};
        if (!keyword) {
          return new Response(
            JSON.stringify({ success: false, error: "keyword is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        url = `${SEMRUSH_BASE}/?type=phrase_related&key=${apiKey}&export_columns=Ph,Nq,Cp,Co,Nr,Td&phrase=${encodeURIComponent(keyword)}&database=${database}&display_limit=${limit}`;
        const res = await fetch(url);
        const text = await res.text();
        if (!res.ok || text.startsWith("ERROR")) {
          return new Response(
            JSON.stringify({ success: false, error: text }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = parseSemrushCsv(text);
        break;
      }

      // ── Keyword Difficulty ──
      case "keyword_difficulty": {
        const { keyword, database = "us" } = params || {};
        if (!keyword) {
          return new Response(
            JSON.stringify({ success: false, error: "keyword is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        url = `${SEMRUSH_BASE}/?type=phrase_kdi&key=${apiKey}&export_columns=Ph,Kd&phrase=${encodeURIComponent(keyword)}&database=${database}`;
        const res = await fetch(url);
        const text = await res.text();
        if (!res.ok || text.startsWith("ERROR")) {
          return new Response(
            JSON.stringify({ success: false, error: text }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = parseSemrushCsv(text);
        break;
      }

      // ── Domain vs Domain (competitors) ──
      case "domain_vs_domain": {
        const { domains, database = "us", limit = 20 } = params || {};
        if (!domains || !Array.isArray(domains) || domains.length < 2) {
          return new Response(
            JSON.stringify({ success: false, error: "At least 2 domains are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const domainParams = domains.map((d: string, i: number) => `domains[]=${encodeURIComponent(d)}`).join("&");
        url = `${SEMRUSH_BASE}/?type=domain_domains&key=${apiKey}&export_columns=Ph,P0,P1,Nr,Nq,Co,Cp&${domainParams}&database=${database}&display_limit=${limit}`;
        const res = await fetch(url);
        const text = await res.text();
        if (!res.ok || text.startsWith("ERROR")) {
          return new Response(
            JSON.stringify({ success: false, error: text }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        result = parseSemrushCsv(text);
        break;
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Semrush API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Parse Semrush's semicolon-delimited CSV response into an array of objects.
 */
function parseSemrushCsv(csv: string): Record<string, string>[] {
  const lines = csv.trim().split("\n").filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  const headers = lines[0].split(";");
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(";");
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx]?.trim() ?? "";
    });
    rows.push(row);
  }

  return rows;
}
