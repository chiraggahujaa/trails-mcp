import { z } from "zod";
import { defineTool } from "../../../core/tool.js";
import { jsonResult } from "../../../core/result.js";
import { bboxToMercatorParam, type LonLatBbox } from "../../../geo/bbox.js";
import { flavourSchema, languageSchema } from "../flavours.js";
import { shapeRouteItem } from "../shape.js";
import type { WaymarkedClient } from "../client.js";

export function findRoutesInBboxTool(client: WaymarkedClient) {
  return defineTool({
    name: "find_routes_in_bbox",
    title: "Find trails in a lon/lat bounding box",
    description:
      "Find recreational routes that pass through an explicit WGS84 lon/lat bounding box. Use " +
      "this when you already have coordinates (e.g. from geocode_place or a map viewport). For " +
      "a place name, use find_routes_near_place instead.",
    inputSchema: {
      min_lon: z.number().min(-180).max(180).describe("Western longitude."),
      min_lat: z.number().min(-85).max(85).describe("Southern latitude."),
      max_lon: z.number().min(-180).max(180).describe("Eastern longitude."),
      max_lat: z.number().min(-85).max(85).describe("Northern latitude."),
      limit: z.number().int().min(1).max(100).default(20).describe("Max routes to return (1-100)."),
      flavour: flavourSchema,
      language: languageSchema,
    },
    handler: async ({ min_lon, min_lat, max_lon, max_lat, limit, flavour, language }) => {
      const bbox: LonLatBbox = { minLon: min_lon, minLat: min_lat, maxLon: max_lon, maxLat: max_lat };
      const res = await client.byArea(flavour, {
        bbox: bboxToMercatorParam(bbox),
        limit,
        language,
      });
      return jsonResult({
        flavour,
        bbox,
        count: res.results.length,
        results: res.results.map(shapeRouteItem),
      });
    },
  });
}
