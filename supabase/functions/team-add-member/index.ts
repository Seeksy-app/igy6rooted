import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Auth as the calling user
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

    const { org_id, email, role } = await req.json();
    if (!org_id || !email || !role) {
      return new Response(JSON.stringify({ error: "org_id, email, and role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is admin
    const { data: isAdmin } = await supabase.rpc("is_org_admin", { _org_id: org_id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to look up user by email
    const svc = createClient(supabaseUrl, serviceKey);
    const { data: { users }, error: listError } = await svc.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      return new Response(JSON.stringify({ error: "Failed to look up user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetUser = users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    if (!targetUser) {
      return new Response(JSON.stringify({ 
        error: "not_found",
        message: `No account found for ${email}. They need to sign up first, then you can add them.`
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already a member
    const { data: existing } = await svc
      .from("team_members")
      .select("id")
      .eq("org_id", org_id)
      .eq("user_id", targetUser.id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ 
        error: "already_member",
        message: `${email} is already a member of this organization.`
      }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Add as team member
    const { error: insertError } = await svc
      .from("team_members")
      .insert({ org_id, user_id: targetUser.id, role });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to add member" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure the user has a profile
    const { data: existingProfile } = await svc
      .from("profiles")
      .select("id")
      .eq("user_id", targetUser.id)
      .maybeSingle();

    if (!existingProfile) {
      await svc.from("profiles").insert({
        user_id: targetUser.id,
        display_name: targetUser.user_metadata?.display_name || email.split("@")[0],
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      user_id: targetUser.id,
      email: targetUser.email,
      role,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("team-add-member error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
