import { z } from "zod";
import { defineTool } from "../../../core/tool.js";
import { jsonResult } from "../../../core/result.js";
import { flavourSchema, languageSchema } from "../flavours.js";
import { shapeRouteItem } from "../shape.js";
import type { WaymarkedClient } from "../client.js";

export function getRoutesByIdsTool(client: WaymarkedClient) {
  return defineTool({
    name: "get_routes_by_ids",
    title: "Get trail summaries by ids",
    description:
      "Fetch summary entries for multiple routes at once by their OSM relation ids. Returns the " +
      "same compact shape as the search tools. For full detail on a single route use " +
      "get_route_details.",
    inputSchema: {
      ids: z
        .array(z.number().int().positive())
        .min(1)
        .max(50)
        .describe("OSM relation ids to look up (1-50)."),
      flavour: flavourSchema,
      language: languageSchema,
    },
    handler: async ({ ids, flavour, language }) => {
      const res = await client.byIds(flavour, { relations: ids, language });
      return jsonResult({
        flavour,
        requested: ids.length,
        count: res.results.length,
        results: res.results.map(shapeRouteItem),
      });
    },
  });
}
