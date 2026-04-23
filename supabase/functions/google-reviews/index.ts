// Public edge function: fetches Google Places reviews server-side so the API key never reaches the browser.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLACE_ID = "ChIJNd1voutUQAoRWlc8K8wGYTQ";

// Simple in-memory cache (per edge instance) to avoid hammering the Places API.
let cache: { ts: number; payload: unknown } | null = null;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing GOOGLE_PLACES_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
      return new Response(JSON.stringify(cache.payload), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Places API (New) - GET place details with reviews
    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=en`;
    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,googleMapsUri,reviews",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Places API error", res.status, text);
      return new Response(JSON.stringify({ error: "Places API error", status: res.status, detail: text }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();

    const payload = {
      name: data.displayName?.text ?? "",
      rating: data.rating ?? null,
      totalRatings: data.userRatingCount ?? null,
      mapsUrl: data.googleMapsUri ?? null,
      reviews: (data.reviews ?? []).map((r: any) => ({
        author: r.authorAttribution?.displayName ?? "Anonymous",
        photo: r.authorAttribution?.photoUri ?? null,
        rating: r.rating ?? 5,
        text: r.text?.text ?? r.originalText?.text ?? "",
        relativeTime: r.relativePublishTimeDescription ?? "",
        publishTime: r.publishTime ?? null,
      })),
    };

    cache = { ts: Date.now(), payload };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("google-reviews error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
