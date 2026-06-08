// Raw response shapes from the Waymarked Trails API. These mirror the JSON the
// server emits (coordinates in EPSG:3857). The shape.ts module converts these
// into AI-friendly forms (lon/lat, trimmed geometry).

/** A summary route entry (from list endpoints). No geometry. */
export interface RouteItem {
  type: string;
  id: number;
  ref?: string;
  name?: string;
  local_name?: string;
  group?: string | number;
  linear?: string;
  symbol_description?: string;
  itinerary?: string[];
  symbol_id?: string;
}

/** Full route detail (from /details/relation/{id}). */
export interface DetailedRouteItem extends RouteItem {
  official_length?: number | string;
  operator?: string;
  note?: string;
  description?: string;
  url?: string;
  wikipedia?: string | Record<string, string>;
  bbox?: number[]; // [minx, miny, maxx, maxy] in EPSG:3857
  tags?: Record<string, string>;
  route?: unknown; // nested geometry structure
  subroutes?: Record<string, RouteItem>;
  superroutes?: Record<string, RouteItem>;
}

export interface StatusResponse {
  server_status: string;
  last_update: string;
}

export interface RouteListResponse {
  results: RouteItem[];
  [key: string]: unknown; // by_area adds bbox, search adds query/page, etc.
}

export interface ElevationPoint {
  x: number;
  y: number;
  ele: number;
  pos: number;
}

export interface ElevationResponse {
  min_elevation: number;
  max_elevation: number;
  segments: Record<string, { elevation: ElevationPoint[] }>;
}

export interface NodeItemResponse {
  type: string;
  id: number;
  name?: string;
  local_name?: string;
  ele?: number;
  ref?: string;
  operator?: string;
  description?: string;
  note?: string;
  image?: string;
  tags?: Record<string, string>;
  x: number;
  y: number;
}

export interface GeoJsonFeature {
  type: "Feature";
  id?: number | string;
  properties?: Record<string, unknown>;
  geometry?: { type: string; coordinates: number[][] };
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
  [key: string]: unknown;
}
