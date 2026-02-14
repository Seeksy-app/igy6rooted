import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Models to query
const MODELS = [
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "openai/gpt-5-mini",
  "openai/gpt-5",
];

// Prompt templates per category
function generatePrompts(brandName: string, domain: string, industry: string): Array<{ text: string; category: string }> {
  const service = industry || "services";
  return [
    { text: `What are the best ${service} companies in the Dallas Fort Worth area?`, category: "recommendation" },
    { text: `Can you recommend a reliable ${service} provider near me?`, category: "recommendation" },
    { text: `Compare the top ${service} companies. Which one is best?`, category: "comparison" },
    { text: `What do people say about ${brandName}? Are they reputable?`, category: "review" },
    { text: `I need ${service} done at my home. Who should I hire?`, category: "recommendation" },
    { text: `Tell me about ${domain} and their services.`, category: "direct" },
  ];
}

function analyzeResponse(response: string, brandName: string, domain: string) {
  const lower = response.toLowerCase();
  const brandLower = brandName.toLowerCase();
  const domainLower = domain.toLowerCase();

  const brand_mentioned = lower.includes(brandLower) || lower.includes(domainLower);

  // Find position in numbered lists
  let brand_position: number | null = null;
  const lines = response.split("\n");
  for (const line of lines) {
    const match = line.match(/^(\d+)[.)]\s/);
    if (match && (line.toLowerCase().includes(brandLower) || line.toLowerCase().includes(domainLower))) {
      brand_position = parseInt(match[1]);
      break;
    }
  }

  // Citation
  const citation_found = lower.includes(domainLower);
  const urlMatch = response.match(new RegExp(`https?://[^\\s]*${domain.replace(/\./g, "\\.")}[^\\s]*`, "i"));
  const citation_url = urlMatch ? urlMatch[0] : null;

  // Simple sentiment
  const positiveWords = ["excellent", "great", "best", "top", "recommended", "reliable", "trusted", "quality", "professional"];
  const negativeWords = ["avoid", "poor", "bad", "complaints", "issues", "unreliable", "scam"];
  let posCount = 0, negCount = 0;
  for (const w of positiveWords) if (lower.includes(w)) posCount++;
  for (const w of negativeWords) if (lower.includes(w)) negCount++;
  
  let sentiment = "neutral";
  let sentiment_score = 0;
  if (brand_mentioned) {
    // Extract context around brand mention
    const idx = lower.indexOf(brandLower);
    const context = lower.substring(Math.max(0, idx - 200), Math.min(lower.length, idx + 200));
    const ctxPos = positiveWords.filter(w => context.includes(w)).length;
    const ctxNeg = negativeWords.filter(w => context.includes(w)).length;
    if (ctxPos > ctxNeg) { sentiment = "positive"; sentiment_score = Math.min(1, ctxPos * 0.3); }
    else if (ctxNeg > ctxPos) { sentiment = "negative"; sentiment_score = -Math.min(1, ctxNeg * 0.3); }
  }

  // Competitor mentions (look for numbered company names)
  const competitors: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\d+[.)]\s+\*?\*?([A-Z][A-Za-z\s&']+)/);
    if (m && !m[1].toLowerCase().includes(brandLower)) {
      competitors.push(m[1].trim());
    }
  }

  // Presence score: 0-100
  let presence_score = 0;
  if (brand_mentioned) presence_score += 40;
  if (brand_position === 1) presence_score += 30;
  else if (brand_position && brand_position <= 3) presence_score += 20;
  else if (brand_position) presence_score += 10;
  if (citation_found) presence_score += 15;
  if (sentiment === "positive") presence_score += 15;
  else if (sentiment === "neutral" && brand_mentioned) presence_score += 5;

  return { brand_mentioned, brand_position, sentiment, sentiment_score, citation_found, citation_url, competitor_mentions: competitors, presence_score };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { client_profile_id, org_id } = await req.json();
    if (!client_profile_id || !org_id) throw new Error("client_profile_id and org_id required");

    // Get client profile
    const { data: profile, error: profileErr } = await supabase
      .from("seo_client_profiles")
      .select("*")
      .eq("id", client_profile_id)
      .single();
    if (profileErr || !profile) throw new Error("Client profile not found");

    const prompts = generatePrompts(profile.brand_name, profile.domain, profile.industry || "");

    // Create scan record
    const { data: scan, error: scanErr } = await supabase
      .from("llm_brand_scans")
      .insert({
        org_id,
        client_profile_id,
        prompts_used: prompts,
        models_queried: MODELS,
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (scanErr) throw new Error(`Failed to create scan: ${scanErr.message}`);

    const allResults: any[] = [];

    // Query each model with each prompt
    for (const model of MODELS) {
      for (const prompt of prompts) {
        try {
          const aiRes = await fetch(AI_GATEWAY_URL, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: "You are a helpful assistant. Answer the user's question with specific company recommendations including names, websites, and brief descriptions. Be factual." },
                { role: "user", content: prompt.text },
              ],
              max_tokens: 1000,
              temperature: 0.3,
            }),
          });

          if (!aiRes.ok) {
            console.error(`Model ${model} failed: ${aiRes.status}`);
            continue;
          }

          const aiData = await aiRes.json();
          const responseText = aiData.choices?.[0]?.message?.content || "";
          const analysis = analyzeResponse(responseText, profile.brand_name, profile.domain);

          allResults.push({
            scan_id: scan.id,
            org_id,
            model_name: model,
            prompt_text: prompt.text,
            prompt_category: prompt.category,
            response_text: responseText,
            ...analysis,
          });
        } catch (e) {
          console.error(`Error querying ${model}: ${e}`);
        }
      }
    }

    // Insert results
    if (allResults.length > 0) {
      await supabase.from("llm_brand_results").insert(allResults);
    }

    // Compute overall score
    const avgScore = allResults.length > 0
      ? allResults.reduce((s, r) => s + (r.presence_score || 0), 0) / allResults.length
      : 0;

    await supabase
      .from("llm_brand_scans")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        overall_brand_score: Math.round(avgScore),
      })
      .eq("id", scan.id);

    return new Response(JSON.stringify({ scan_id: scan.id, score: avgScore, results_count: allResults.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("LLM Brand Scan error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
