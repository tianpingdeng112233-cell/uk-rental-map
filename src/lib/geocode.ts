// Mapbox Geocoding API - address to coordinates

interface GeocodeResult {
  lat: number;
  lng: number;
  address: string;
}

/**
 * Convert address string to coordinates using Mapbox Geocoding API
 * Falls back to null if geocoding fails
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    console.warn("[Geocode] Mapbox token not configured");
    return null;
  }

  try {
    const encoded = encodeURIComponent(address);
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&country=gb&limit=1&language=en`
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.features?.length) return null;

    const feature = data.features[0];
    const [lng, lat] = feature.center;

    return {
      lat,
      lng,
      address: feature.place_name || address,
    };
  } catch (error) {
    console.error("[Geocode] Error:", error);
    return null;
  }
}
