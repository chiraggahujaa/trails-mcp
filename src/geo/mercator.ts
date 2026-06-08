// Web Mercator (EPSG:3857) <-> WGS84 lon/lat conversion.
//
// The Waymarked Trails API speaks EPSG:3857 for every coordinate it accepts and
// returns. Humans and the model think in lon/lat. These pure functions bridge
// the two — no GIS dependency required (it's a closed-form formula).
const R = 6_378_137; // Earth radius used by the spherical Mercator projection
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const MAX_LAT = 85.06; // Mercator is undefined at the poles; clamp here.

export interface LonLat {
  lon: number;
  lat: number;
}

export interface Mercator {
  x: number;
  y: number;
}

export function lonLatToMercator(lon: number, lat: number): Mercator {
  const clampedLat = Math.max(-MAX_LAT, Math.min(MAX_LAT, lat));
  return {
    x: R * lon * D2R,
    y: R * Math.log(Math.tan(Math.PI / 4 + (clampedLat * D2R) / 2)),
  };
}

export function mercatorToLonLat(x: number, y: number): LonLat {
  return {
    lon: (x / R) * R2D,
    lat: (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) * R2D,
  };
}

/** Round a number to `dp` decimal places (default 5 ≈ ~1m precision). */
export function round(n: number, dp = 5): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}
