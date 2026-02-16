import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENDJIM_BASE = "https://api.sendjim.com/api";

async function sendjimFetch(path: string, token: string, page = 1) {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${SENDJIM_BASE}${path}${sep}page=${page}`;
  console.log("SendJim fetch:", url);
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      API_VERSION: "3",
    },
  });
  if (!resp.ok) {
    const text = await resp.text();
    console.error("SendJim API error:", resp.status, text);
    throw new Error(`SendJim API ${resp.status}: ${text}`);
  }
  return resp.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SENDJIM_API_KEY = Deno.env.get("SENDJIM_API_KEY");
    if (!SENDJIM_API_KEY) {
      return new Response(JSON.stringify({ error: "SENDJIM_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // If the token IS the service role key, skip user auth (internal call from dashboard-chat)
    const isServiceCall = token === serviceKey;

    if (!isServiceCall) {
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

      const reqUrl = new URL(req.url);
      const orgId = reqUrl.searchParams.get("org_id");
      if (orgId) {
        const { data: isMember } = await supabase.rpc("is_org_member", { _org_id: orgId });
        if (!isMember) {
          return new Response(JSON.stringify({ error: "Not a member of this org" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    const url = new URL(req.url);
    const path = url.pathname.replace("/sendjim-api", "");
    const page = parseInt(url.searchParams.get("page") || "1");

    console.log("sendjim-api path:", path, "page:", page);

    switch (path) {
      case "/contacts": {
        const data = await sendjimFetch("/contacts", SENDJIM_API_KEY, page);
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "/mailings": {
        const data = await sendjimFetch("/contact_quick_send_mailings", SENDJIM_API_KEY, page);
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "/neighbor-mailings": {
        const data = await sendjimFetch("/neighbor_mailings", SENDJIM_API_KEY, page);
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "/tags": {
        const data = await sendjimFetch("/tags", SENDJIM_API_KEY, page);
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "/summary": {
        const [contactsResult, mailingsResult, neighborResult] = await Promise.allSettled([
          sendjimFetch("/contacts", SENDJIM_API_KEY, 1),
          sendjimFetch("/contact_quick_send_mailings", SENDJIM_API_KEY, 1),
          sendjimFetch("/neighbor_mailings", SENDJIM_API_KEY, 1),
        ]);

        const contacts = contactsResult.status === "fulfilled" ? contactsResult.value : { data: [] };
        const mailings = mailingsResult.status === "fulfilled" ? mailingsResult.value : { data: [] };
        const neighborMailings = neighborResult.status === "fulfilled" ? neighborResult.value : { data: [] };

        if (contactsResult.status === "rejected") console.error("Contacts fetch failed:", contactsResult.reason);
        if (mailingsResult.status === "rejected") console.error("Mailings fetch failed:", mailingsResult.reason);
        if (neighborResult.status === "rejected") console.error("Neighbor mailings fetch failed:", neighborResult.reason);

        console.log("SendJim summary fetched (partial OK)");
        return new Response(JSON.stringify({
          contacts,
          mailings,
          neighborMailings,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown path: ${path}` }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (e) {
    console.error("sendjim-api error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
