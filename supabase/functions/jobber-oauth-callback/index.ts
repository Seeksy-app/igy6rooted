import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const JOBBER_CLIENT_SECRET = Deno.env.get('JOBBER_CLIENT_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!JOBBER_CLIENT_ID || !JOBBER_CLIENT_SECRET) {
      throw new Error('Jobber credentials not configured');
    }

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('OAuth error from Jobber:', error);
      throw new Error(`Jobber OAuth error: ${error}`);
    }

    if (!code || !state) {
      throw new Error('Missing code or state parameter');
    }

    // Decode state to get org_id and redirect_uri
    let stateData: { org_id: string; redirect_uri: string };
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      throw new Error('Invalid state parameter');
    }

    const { org_id, redirect_uri } = stateData;

    console.log('Exchanging code for tokens, org_id:', org_id);

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://api.getjobber.com/api/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: JOBBER_CLIENT_ID,
        client_secret: JOBBER_CLIENT_SECRET,
        redirect_uri: `${SUPABASE_URL}/functions/v1/jobber-oauth-callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');

    // Get Jobber account info using the access token
    const accountResponse = await fetch('https://api.getjobber.com/api/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'X-JOBBER-GRAPHQL-VERSION': '2024-09-16',
      },
      body: JSON.stringify({
        query: `query { account { id name } }`,
      }),
    });

    let jobberAccountId = null;
    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      jobberAccountId = accountData?.data?.account?.id;
      console.log('Jobber account ID:', jobberAccountId);
    }

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();

    // Store tokens in database using service role (bypasses RLS)
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check if connection already exists
    const { data: existing } = await supabase
      .from('integration_jobber_accounts')
      .select('id')
      .eq('org_id', org_id)
      .maybeSingle();

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('integration_jobber_accounts')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: expiresAt,
          jobber_account_id: jobberAccountId,
          status: 'connected',
          scopes: tokenData.scope?.split(' ') || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Failed to update tokens:', updateError);
        throw new Error('Failed to store tokens');
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('integration_jobber_accounts')
        .insert({
          org_id: org_id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: expiresAt,
          jobber_account_id: jobberAccountId,
          status: 'connected',
          scopes: tokenData.scope?.split(' ') || [],
        });

      if (insertError) {
        console.error('Failed to insert tokens:', insertError);
        throw new Error('Failed to store tokens');
      }
    }

    // Also update jobber_connections table for UI status
    const { data: connectionExists } = await supabase
      .from('jobber_connections')
      .select('id')
      .eq('org_id', org_id)
      .maybeSingle();

    if (connectionExists) {
      await supabase
        .from('jobber_connections')
        .update({
          status: 'connected',
          jobber_account_id: jobberAccountId,
          connected_at: new Date().toISOString(),
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', connectionExists.id);
    } else {
      await supabase
        .from('jobber_connections')
        .insert({
          org_id: org_id,
          status: 'connected',
          jobber_account_id: jobberAccountId,
          connected_at: new Date().toISOString(),
        });
    }

    console.log('Tokens stored successfully, redirecting to:', redirect_uri);

    // Redirect back to the app with success
    const successUrl = new URL(redirect_uri);
    successUrl.searchParams.set('jobber_connected', 'true');

    return new Response(null, {
      status: 302,
      headers: {
        'Location': successUrl.toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('OAuth callback error:', error);
    
    // Try to redirect back with error
    const url = new URL(req.url);
    const state = url.searchParams.get('state');
    
    if (state) {
      try {
        const { redirect_uri } = JSON.parse(atob(state));
        const errorUrl = new URL(redirect_uri);
        errorUrl.searchParams.set('jobber_error', message);
        return new Response(null, {
          status: 302,
          headers: { 'Location': errorUrl.toString() },
        });
      } catch {
        // Fall through to error response
      }
    }

    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
