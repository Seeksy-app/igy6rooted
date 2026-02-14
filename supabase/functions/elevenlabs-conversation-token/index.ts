import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const ELEVENLABS_AGENT_ID = Deno.env.get("ELEVENLABS_AGENT_ID") || "agent_4501kesdr7x3ff1rkg0cqnmvpsed";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    // Validate JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(SUPABASE_URL, supabaseAnonKey, {
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
    const userId = claimsData.claims.sub;

    // Get org_id from request body or query params
    let orgId: string | null = null;
    
    if (req.method === "POST") {
      try {
        const body = await req.json();
        orgId = body.org_id;
      } catch {
        // No body or invalid JSON
      }
    } else {
      const url = new URL(req.url);
      orgId = url.searchParams.get("org_id");
    }

    // Validate org_id format
    if (orgId && !UUID_REGEX.test(orgId)) {
      return new Response(JSON.stringify({ error: "Invalid org_id format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user is org member if org_id provided
    if (orgId) {
      const serviceSupabase = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: membership } = await serviceSupabase
        .from("team_members")
        .select("role")
        .eq("org_id", orgId)
        .eq("user_id", userId)
        .single();

      if (!membership) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    console.log("Requesting conversation token for agent:", ELEVENLABS_AGENT_ID);

    const tokenUrl = new URL(`https://api.elevenlabs.io/v1/convai/conversation/token`);
    tokenUrl.searchParams.set("agent_id", ELEVENLABS_AGENT_ID);

    const response = await fetch(tokenUrl.toString(), {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();

    const toolsBaseUrl = `${SUPABASE_URL}/functions/v1/jobber-api`;

    return new Response(JSON.stringify({ 
      token: data.token,
      agent_id: ELEVENLABS_AGENT_ID,
      org_id: orgId,
      tools_config: {
        base_url: toolsBaseUrl,
        endpoints: {
          availability: `${toolsBaseUrl}/availability`,
          book: `${toolsBaseUrl}/book`,
          health: `${toolsBaseUrl}/health`,
        },
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
