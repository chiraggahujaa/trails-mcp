import { z } from "zod";
import { defineTool } from "../../../core/tool.js";
import { jsonResult } from "../../../core/result.js";
import { flavourSchema, languageSchema } from "../flavours.js";
import { shapeElevation } from "../shape.js";
import type { WaymarkedClient } from "../client.js";

export function getRouteElevationTool(client: WaymarkedClient) {
  return defineTool({
    name: "get_route_elevation",
    title: "Get a trail's elevation profile",
    description:
      "Get the elevation profile of a route by its OSM relation id: minimum/maximum elevation " +
      "and elevation points (lon, lat, ele in metres, pos along the way) per segment. Note: " +
      "elevation data is only available on some flavours/servers; if unavailable a not_found " +
      "result is returned.",
    inputSchema: {
      id: z.number().int().positive().describe("OSM relation id of the route."),
      simplify: z
        .number()
        .int()
        .min(0)
        .default(0)
        .describe(
          "Optional simplification: maximum segment length in metres. 0 = no simplification.",
        ),
      flavour: flavourSchema,
      language: languageSchema,
    },
    handler: async ({ id, simplify, flavour, language }) => {
      const raw = await client.elevation(flavour, { id, simplify, language });
      return jsonResult({ flavour, id, ...shapeElevation(raw) });
    },
  });
}
