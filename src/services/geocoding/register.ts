import type { ToolRegistry } from "../../core/registry.js";
import { NominatimClient } from "./client.js";
import { geocodePlaceTool } from "./tools/geocodePlace.js";

/**
 * Register the geocoding service. The NominatimClient is also returned so other
 * services (e.g. waymarked's find_routes_near_place) can reuse the same
 * rate-limited instance instead of creating their own.
 */
export function registerGeocoding(registry: ToolRegistry): { nominatim: NominatimClient } {
  const nominatim = new NominatimClient();
  registry.add(geocodePlaceTool(nominatim));
  return { nominatim };
}
