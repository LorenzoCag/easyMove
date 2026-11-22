export type StateInfo = { abbr: string; name: string; lat: number; lon: number };

// Approximate geographic centers, used when a city lookup is unavailable.
export const US_STATES: StateInfo[] = [
  { abbr: "AL", name: "Alabama", lat: 32.8, lon: -86.8 },
  { abbr: "AK", name: "Alaska", lat: 61.4, lon: -152.3 },
  { abbr: "AZ", name: "Arizona", lat: 34.2, lon: -111.7 },
  { abbr: "AR", name: "Arkansas", lat: 34.9, lon: -92.4 },
  { abbr: "CA", name: "California", lat: 36.8, lon: -119.4 },
  { abbr: "CO", name: "Colorado", lat: 39.0, lon: -105.5 },
  { abbr: "CT", name: "Connecticut", lat: 41.6, lon: -72.7 },
  { abbr: "DE", name: "Delaware", lat: 39.0, lon: -75.5 },
  { abbr: "DC", name: "District of Columbia", lat: 38.9, lon: -77.0 },
  { abbr: "FL", name: "Florida", lat: 28.6, lon: -82.4 },
  { abbr: "GA", name: "Georgia", lat: 32.7, lon: -83.4 },
  { abbr: "HI", name: "Hawaii", lat: 20.8, lon: -156.3 },
  { abbr: "ID", name: "Idaho", lat: 44.4, lon: -114.6 },
  { abbr: "IL", name: "Illinois", lat: 40.0, lon: -89.2 },
  { abbr: "IN", name: "Indiana", lat: 39.9, lon: -86.3 },
  { abbr: "IA", name: "Iowa", lat: 42.1, lon: -93.5 },
  { abbr: "KS", name: "Kansas", lat: 38.5, lon: -98.4 },
  { abbr: "KY", name: "Kentucky", lat: 37.5, lon: -85.3 },
  { abbr: "LA", name: "Louisiana", lat: 31.1, lon: -92.0 },
  { abbr: "ME", name: "Maine", lat: 45.4, lon: -69.2 },
  { abbr: "MD", name: "Maryland", lat: 39.0, lon: -76.8 },
  { abbr: "MA", name: "Massachusetts", lat: 42.3, lon: -71.8 },
  { abbr: "MI", name: "Michigan", lat: 44.3, lon: -85.4 },
  { abbr: "MN", name: "Minnesota", lat: 46.3, lon: -94.3 },
  { abbr: "MS", name: "Mississippi", lat: 32.7, lon: -89.7 },
  { abbr: "MO", name: "Missouri", lat: 38.4, lon: -92.5 },
  { abbr: "MT", name: "Montana", lat: 47.0, lon: -109.6 },
  { abbr: "NE", name: "Nebraska", lat: 41.5, lon: -99.8 },
  { abbr: "NV", name: "Nevada", lat: 39.3, lon: -116.6 },
  { abbr: "NH", name: "New Hampshire", lat: 43.7, lon: -71.6 },
  { abbr: "NJ", name: "New Jersey", lat: 40.2, lon: -74.7 },
  { abbr: "NM", name: "New Mexico", lat: 34.4, lon: -106.1 },
  { abbr: "NY", name: "New York", lat: 42.9, lon: -75.5 },
  { abbr: "NC", name: "North Carolina", lat: 35.6, lon: -79.4 },
  { abbr: "ND", name: "North Dakota", lat: 47.5, lon: -100.5 },
  { abbr: "OH", name: "Ohio", lat: 40.3, lon: -82.8 },
  { abbr: "OK", name: "Oklahoma", lat: 35.6, lon: -97.5 },
  { abbr: "OR", name: "Oregon", lat: 43.9, lon: -120.6 },
  { abbr: "PA", name: "Pennsylvania", lat: 40.9, lon: -77.8 },
  { abbr: "RI", name: "Rhode Island", lat: 41.7, lon: -71.5 },
  { abbr: "SC", name: "South Carolina", lat: 33.9, lon: -80.9 },
  { abbr: "SD", name: "South Dakota", lat: 44.4, lon: -100.2 },
  { abbr: "TN", name: "Tennessee", lat: 35.9, lon: -86.4 },
  { abbr: "TX", name: "Texas", lat: 31.5, lon: -99.3 },
  { abbr: "UT", name: "Utah", lat: 39.3, lon: -111.7 },
  { abbr: "VT", name: "Vermont", lat: 44.1, lon: -72.7 },
  { abbr: "VA", name: "Virginia", lat: 37.5, lon: -78.9 },
  { abbr: "WA", name: "Washington", lat: 47.4, lon: -120.5 },
  { abbr: "WV", name: "West Virginia", lat: 38.6, lon: -80.6 },
  { abbr: "WI", name: "Wisconsin", lat: 44.6, lon: -89.9 },
  { abbr: "WY", name: "Wyoming", lat: 43.0, lon: -107.6 },
];

export type ParsedLocation = { city: string; state: StateInfo };

export function findState(raw: string): StateInfo | undefined {
  const v = raw.trim().replace(/\./g, "").toLowerCase();
  if (!v) return undefined;
  return US_STATES.find((s) => s.abbr.toLowerCase() === v || s.name.toLowerCase() === v);
}

/** Accepts "City, ST" or "City, State Name". */
export function parseLocation(input: string): ParsedLocation | null {
  const parts = input.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const state = findState(parts[parts.length - 1] ?? "");
  const city = parts.slice(0, -1).join(", ");
  if (!state || !city) return null;
  return { city, state };
}

export function haversineMiles(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type GeoResult = {
  name?: string;
  latitude: number;
  longitude: number;
  country_code?: string;
  admin1?: string;
};

export type CitySuggestion = { label: string; city: string; stateAbbr: string };

/**
 * Turns raw geocoding results into unique "City, ST" suggestions. When the user has already
 * typed a state after the comma ("Austin, T"), only matching states are kept.
 */
export function toCitySuggestions(results: GeoResult[], query: string): CitySuggestion[] {
  const stateFilter = query.includes(",")
    ? (query.split(",").slice(1).join(",").trim().replace(/\./g, "").toLowerCase())
    : "";
  const seen = new Set<string>();
  const out: CitySuggestion[] = [];
  for (const r of results) {
    if (r.country_code !== "US" || !r.admin1 || !r.name) continue;
    const state = findState(r.admin1);
    if (!state) continue;
    if (
      stateFilter &&
      !state.abbr.toLowerCase().startsWith(stateFilter) &&
      !state.name.toLowerCase().startsWith(stateFilter)
    )
      continue;
    const label = `${r.name}, ${state.abbr}`;
    if (seen.has(label)) continue;
    seen.add(label);
    out.push({ label, city: r.name, stateAbbr: state.abbr });
  }
  return out.slice(0, 6);
}

/** Looks up US city suggestions for a partially typed "City" or "City, ST" string. */
export async function searchCities(query: string, signal?: AbortSignal): Promise<CitySuggestion[]> {
  const name = query.split(",")[0]?.trim() ?? "";
  if (name.length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      name,
    )}&count=20&language=en&format=json&countryCode=US`;
    const res = await fetch(url, signal ? { signal } : undefined);
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: GeoResult[] };
    return toCitySuggestions(data.results ?? [], query);
  } catch {
    return [];
  }
}

async function geocodeCity(loc: ParsedLocation): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      loc.city,
    )}&count=20&language=en&format=json&countryCode=US`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: GeoResult[] };
    const match = data.results?.find(
      (r) => r.country_code === "US" && r.admin1?.toLowerCase() === loc.state.name.toLowerCase(),
    );
    return match ? { lat: match.latitude, lon: match.longitude } : null;
  } catch {
    return null;
  }
}

/** Road distances run ~20% longer than straight-line distances. */
const ROAD_FACTOR = 1.2;

export async function estimateDrivingMiles(
  from: ParsedLocation,
  to: ParsedLocation,
): Promise<{ miles: number; approximate: boolean }> {
  const [a, b] = await Promise.all([geocodeCity(from), geocodeCity(to)]);
  if (a && b) {
    return { miles: Math.max(5, Math.round(haversineMiles(a, b) * ROAD_FACTOR)), approximate: false };
  }
  // Fallback when the city lookup fails.
  if (from.state.abbr === to.state.abbr) {
    const sameCity = from.city.toLowerCase() === to.city.toLowerCase();
    return { miles: sameCity ? 10 : 40, approximate: true };
  }
  return {
    miles: Math.round(haversineMiles(from.state, to.state) * ROAD_FACTOR),
    approximate: true,
  };
}
