import { defineTool } from "../../../core/tool.js";
import { jsonResult } from "../../../core/result.js";
import { flavourSchema } from "../flavours.js";
import type { WaymarkedClient } from "../client.js";

export function statusTool(client: WaymarkedClient) {
  return defineTool({
    name: "trails_status",
    title: "Waymarked Trails server status",
    description:
      "Check whether a Waymarked Trails map flavour is online and when its OpenStreetMap data " +
      "was last refreshed. Useful as a health check.",
    inputSchema: { flavour: flavourSchema },
    handler: async ({ flavour }) => {
      const status = await client.status(flavour);
      return jsonResult({ flavour, ...status });
    },
  });
}
