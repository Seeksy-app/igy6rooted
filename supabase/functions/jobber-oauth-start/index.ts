import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const JOBBER_CLIENT_ID = Deno.env.get('JOBBER_CLIENT_ID');
    
    if (!JOBBER_CLIENT_ID) {
      throw new Error('JOBBER_CLIENT_ID not configured');
    }

    const url = new URL(req.url);
    const orgId = url.searchParams.get('org_id');
    const redirectUri = url.searchParams.get('redirect_uri');

    if (!orgId || !redirectUri) {
      throw new Error('Missing org_id or redirect_uri parameter');
    }

    // Build the Jobber OAuth authorization URL
    const state = btoa(JSON.stringify({ org_id: orgId, redirect_uri: redirectUri }));
    
    const jobberAuthUrl = new URL('https://api.getjobber.com/api/oauth/authorize');
    jobberAuthUrl.searchParams.set('client_id', JOBBER_CLIENT_ID);
    jobberAuthUrl.searchParams.set('redirect_uri', `${Deno.env.get('SUPABASE_URL')}/functions/v1/jobber-oauth-callback`);
    jobberAuthUrl.searchParams.set('response_type', 'code');
    jobberAuthUrl.searchParams.set('state', state);
    // Request necessary scopes for scheduling
    jobberAuthUrl.searchParams.set('scope', 'read_clients write_clients read_jobs write_jobs read_visits write_visits read_schedules');

    console.log('Redirecting to Jobber OAuth:', jobberAuthUrl.toString());

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': jobberAuthUrl.toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('OAuth start error:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
