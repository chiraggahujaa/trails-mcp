import { describe, expect, it } from "vitest";
import {
  flowDirection,
  meteorologicalWindDirection,
} from "./shape.js";

describe("meteorologicalWindDirection", () => {
  it("returns 270° for pure westerly wind (u>0, v=0)", () => {
    expect(meteorologicalWindDirection(10, 0)).toBe(270);
  });

  it("returns 180° for pure southerly wind (u=0, v>0)", () => {
    expect(meteorologicalWindDirection(0, 10)).toBe(180);
  });

  it("returns null for calm", () => {
    expect(meteorologicalWindDirection(0, 0)).toBeNull();
  });
});

describe("flowDirection", () => {
  it("returns 90° for eastward flow", () => {
    expect(flowDirection(10, 0)).toBe(90);
  });
});
