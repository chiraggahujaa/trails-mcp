import { z } from "zod";
import { defineTool } from "../../../core/tool.js";
import { jsonResult } from "../../../core/result.js";
import { ToolError } from "../../../core/errors.js";
import { bboxToMercatorParam, type LonLatBbox } from "../../../geo/bbox.js";
import { flavourSchema } from "../flavours.js";
import { shapeFeatureCollection } from "../shape.js";
import type { WaymarkedClient } from "../client.js";

export function getRouteSegmentsTool(client: WaymarkedClient) {
  return defineTool({
    name: "get_route_segments",
    title: "Get trail geometry clipped to a box",
    description:
      "Get the on-map geometry of one or more routes, clipped to a WGS84 lon/lat bounding box, " +
      "as GeoJSON (reprojected to lon/lat). Useful for drawing the part of a trail inside a map " +
      "viewport. Geometry is summarised by default; set geometry_detail to 'full' for all " +
      "coordinates.",
    inputSchema: {
      ids: z
        .array(z.number().int().positive())
        .min(1)
        .max(50)
        .describe("OSM relation ids whose geometry to return."),
      min_lon: z.number().min(-180).max(180).describe("Western longitude of the clip box."),
      min_lat: z.number().min(-85).max(85).describe("Southern latitude of the clip box."),
      max_lon: z.number().min(-180).max(180).describe("Eastern longitude of the clip box."),
      max_lat: z.number().min(-85).max(85).describe("Northern latitude of the clip box."),
      geometry_detail: z
        .enum(["none", "summary", "full"])
        .default("summary")
        .describe("Geometry verbosity: 'none', 'summary' (default), or 'full'."),
      flavour: flavourSchema,
    },
    handler: async ({ ids, min_lon, min_lat, max_lon, max_lat, geometry_detail, flavour }) => {
      const bbox: LonLatBbox = { minLon: min_lon, minLat: min_lat, maxLon: max_lon, maxLat: max_lat };
      const raw = await client.segments(flavour, {
        bbox: bboxToMercatorParam(bbox),
        relations: ids,
      });
      const shaped = shapeFeatureCollection(raw, geometry_detail);
      if (shaped.feature_count === 0) {
        throw new ToolError(
          "not_found",
          "No geometry found for those route ids inside the given box. Check the ids and that the box overlaps the routes.",
        );
      }
      return jsonResult({ flavour, bbox, ...shaped });
    },
  });
}
