/** Raw Windy Point Forecast API response (subset we use). */
export interface WindyRawForecast {
  ts: number[];
  units: Record<string, string | null>;
  [key: string]: number[] | Record<string, string | null> | undefined;
}

export interface WindyPointForecastRequest {
  lat: number;
  lon: number;
  model: string;
  parameters: string[];
  levels: string[];
  key: string;
}

/** One forecast timestep after shaping. */
export interface ShapedTimestep {
  /** ISO 8601 timestamp in UTC. */
  time: string;
  /** Unix epoch ms (same index as raw ts). */
  ts: number;
  /** Decoded parameter values for this timestep. */
  values: Record<string, ShapedValue>;
}

export type ShapedValue =
  | { kind: "scalar"; value: number | null; unit: string | null; label: string }
  | {
      kind: "wind";
      u: number | null;
      v: number | null;
      speed: number | null;
      /** Meteorological direction (degrees, direction wind comes FROM). */
      direction: number | null;
      unit: string | null;
      label: string;
    }
  | {
      kind: "vector";
      u: number | null;
      v: number | null;
      speed: number | null;
      /** Direction the vector points toward (degrees, 0=N). */
      direction: number | null;
      unit: string | null;
      label: string;
    }
  | {
      kind: "wave";
      height: number | null;
      period: number | null;
      direction: number | null;
      heightUnit: string | null;
      periodUnit: string | null;
      directionUnit: string | null;
      label: string;
    }
  | {
      kind: "coded";
      code: number | null;
      label: string;
      text: string | null;
      unit: string | null;
    };

export interface ShapedForecast {
  location: { lat: number; lon: number };
  model: string;
  modelCategory: string;
  levels: string[];
  parameters: string[];
  units: Record<string, string | null>;
  /** Parameter reference keyed by request parameter id. */
  parameterGuide: Record<
    string,
    { label: string; description: string; typicalUnits?: string; valueGuide?: string }
  >;
  timestepCount: number;
  timesteps: ShapedTimestep[];
}
