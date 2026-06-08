import { z } from "zod";
import { defineTool } from "../../../core/tool.js";
import { jsonResult } from "../../../core/result.js";
import { flavourSchema, languageSchema } from "../flavours.js";
import type { WaymarkedClient } from "../client.js";

export function getRouteWikilinkTool(client: WaymarkedClient) {
  return defineTool({
    name: "get_route_wikilink",
    title: "Get a trail's Wikipedia link",
    description:
      "Resolve the Wikipedia article URL for a route by its OSM relation id (if the route is " +
      "tagged with one). Returns the URL; returns a not_found result if the route has no " +
      "Wikipedia link.",
    inputSchema: {
      id: z.number().int().positive().describe("OSM relation id of the route."),
      flavour: flavourSchema,
      language: languageSchema,
    },
    handler: async ({ id, flavour, language }) => {
      const url = await client.wikilink(flavour, { id, language });
      return jsonResult({ flavour, id, wikipedia_url: url });
    },
  });
}
