import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
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
    const userId = claimsData.claims.sub;

    const JOBBER_CLIENT_ID = Deno.env.get('JOBBER_CLIENT_ID');
    if (!JOBBER_CLIENT_ID) {
      throw new Error('JOBBER_CLIENT_ID not configured');
    }

    const url = new URL(req.url);
    const orgId = url.searchParams.get('org_id');
    const redirectUri = url.searchParams.get('redirect_uri');

    if (!orgId || !UUID_REGEX.test(orgId)) {
      throw new Error('Valid org_id is required');
    }
    if (!redirectUri) {
      throw new Error('redirect_uri parameter is required');
    }

    // Validate redirect_uri
    const allowedOrigins = [supabaseUrl.replace(/\/functions\/.*/, ""), "http://localhost:5173", "http://localhost:8080"];
    const redirectOrigin = new URL(redirectUri).origin;
    if (!allowedOrigins.some(o => redirectOrigin.startsWith(o)) && !redirectOrigin.endsWith(".lovable.app")) {
      throw new Error('Invalid redirect_uri');
    }

    // Verify user is org member
    const serviceSupabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
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

    const state = btoa(JSON.stringify({ org_id: orgId, redirect_uri: redirectUri }));
    
    const jobberAuthUrl = new URL('https://api.getjobber.com/api/oauth/authorize');
    jobberAuthUrl.searchParams.set('client_id', JOBBER_CLIENT_ID);
    jobberAuthUrl.searchParams.set('redirect_uri', `${Deno.env.get('SUPABASE_URL')}/functions/v1/jobber-oauth-callback`);
    jobberAuthUrl.searchParams.set('response_type', 'code');
    jobberAuthUrl.searchParams.set('state', state);
    jobberAuthUrl.searchParams.set('scope', 'read_clients write_clients read_jobs write_jobs read_visits write_visits read_schedules');

    console.log('Redirecting to Jobber OAuth for org:', orgId);

    // Return the URL as JSON so the client can redirect (since browser redirects can't send auth headers)
    return new Response(
      JSON.stringify({ url: jobberAuthUrl.toString() }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('OAuth start error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
