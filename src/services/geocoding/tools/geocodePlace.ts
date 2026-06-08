import { z } from "zod";
import { defineTool } from "../../../core/tool.js";
import { jsonResult } from "../../../core/result.js";
import { ToolError } from "../../../core/errors.js";
import type { NominatimClient } from "../client.js";

export function geocodePlaceTool(client: NominatimClient) {
  return defineTool({
    name: "geocode_place",
    title: "Geocode a place name",
    description:
      "Convert a place name (city, region, landmark, mountain pass, etc.) into geographic " +
      "coordinates using OpenStreetMap's Nominatim geocoder. Returns candidate matches with " +
      "lat/lon and a bounding box. Use this when you have a place name and need coordinates — " +
      "for example before calling find_routes_in_bbox. To find trails near a place in one step, " +
      "prefer find_routes_near_place instead.",
    inputSchema: {
      query: z
        .string()
        .min(1)
        .describe("Place name to look up, e.g. 'Zermatt', 'Lake District', 'Stok La'."),
      limit: z
        .number()
        .int()
        .min(1)
        .max(10)
        .default(5)
        .describe("Maximum number of candidate matches to return (1-10)."),
      language: z
        .string()
        .default("en")
        .describe("Preferred language for place names (BCP-47 code, e.g. 'en', 'de')."),
    },
    handler: async ({ query, limit, language }) => {
      const results = await client.search(query, { limit, language });
      if (results.length === 0) {
        throw new ToolError("not_found", `No place found matching "${query}".`);
      }
      return jsonResult({ query, count: results.length, results });
    },
  });
}
