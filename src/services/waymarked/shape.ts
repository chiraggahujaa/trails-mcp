// Convert raw Waymarked Trails responses into AI-friendly forms:
//   * every coordinate reprojected from EPSG:3857 to lon/lat
//   * heavy geometry trimmed unless full detail is requested
//   * verbose sub/superroute maps collapsed to id+name summaries
import { mercatorToLonLat, round } from "../../geo/mercator.js";
import { mercatorBboxToLonLat } from "../../geo/bbox.js";
import { sample, toLonLat, summarizeLine, type Coord, type GeometryDetail } from "../../geo/geometry.js";
import type {
  DetailedRouteItem,
  ElevationResponse,
  GeoJsonFeatureCollection,
  NodeItemResponse,
  RouteItem,
} from "./types.js";

/** List items carry no geometry, so they pass through unchanged. */
export function shapeRouteItem(item: RouteItem): RouteItem {
  return item;
}

function collapseRouteMap(map?: Record<string, RouteItem>): RouteItem[] | undefined {
  if (!map) return undefined;
  return Object.values(map).map((r) => ({
    type: r.type,
    id: r.id,
    ref: r.ref,
    name: r.name,
    group: r.group,
  }));
}

/** Walk the nested route structure and collect every LineString's coords. */
function collectLines(route: unknown): number[][][] {
  const lines: number[][][] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node && typeof node === "object") {
      const obj = node as Record<string, unknown>;
      const geom = obj.geometry as { coordinates?: number[][] } | undefined;
      if (geom && Array.isArray(geom.coordinates)) lines.push(geom.coordinates);
      for (const [key, value] of Object.entries(obj)) {
        if (key === "geometry") continue; // already handled; don't recurse into coords
        walk(value);
      }
    }
  };
  walk(route);
  return lines;
}

/** Deep-clone the route structure, reprojecting every geometry to lon/lat. */
function reprojectRouteDeep(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(reprojectRouteDeep);
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      const geom = value as { type?: string; coordinates?: number[][] } | undefined;
      if (key === "geometry" && geom && Array.isArray(geom.coordinates)) {
        out[key] = { ...geom, coordinates: toLonLat(geom.coordinates) };
      } else {
        out[key] = reprojectRouteDeep(value);
      }
    }
    return out;
  }
  return node;
}

function shapeRoute(route: unknown, detail: GeometryDetail): unknown {
  if (!route || typeof route !== "object") return undefined;
  const r = route as Record<string, unknown>;
  const lines = collectLines(route);
  const totalPoints = lines.reduce((s, l) => s + l.length, 0);

  if (detail === "none") {
    return {
      length: r.length,
      linear: r.linear,
      segment_count: lines.length,
      total_points: totalPoints,
    };
  }
  if (detail === "full") {
    return reprojectRouteDeep(route);
  }
  // summary: one downsampled track across the whole route
  const allLonLat: Coord[] = lines.flatMap((l) => toLonLat(l));
  return {
    length: r.length,
    linear: r.linear,
    segment_count: lines.length,
    total_points: totalPoints,
    sampled_track: sample(allLonLat, 30),
    note: "Geometry summarised to ~30 lon/lat points across the whole route. Pass geometry_detail='full' for all coordinates.",
  };
}

export function shapeDetails(raw: DetailedRouteItem, detail: GeometryDetail): Record<string, unknown> {
  const { bbox, route, subroutes, superroutes, ...rest } = raw;
  const shaped: Record<string, unknown> = { ...rest };
  if (Array.isArray(bbox) && bbox.length === 4) {
    shaped.bbox = mercatorBboxToLonLat(bbox);
  }
  const sub = collapseRouteMap(subroutes);
  if (sub) shaped.subroutes = sub;
  const sup = collapseRouteMap(superroutes);
  if (sup) shaped.superroutes = sup;
  const routeShaped = shapeRoute(route, detail);
  if (routeShaped !== undefined) shaped.route = routeShaped;
  return shaped;
}

export function shapeElevation(raw: ElevationResponse, maxPointsPerSegment = 250): Record<string, unknown> {
  const segments: Record<string, unknown> = {};
  for (const [id, seg] of Object.entries(raw.segments)) {
    const points = seg.elevation.map((p) => {
      const { lon, lat } = mercatorToLonLat(p.x, p.y);
      return { lon: round(lon), lat: round(lat), ele: p.ele, pos: p.pos };
    });
    segments[id] = { point_count: points.length, points: sample(points, maxPointsPerSegment) };
  }
  return {
    min_elevation: raw.min_elevation,
    max_elevation: raw.max_elevation,
    ascent_range: raw.max_elevation - raw.min_elevation,
    segments,
  };
}

export function shapeNode(raw: NodeItemResponse): Record<string, unknown> {
  const { x, y, ...rest } = raw;
  const { lon, lat } = mercatorToLonLat(x, y);
  return { ...rest, lon: round(lon), lat: round(lat) };
}

export function shapeFeatureCollection(
  raw: GeoJsonFeatureCollection,
  detail: GeometryDetail,
): Record<string, unknown> {
  const features = (raw.features ?? []).map((f) => ({
    type: "Feature" as const,
    id: f.id,
    properties: f.properties ?? {},
    geometry: summarizeLine(f.geometry?.coordinates ?? [], detail),
  }));
  return {
    type: "FeatureCollection",
    crs: "EPSG:4326 (WGS84 lon/lat)",
    feature_count: features.length,
    features,
  };
}
