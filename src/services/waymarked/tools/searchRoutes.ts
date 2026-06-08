import { z } from "zod";
import { defineTool } from "../../../core/tool.js";
import { jsonResult } from "../../../core/result.js";
import { flavourSchema, languageSchema } from "../flavours.js";
import { shapeRouteItem } from "../shape.js";
import type { WaymarkedClient } from "../client.js";

export function searchRoutesTool(client: WaymarkedClient) {
  return defineTool({
    name: "search_routes_by_name",
    title: "Search trails by name",
    description:
      "Fuzzy-search recreational routes by name or reference code (e.g. 'GR20', 'E5', " +
      "'Pennine Way'). Returns summary route entries (id, name, ref, network group, symbol). " +
      "Use get_route_details with a returned id for full information. To search by location " +
      "instead of name, use find_routes_near_place.",
    inputSchema: {
      query: z.string().min(1).describe("Route name or reference code to search for."),
      limit: z.number().int().min(1).max(100).default(20).describe("Max results per page (1-100)."),
      page: z.number().int().min(1).max(10).default(1).describe("Result page (1-10)."),
      flavour: flavourSchema,
      language: languageSchema,
    },
    handler: async ({ query, limit, page, flavour, language }) => {
      const res = await client.search(flavour, { query, limit, page, language });
      return jsonResult({
        flavour,
        query,
        page,
        count: res.results.length,
        results: res.results.map(shapeRouteItem),
      });
    },
  });
}
