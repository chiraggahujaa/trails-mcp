import { describe, it, expect } from "vitest";
import { lonLatToMercator, mercatorToLonLat } from "./mercator.js";
import { placeToBbox, bboxToMercatorParam, mercatorBboxToLonLat } from "./bbox.js";
import { sample, toLonLat, summarizeLine } from "./geometry.js";

describe("mercator", () => {
  it("round-trips lon/lat through Mercator within 1e-6", () => {
    for (const [lon, lat] of [
      [0, 0],
      [7.7491, 45.9763], // Zermatt
      [-122.4194, 37.7749], // San Francisco
      [77.4743, 34.0348], // Stok La
    ] as const) {
      const m = lonLatToMercator(lon, lat);
      const back = mercatorToLonLat(m.x, m.y);
      expect(back.lon).toBeCloseTo(lon, 6);
      expect(back.lat).toBeCloseTo(lat, 6);
    }
  });

  it("maps the origin to (0,0) Mercator", () => {
    const m = lonLatToMercator(0, 0);
    expect(m.x).toBeCloseTo(0, 6);
    expect(m.y).toBeCloseTo(0, 6);
  });

  it("matches the canonical Web Mercator x for a longitude", () => {
    // Cross-check against the standard constant: half-equator = R*pi = 20037508.34m
    // maps to 180 deg, so x = lon * 20037508.342789244 / 180.
    const HALF_EQUATOR = 20037508.342789244;
    const m = lonLatToMercator(7.7491, 45.9763);
    expect(m.x).toBeCloseTo((7.7491 * HALF_EQUATOR) / 180, 3);
  });
});

describe("bbox", () => {
  it("builds a symmetric box around a point", () => {
    const b = placeToBbox(7.7491, 45.9763, 10);
    expect(b.maxLat - 45.9763).toBeCloseTo(45.9763 - b.minLat, 9);
    expect(b.minLon).toBeLessThan(7.7491);
    expect(b.maxLon).toBeGreaterThan(7.7491);
  });

  it("serialises to a 4-number Mercator string and reprojects back", () => {
    const b = { minLon: -1, minLat: 50, maxLon: 1, maxLat: 51 };
    const param = bboxToMercatorParam(b);
    expect(param.split(",")).toHaveLength(4);
    const back = mercatorBboxToLonLat(param.split(",").map(Number));
    expect(back.minLon).toBeCloseTo(-1, 4);
    expect(back.maxLat).toBeCloseTo(51, 4);
  });
});

describe("geometry", () => {
  it("samples first and last and caps the count", () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    const s = sample(arr, 10);
    expect(s).toHaveLength(10);
    expect(s[0]).toBe(0);
    expect(s[s.length - 1]).toBe(99);
  });

  it("reprojects Mercator coords to rounded lon/lat", () => {
    const m = lonLatToMercator(7.7491, 45.9763);
    const [[lon, lat]] = toLonLat([[m.x, m.y]]);
    expect(lon).toBeCloseTo(7.7491, 4);
    expect(lat).toBeCloseTo(45.9763, 4);
  });

  it("summarizeLine honours detail levels", () => {
    const m = lonLatToMercator(7.7491, 45.9763);
    const coords = Array.from({ length: 50 }, () => [m.x, m.y]);
    expect(summarizeLine(coords, "none")).toEqual({ type: "LineString", point_count: 50 });
    const summary = summarizeLine(coords, "summary") as Record<string, unknown>;
    expect(summary.point_count).toBe(50);
    expect((summary.sampled_points as unknown[]).length).toBeLessThanOrEqual(20);
    const full = summarizeLine(coords, "full") as Record<string, unknown>;
    expect((full.coordinates as unknown[]).length).toBe(50);
  });
});
