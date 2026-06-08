// Bounding-box helpers in WGS84 lon/lat, plus conversion to the Mercator
// "minx,miny,maxx,maxy" string the API's bbox= query parameter expects.
import { lonLatToMercator, mercatorToLonLat, round } from "./mercator.js";

export interface LonLatBbox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

/** Build a square-ish bbox of roughly `radiusKm` around a lon/lat point. */
export function placeToBbox(lon: number, lat: number, radiusKm: number): LonLatBbox {
  const latPad = radiusKm / 111; // ~111 km per degree of latitude
  const cos = Math.cos(lat * (Math.PI / 180));
  // Guard against the cos->0 singularity near the poles; cap longitude padding.
  const lonPad = Math.min(180, radiusKm / (111 * Math.max(cos, 1e-6)));
  return {
    minLon: lon - lonPad,
    minLat: lat - latPad,
    maxLon: lon + lonPad,
    maxLat: lat + latPad,
  };
}

/** Serialise a lon/lat bbox to the Mercator string the API expects. */
export function bboxToMercatorParam(b: LonLatBbox): string {
  const min = lonLatToMercator(b.minLon, b.minLat);
  const max = lonLatToMercator(b.maxLon, b.maxLat);
  return `${min.x},${min.y},${max.x},${max.y}`;
}

/** Convert a Mercator [minx,miny,maxx,maxy] envelope back to lon/lat. */
export function mercatorBboxToLonLat(bbox: number[]): LonLatBbox {
  const [minx, miny, maxx, maxy] = bbox;
  const min = mercatorToLonLat(minx, miny);
  const max = mercatorToLonLat(maxx, maxy);
  return {
    minLon: round(min.lon),
    minLat: round(min.lat),
    maxLon: round(max.lon),
    maxLat: round(max.lat),
  };
}
