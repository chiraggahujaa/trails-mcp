// Nominatim (OpenStreetMap) geocoding client.
//
// Turns place names into coordinates so route searches can be expressed in
// natural language ("trails near Zermatt"). Respects Nominatim's usage policy:
// a single request at a time, >= 1s apart, with a descriptive User-Agent
// (set centrally in version.ts) and an accept-language header.
import { fetchJson } from "../../core/http.js";
import { HttpError } from "../../core/errors.js";
import { RateLimiter } from "../../core/rateLimiter.js";
import { logger } from "../../core/logger.js";

const NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";

/** Raw Nominatim jsonv2 search result (subset of fields we use). */
interface NominatimRaw {
  place_id: number;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  category: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  boundingbox: [string, string, string, string]; // [minLat, maxLat, minLon, maxLon]
}

/** Shaped, AI-friendly geocoding hit. */
export interface GeocodeHit {
  name: string;
  display_name: string;
  lat: number;
  lon: number;
  category: string;
  type: string;
  importance: number;
  boundingbox: { minLat: number; maxLat: number; minLon: number; maxLon: number };
}

export interface GeocodeOptions {
  limit?: number;
  language?: string;
}

export class NominatimClient {
  // >= 1 request/second per Nominatim policy; 1100ms gives a safety margin.
  private readonly limiter = new RateLimiter(1100);

  async search(query: string, opts: GeocodeOptions = {}): Promise<GeocodeHit[]> {
    const limit = opts.limit ?? 5;
    const language = opts.language ?? "en";
    const url =
      `${NOMINATIM_SEARCH}?q=${encodeURIComponent(query)}` + `&format=jsonv2&limit=${limit}`;

    const raw = await this.limiter.schedule(() =>
      this.fetchWithRetry(url, language),
    );
    return raw.map(shapeHit);
  }

  /** One bounded retry on 429, after a short backoff. */
  private async fetchWithRetry(url: string, language: string): Promise<NominatimRaw[]> {
    try {
      return await fetchJson<NominatimRaw[]>(url, { headers: { "accept-language": language } });
    } catch (err) {
      if (err instanceof HttpError && err.status === 429) {
        logger.warn("nominatim 429, backing off 2s then retrying once");
        await new Promise((r) => setTimeout(r, 2000));
        return fetchJson<NominatimRaw[]>(url, { headers: { "accept-language": language } });
      }
      throw err;
    }
  }
}

function shapeHit(r: NominatimRaw): GeocodeHit {
  const [minLat, maxLat, minLon, maxLon] = r.boundingbox.map(Number) as [
    number,
    number,
    number,
    number,
  ];
  return {
    name: r.name,
    display_name: r.display_name,
    lat: Number(r.lat),
    lon: Number(r.lon),
    category: r.category,
    type: r.type,
    importance: r.importance,
    boundingbox: { minLat, maxLat, minLon, maxLon },
  };
}
