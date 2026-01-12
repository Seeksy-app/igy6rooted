import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to refresh tokens for an org
async function refreshTokensForOrg(orgId: string): Promise<{ success: boolean; error?: string }> {
  const JOBBER_CLIENT_ID = Deno.env.get('JOBBER_CLIENT_ID');
  const JOBBER_CLIENT_SECRET = Deno.env.get('JOBBER_CLIENT_SECRET');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!JOBBER_CLIENT_ID || !JOBBER_CLIENT_SECRET) {
    return { success: false, error: 'Jobber credentials not configured' };
  }

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  // Get current tokens
  const { data: account, error: fetchError } = await supabase
    .from('integration_jobber_accounts')
    .select('*')
    .eq('org_id', orgId)
    .maybeSingle();

  if (fetchError || !account) {
    return { success: false, error: 'No Jobber account found for org' };
  }

  if (!account.refresh_token) {
    return { success: false, error: 'No refresh token available' };
  }

  console.log('Refreshing token for org:', orgId);

  // Refresh the token
  const tokenResponse = await fetch('https://api.getjobber.com/api/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: account.refresh_token,
      client_id: JOBBER_CLIENT_ID,
      client_secret: JOBBER_CLIENT_SECRET,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token refresh failed:', errorText);
    
    // Update status to error
    await supabase
      .from('integration_jobber_accounts')
      .update({
        status: 'error',
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id);

    await supabase
      .from('jobber_connections')
      .update({
        status: 'error',
        last_error: 'Token refresh failed - please reconnect',
        updated_at: new Date().toISOString(),
      })
      .eq('org_id', orgId);

    return { success: false, error: 'Token refresh failed' };
  }

  const tokenData = await tokenResponse.json();
  const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();

  // Update tokens
  const { error: updateError } = await supabase
    .from('integration_jobber_accounts')
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || account.refresh_token,
      token_expires_at: expiresAt,
      status: 'connected',
      updated_at: new Date().toISOString(),
    })
    .eq('id', account.id);

  if (updateError) {
    console.error('Failed to update tokens:', updateError);
    return { success: false, error: 'Failed to store refreshed tokens' };
  }

  console.log('Token refreshed successfully for org:', orgId);
  return { success: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { org_id } = await req.json();

    if (!org_id) {
      throw new Error('Missing org_id');
    }

    const result = await refreshTokensForOrg(org_id);

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Token refresh error:', error);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Export for use by other functions
export { refreshTokensForOrg };
