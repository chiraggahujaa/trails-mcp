import { z } from "zod";
import { defineTool } from "../../../core/tool.js";
import { imageResult } from "../../../core/result.js";
import { flavourSchema } from "../flavours.js";
import type { WaymarkedClient } from "../client.js";

export function getRouteSymbolTool(client: WaymarkedClient) {
  return defineTool({
    name: "get_route_symbol",
    title: "Get a route's waymarking symbol",
    description:
      "Fetch the waymarking symbol (route shield) SVG for a given symbol_id. The symbol_id is " +
      "the value returned as 'symbol_id' by the search/detail tools. Returns the symbol as an " +
      "image plus the raw SVG markup.",
    inputSchema: {
      symbol_id: z
        .string()
        .min(1)
        .describe("The symbol identifier from a route's symbol_id field."),
      flavour: flavourSchema,
    },
    handler: async ({ symbol_id, flavour }) => {
      const svg = await client.symbol(flavour, { symbolId: symbol_id });
      const base64 = Buffer.from(svg, "utf8").toString("base64");
      const result = imageResult(base64, "image/svg+xml", `Symbol ${symbol_id} (${flavour})`);
      // Also expose the raw SVG markup as text for clients that prefer it.
      result.content.push({ type: "text", text: svg });
      return result;
    },
  });
}
