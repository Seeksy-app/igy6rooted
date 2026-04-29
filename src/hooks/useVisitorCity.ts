import { useEffect, useState } from "react";

// IGY6 Rooted's actual service area in Northwest Florida.
// We only personalize when the visitor lands inside this list — otherwise
// fall back to a generic "Northwest Florida" mention.
const SERVICE_CITIES = new Set([
  "niceville",
  "destin",
  "fort walton beach",
  "ft walton beach",
  "crestview",
  "valparaiso",
  "shalimar",
  "bluewater bay",
  "freeport",
  "santa rosa beach",
  "miramar beach",
  "mary esther",
  "navarre",
  "gulf breeze",
  "milton",
  "pensacola",
  "defuniak springs",
  "panama city beach",
  "panama city",
  "rosemary beach",
  "seaside",
  "watercolor",
  "inlet beach",
  "south walton",
]);

type Geo = { city: string | null; region: string | null };

const STORAGE_KEY = "igy6_visitor_geo_v1";

/**
 * Lightweight client-side IP geolocation. Uses ipapi.co (free, no key,
 * HTTPS, returns city/region). Caches in sessionStorage so we don't
 * re-hit the API on every navigation.
 *
 * Returns the city only when it's inside our actual service area —
 * otherwise we present "Northwest Florida" so we're not telling someone
 * in Atlanta a stat about Niceville.
 */
export function useVisitorCity(): { city: string | null; region: string } {
  const [geo, setGeo] = useState<Geo>({ city: null, region: "Northwest Florida" });

  useEffect(() => {
    let cancelled = false;

    // Try cache first
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Geo;
        if (parsed && typeof parsed === "object") {
          setGeo({
            city: parsed.city,
            region: parsed.region ?? "Northwest Florida",
          });
          return; // skip network call
        }
      }
    } catch {
      // ignore — we'll fetch fresh
    }

    (async () => {
      try {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 3000);
        const res = await fetch("https://ipapi.co/json/", { signal: ctrl.signal });
        clearTimeout(timeout);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        const rawCity: string = (data?.city || "").toString().trim();
        const rawRegion: string = (data?.region || "").toString().trim();
        const normalized = rawCity.toLowerCase();

        const inService = rawCity && SERVICE_CITIES.has(normalized);
        const next: Geo = {
          city: inService ? rawCity : null,
          region: rawRegion || "Northwest Florida",
        };

        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore storage errors (private mode, etc.)
        }

        setGeo({
          city: next.city,
          region: next.region ?? "Northwest Florida",
        });
      } catch {
        // network/abort — keep default
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return geo;
}
