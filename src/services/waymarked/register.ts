import type { ToolRegistry } from "../../core/registry.js";
import type { NominatimClient } from "../geocoding/client.js";
import { WaymarkedClient } from "./client.js";

import { statusTool } from "./tools/status.js";
import { searchRoutesTool } from "./tools/searchRoutes.js";
import { findRoutesNearPlaceTool } from "./tools/findRoutesNearPlace.js";
import { findRoutesInBboxTool } from "./tools/findRoutesInBbox.js";
import { getRoutesByIdsTool } from "./tools/getRoutesByIds.js";
import { getRouteDetailsTool } from "./tools/getRouteDetails.js";
import { getRouteElevationTool } from "./tools/getRouteElevation.js";
import { getRouteSegmentsTool } from "./tools/getRouteSegments.js";
import { getRouteWikilinkTool } from "./tools/getRouteWikilink.js";
import { getGuidepostTool } from "./tools/getGuidepost.js";
import { getRouteSymbolTool } from "./tools/getRouteSymbol.js";

export interface WaymarkedDeps {
  /** Shared, rate-limited Nominatim client for place-name searches. */
  nominatim: NominatimClient;
}

/** Register all Waymarked Trails tools. */
export function registerWaymarked(registry: ToolRegistry, deps: WaymarkedDeps): void {
  const client = new WaymarkedClient();
  registry.addAll([
    statusTool(client),
    searchRoutesTool(client),
    findRoutesNearPlaceTool(client, deps.nominatim),
    findRoutesInBboxTool(client),
    getRoutesByIdsTool(client),
    getRouteDetailsTool(client),
    getRouteElevationTool(client),
    getRouteSegmentsTool(client),
    getRouteWikilinkTool(client),
    getGuidepostTool(client),
    getRouteSymbolTool(client),
  ]);
}
