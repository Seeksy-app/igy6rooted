import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-empowerify-signature",
};

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return computed === signature.replace(/^sha256=/, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const secret = Deno.env.get("EMPOWERIFY_WEBHOOK_SECRET");
    if (!secret) {
      console.error("EMPOWERIFY_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-empowerify-signature") || "";

    if (!signature || !(await verifySignature(rawBody, signature, secret))) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(rawBody);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const svc = createClient(supabaseUrl, serviceKey);

    const action = payload.action || "publish";

    // --- DELETE: remove the row entirely ---
    if (action === "delete") {
      const { slug } = payload;
      if (!slug) {
        return new Response(JSON.stringify({ error: "slug is required for delete" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await svc.from("blog_posts").delete().eq("slug", slug);
      if (error) {
        console.error("Delete error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`Deleted blog post: ${slug}`);
      return new Response(JSON.stringify({ success: true, action: "deleted", slug }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- PUBLISH or DRAFT: upsert with appropriate status ---
    const {
      title,
      slug,
      body_html,
      excerpt,
      featured_image_url,
      author,
      published_at,
      tags,
      status,
    } = payload;

    if (!title || !slug) {
      return new Response(JSON.stringify({ error: "title and slug are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resolvedStatus = status === "draft" ? "draft" : "published";

    const { error } = await svc.from("blog_posts").upsert(
      {
        title,
        slug,
        content: body_html || "",
        excerpt: excerpt || null,
        featured_image: featured_image_url || null,
        author_display: author || null,
        published_at: published_at || new Date().toISOString(),
        tags: Array.isArray(tags) ? tags : [],
        status: resolvedStatus,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    );

    if (error) {
      console.error("Upsert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Upserted blog post: ${slug} (status: ${resolvedStatus})`);
    return new Response(JSON.stringify({ success: true, action: resolvedStatus, slug }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("empowerify-publish error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
