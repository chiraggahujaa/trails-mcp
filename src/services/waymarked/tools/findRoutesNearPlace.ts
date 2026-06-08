import { z } from "zod";
import { defineTool } from "../../../core/tool.js";
import { jsonResult } from "../../../core/result.js";
import { ToolError } from "../../../core/errors.js";
import { placeToBbox, bboxToMercatorParam } from "../../../geo/bbox.js";
import { flavourSchema, languageSchema } from "../flavours.js";
import { shapeRouteItem } from "../shape.js";
import type { WaymarkedClient } from "../client.js";
import type { NominatimClient } from "../../geocoding/client.js";

export function findRoutesNearPlaceTool(client: WaymarkedClient, nominatim: NominatimClient) {
  return defineTool({
    name: "find_routes_near_place",
    title: "Find trails near a place",
    description:
      "Find recreational routes near a named place in one step: geocodes the place with " +
      "OpenStreetMap, then returns routes whose path passes through a bounding box around it. " +
      "This is the primary way to answer 'what trails are near <place>'. Returns summary route " +
      "entries; follow up with get_route_details for any id.",
    inputSchema: {
      place: z.string().min(1).describe("Place name to search around, e.g. 'Zermatt', 'Snowdonia'."),
      radius_km: z
        .number()
        .min(0.5)
        .max(100)
        .default(10)
        .describe("Half-size of the search box around the place, in km (0.5-100)."),
      limit: z.number().int().min(1).max(100).default(20).describe("Max routes to return (1-100)."),
      flavour: flavourSchema,
      language: languageSchema,
    },
    handler: async ({ place, radius_km, limit, flavour, language }) => {
      const hits = await nominatim.search(place, { limit: 1, language });
      if (hits.length === 0) {
        throw new ToolError("not_found", `Could not geocode the place "${place}".`);
      }
      const hit = hits[0];
      const bbox = placeToBbox(hit.lon, hit.lat, radius_km);
      const res = await client.byArea(flavour, {
        bbox: bboxToMercatorParam(bbox),
        limit,
        language,
      });
      return jsonResult({
        flavour,
        place: { name: hit.display_name, lat: hit.lat, lon: hit.lon },
        search_bbox: bbox,
        radius_km,
        count: res.results.length,
        results: res.results.map(shapeRouteItem),
      });
    },
  });
}
