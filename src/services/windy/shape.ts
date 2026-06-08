import type { WindyLevel } from "./levels.js";
import type { WindyModel } from "./models.js";
import { MODEL_INFO } from "./models.js";
import {
  PARAMETER_INFO,
  PTYPE_LABELS,
  WEATHER_WARNING_LABELS,
  type WindyParameter,
} from "./parameters.js";
import type {
  ShapedForecast,
  ShapedTimestep,
  ShapedValue,
  WindyRawForecast,
} from "./types.js";

export interface ShapeOptions {
  lat: number;
  lon: number;
  model: WindyModel;
  parameters: WindyParameter[];
  levels: WindyLevel[];
  /** Keep at most this many forecast steps (from the start). */
  maxSteps?: number;
}

/** Transform raw Windy arrays into labelled, AI-friendly timesteps. */
export function shapeForecast(raw: WindyRawForecast, opts: ShapeOptions): ShapedForecast {
  const ts = raw.ts ?? [];
  const stepCount = opts.maxSteps ? Math.min(opts.maxSteps, ts.length) : ts.length;

  const parameterGuide = Object.fromEntries(
    opts.parameters.map((p) => {
      const info = PARAMETER_INFO[p];
      return [
        p,
        {
          label: info.label,
          description: info.description,
          typicalUnits: info.typicalUnits,
          valueGuide: info.valueGuide,
        },
      ];
    }),
  );

  const timesteps: ShapedTimestep[] = [];
  for (let i = 0; i < stepCount; i++) {
    const values: Record<string, ShapedValue> = {};
    for (const param of opts.parameters) {
      const shaped = shapeParameter(raw, param, opts.levels, i);
      Object.assign(values, shaped);
    }
    timesteps.push({
      time: new Date(ts[i]!).toISOString(),
      ts: ts[i]!,
      values,
    });
  }

  return {
    location: { lat: opts.lat, lon: opts.lon },
    model: opts.model,
    modelCategory: MODEL_INFO[opts.model].category,
    levels: opts.levels,
    parameters: opts.parameters,
    units: raw.units ?? {},
    parameterGuide,
    timestepCount: stepCount,
    timesteps,
  };
}

function shapeParameter(
  raw: WindyRawForecast,
  param: WindyParameter,
  levels: WindyLevel[],
  index: number,
): Record<string, ShapedValue> {
  const info = PARAMETER_INFO[param];
  const out: Record<string, ShapedValue> = {};

  switch (param) {
    case "wind": {
      for (const level of levels) {
        const uKey = `wind_u-${level}`;
        const vKey = `wind_v-${level}`;
        const u = numAt(raw, uKey, index);
        const v = numAt(raw, vKey, index);
        out[`wind@${level}`] = {
          kind: "wind",
          u,
          v,
          speed: uvSpeed(u, v),
          direction: meteorologicalWindDirection(u, v),
          unit: raw.units?.[uKey] ?? raw.units?.[vKey] ?? null,
          label: `${info.label} (${level})`,
        };
      }
      break;
    }
    case "currents":
    case "currentsTide": {
      const prefix = param === "currents" ? "seacurrents" : "seacurrents_tide";
      const uKey = `${prefix}_u-surface`;
      const vKey = `${prefix}_v-surface`;
      const u = numAt(raw, uKey, index);
      const v = numAt(raw, vKey, index);
      out[param] = {
        kind: "vector",
        u,
        v,
        speed: uvSpeed(u, v),
        direction: flowDirection(u, v),
        unit: raw.units?.[uKey] ?? null,
        label: info.label,
      };
      break;
    }
    case "waves":
    case "windWaves":
    case "swell1":
    case "swell2": {
      const prefix =
        param === "waves"
          ? "waves"
          : param === "windWaves"
            ? "wwaves"
            : param === "swell1"
              ? "swell1"
              : "swell2";
      const hKey = `${prefix}_height-surface`;
      const pKey = `${prefix}_period-surface`;
      const dKey = `${prefix}_direction-surface`;
      out[param] = {
        kind: "wave",
        height: numAt(raw, hKey, index),
        period: numAt(raw, pKey, index),
        direction: numAt(raw, dKey, index),
        heightUnit: raw.units?.[hKey] ?? null,
        periodUnit: raw.units?.[pKey] ?? null,
        directionUnit: raw.units?.[dKey] ?? null,
        label: info.label,
      };
      break;
    }
    case "ptype": {
      const key = "ptype-surface";
      const code = numAt(raw, key, index);
      out[param] = {
        kind: "coded",
        code,
        label: info.label,
        text: code === null ? null : (PTYPE_LABELS[code] ?? `Unknown (${code})`),
        unit: raw.units?.[key] ?? null,
      };
      break;
    }
    case "weatherWarnings": {
      const key = "weatherwarnings-surface";
      const code = numAt(raw, key, index);
      out[param] = {
        kind: "coded",
        code,
        label: info.label,
        text: code === null ? null : (WEATHER_WARNING_LABELS[code] ?? `Code ${code}`),
        unit: raw.units?.[key] ?? null,
      };
      break;
    }
    default: {
      const keys = surfaceOrLevelKeys(param, levels);
      for (const key of keys) {
        const value = numAt(raw, key, index);
        const levelSuffix = key.includes("-") ? key.split("-").slice(1).join("-") : "surface";
        const id = info.levelAware ? `${param}@${levelSuffix}` : param;
        out[id] = {
          kind: "scalar",
          value,
          unit: raw.units?.[key] ?? null,
          label: info.levelAware ? `${info.label} (${levelSuffix})` : info.label,
        };
      }
    }
  }

  return out;
}

function surfaceOrLevelKeys(param: WindyParameter, levels: WindyLevel[]): string[] {
  const info = PARAMETER_INFO[param];
  if (!info.levelAware) {
    return info.responseKeys.map((k) => k.replace("{level}", "surface"));
  }
  return levels.flatMap((level) =>
    info.responseKeys.map((k) => k.replace("{level}", level)),
  );
}

function numAt(raw: WindyRawForecast, key: string, index: number): number | null {
  const arr = raw[key];
  if (!Array.isArray(arr)) return null;
  const v = arr[index];
  return typeof v === "number" ? v : v === null ? null : null;
}

function uvSpeed(u: number | null, v: number | null): number | null {
  if (u === null || v === null) return null;
  return Math.round(Math.hypot(u, v) * 100) / 100;
}

/** Meteorological convention: direction wind is coming FROM (degrees). */
export function meteorologicalWindDirection(u: number | null, v: number | null): number | null {
  if (u === null || v === null) return null;
  if (u === 0 && v === 0) return null;
  const deg = (Math.atan2(-u, -v) * 180) / Math.PI;
  return Math.round(((deg % 360) + 360) % 360);
}

/** Direction a u/v flow vector points toward (degrees, 0=N). */
export function flowDirection(u: number | null, v: number | null): number | null {
  if (u === null || v === null) return null;
  if (u === 0 && v === 0) return null;
  const deg = (Math.atan2(u, v) * 180) / Math.PI;
  return Math.round(((deg % 360) + 360) % 360);
}
