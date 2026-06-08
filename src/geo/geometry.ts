// Geometry trimming + reprojection.
//
// Raw API geometry is in Mercator and can be hundreds of coordinate pairs per
// trail — far too verbose for an LLM context. These helpers reproject to
// lon/lat and, at "summary" detail, downsample to a handful of representative
// points. The model can opt into "full" for every coordinate.
import { mercatorToLonLat, round } from "./mercator.js";

export type GeometryDetail = "none" | "summary" | "full";

/** A [lon, lat] pair. */
export type Coord = [number, number];

/** Reproject an array of [x,y] Mercator coords to rounded [lon,lat]. */
export function toLonLat(merCoords: number[][]): Coord[] {
  return merCoords.map(([x, y]) => {
    const { lon, lat } = mercatorToLonLat(x, y);
    return [round(lon), round(lat)];
  });
}

/** Evenly sample at most `maxPoints` items, always keeping first and last. */
export function sample<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints || maxPoints < 2) return arr.slice();
  const step = (arr.length - 1) / (maxPoints - 1);
  const out: T[] = [];
  for (let i = 0; i < maxPoints; i++) out.push(arr[Math.round(i * step)]);
  return out;
}

/**
 * Summarise a single LineString given in Mercator coordinates.
 * - none:    just the point count.
 * - summary: start/end + ~`maxPoints` evenly-spaced lon/lat points.
 * - full:    every point reprojected to lon/lat.
 */
export function summarizeLine(
  merCoords: number[][],
  detail: GeometryDetail,
  maxPoints = 20,
): Record<string, unknown> {
  const count = merCoords.length;
  if (detail === "none" || count === 0) {
    return { type: "LineString", point_count: count };
  }
  const lonlat = toLonLat(merCoords);
  if (detail === "full") {
    return { type: "LineString", point_count: count, coordinates: lonlat };
  }
  return {
    type: "LineString",
    point_count: count,
    start: lonlat[0],
    end: lonlat[count - 1],
    sampled_points: sample(lonlat, maxPoints),
  };
}
