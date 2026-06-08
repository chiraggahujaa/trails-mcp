import { z } from "zod";
import { defineTool } from "../../../core/tool.js";
import { jsonResult } from "../../../core/result.js";
import { flavourSchema, languageSchema } from "../flavours.js";
import { shapeDetails } from "../shape.js";
import type { WaymarkedClient } from "../client.js";

export function getRouteDetailsTool(client: WaymarkedClient) {
  return defineTool({
    name: "get_route_details",
    title: "Get full trail details",
    description:
      "Get full information about a single route by its OSM relation id: name, reference, " +
      "network, total length, operator, description, website, Wikipedia, bounding box (lon/lat), " +
      "raw OSM tags, and any sub-/super-routes. Geometry is summarised by default to keep the " +
      "response small — set geometry_detail to 'full' for every coordinate or 'none' to omit it.",
    inputSchema: {
      id: z.number().int().positive().describe("OSM relation id of the route."),
      geometry_detail: z
        .enum(["none", "summary", "full"])
        .default("summary")
        .describe(
          "How much path geometry to include: 'none' (counts only), 'summary' (~30 lon/lat " +
            "points, default), or 'full' (every coordinate).",
        ),
      flavour: flavourSchema,
      language: languageSchema,
    },
    handler: async ({ id, geometry_detail, flavour, language }) => {
      const raw = await client.details(flavour, { id, language });
      return jsonResult({ flavour, ...shapeDetails(raw, geometry_detail) });
    },
  });
}
