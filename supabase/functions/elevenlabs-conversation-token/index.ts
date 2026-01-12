import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    console.log("Requesting conversation token for agent:", ELEVENLABS_AGENT_ID, "org:", orgId);

    // Build the conversation token request
    const tokenUrl = new URL(`https://api.elevenlabs.io/v1/convai/conversation/token`);
    tokenUrl.searchParams.set("agent_id", ELEVENLABS_AGENT_ID);

    const response = await fetch(tokenUrl.toString(), {
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Token received successfully");

    // Return token along with configuration for tools
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
