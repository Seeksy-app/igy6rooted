import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { page_name, route_path, business_name } = await req.json();
    if (!page_name || !route_path) {
      return new Response(JSON.stringify({ error: "page_name and route_path are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `You are an SEO expert for a home services / tree service company called "${business_name || "IGY6 Rooted"}".

Generate optimized SEO metadata for the page "${page_name}" at route "${route_path}".

Return ONLY valid JSON with these exact keys:
{
  "meta_title": "under 60 chars, include main keyword and brand",
  "meta_description": "120-155 chars, compelling, include call-to-action",
  "h1_override": "clear H1 heading for the page",
  "og_title": "social-friendly title, can be slightly different from meta_title",
  "og_description": "social-friendly description, engaging tone, 100-150 chars",
  "twitter_title": "same or similar to og_title",
  "twitter_description": "same or similar to og_description"
}

Rules:
- meta_title MUST be under 60 characters
- meta_description MUST be 120-155 characters
- Include location-relevant keywords where appropriate
- Make descriptions compelling with clear value propositions
- Do NOT include quotes around the JSON output`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");

    const seoData = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(seoData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seo-ai-generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
