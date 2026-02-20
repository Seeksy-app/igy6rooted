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

    const body = await req.json();
    const { action, org_id, email, role, user_id } = body;

    if (!org_id) {
      return new Response(JSON.stringify({ error: "org_id is required" }), {
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

    const svc = createClient(supabaseUrl, serviceKey);

    // ── ACTION: resend-invite ──
    if (action === "resend-invite") {
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id is required for resend" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get the user's email from auth
      const { data: { user: targetUser }, error: getUserErr } = await svc.auth.admin.getUserById(user_id);
      if (getUserErr || !targetUser) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (targetUser.email_confirmed_at) {
        return new Response(JSON.stringify({ error: "User has already accepted the invite" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get org name
      const { data: orgData } = await svc.from("orgs").select("name").eq("id", org_id).single();

      // Re-invite
      const { error: inviteErr } = await svc.auth.admin.inviteUserByEmail(targetUser.email!, {
        data: {
          invited_to_org: org_id,
          invited_role: role || "staff",
          org_name: orgData?.name || "the team",
        },
      });

      if (inviteErr) {
        return new Response(JSON.stringify({ error: `Failed to resend: ${inviteErr.message}` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, message: `Invite resent to ${targetUser.email}` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: get-statuses ──
    if (action === "get-statuses") {
      // Get all team members for this org
      const { data: members } = await svc
        .from("team_members")
        .select("user_id")
        .eq("org_id", org_id);

      if (!members?.length) {
        return new Response(JSON.stringify({ statuses: {} }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const statuses: Record<string, { confirmed: boolean; email: string }> = {};

      for (const m of members) {
        const { data: { user: authUser } } = await svc.auth.admin.getUserById(m.user_id);
        if (authUser) {
          statuses[m.user_id] = {
            confirmed: !!authUser.email_confirmed_at,
            email: authUser.email || "",
          };
        }
      }

      return new Response(JSON.stringify({ statuses }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DEFAULT ACTION: invite / add member ──
    if (!email || !role) {
      return new Response(JSON.stringify({ error: "email and role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: orgData } = await svc.from("orgs").select("name").eq("id", org_id).single();
    const orgName = orgData?.name || "the team";

    // Look up user by email
    const { data: { users }, error: listError } = await svc.auth.admin.listUsers();
    if (listError) {
      return new Response(JSON.stringify({ error: "Failed to look up user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetUser = users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    let userId: string;
    let invited = false;

    if (targetUser) {
      const { data: existing } = await svc
        .from("team_members")
        .select("id")
        .eq("org_id", org_id)
        .eq("user_id", targetUser.id)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({
          error: "already_member",
          message: `${email} is already a member of this organization.`,
        }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = targetUser.id;
    } else {
      const { data: inviteData, error: inviteError } = await svc.auth.admin.inviteUserByEmail(email, {
        data: {
          invited_to_org: org_id,
          invited_role: role,
          org_name: orgName,
        },
      });

      if (inviteError) {
        return new Response(JSON.stringify({
          error: "invite_failed",
          message: `Failed to send invite to ${email}: ${inviteError.message}`,
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      userId = inviteData.user.id;
      invited = true;
    }

    const { error: insertError } = await svc
      .from("team_members")
      .insert({ org_id, user_id: userId, role });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to add member" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingProfile } = await svc
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingProfile) {
      await svc.from("profiles").insert({
        user_id: userId,
        display_name: email.split("@")[0],
      });
    }

    return new Response(JSON.stringify({
      success: true,
      user_id: userId,
      email,
      role,
      invited,
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
