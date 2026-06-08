import { z } from "zod";
import { defineTool } from "../../../core/tool.js";
import { jsonResult } from "../../../core/result.js";
import { flavourSchema, languageSchema } from "../flavours.js";
import { shapeNode } from "../shape.js";
import type { WaymarkedClient } from "../client.js";

export function getGuidepostTool(client: WaymarkedClient) {
  return defineTool({
    name: "get_guidepost",
    title: "Get guidepost details",
    description:
      "Get details of a guidepost (waymarking signpost node) by its OSM node id: name, " +
      "elevation, lon/lat position, and OSM tags. Guidepost ids come from map tiles or other " +
      "tools, not from route searches.",
    inputSchema: {
      id: z.number().int().positive().describe("OSM node id of the guidepost."),
      flavour: flavourSchema,
      language: languageSchema,
    },
    handler: async ({ id, flavour, language }) => {
      const raw = await client.guidepost(flavour, { id, language });
      return jsonResult({ flavour, ...shapeNode(raw) });
    },
  });
}
