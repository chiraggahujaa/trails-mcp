import { z } from "zod";
import { LEVEL_DESCRIPTIONS, WINDY_LEVELS, type WindyLevel } from "./levels.js";
import { MODEL_INFO, WINDY_MODELS, type WindyModel } from "./models.js";
import {
  DEFAULT_TRAIL_PARAMETERS,
  PARAMETER_INFO,
  WINDY_PARAMETERS,
  type WindyParameter,
} from "./parameters.js";

const modelDescriptions = WINDY_MODELS.map(
  (m: WindyModel) => `${m}: ${MODEL_INFO[m].coverage} — ${MODEL_INFO[m].useWhen}`,
).join(" | ");

const parameterDescriptions = WINDY_PARAMETERS.map(
  (p: WindyParameter) => `${p} — ${PARAMETER_INFO[p].label}: ${PARAMETER_INFO[p].description}`,
).join(" | ");

const levelDescriptions = WINDY_LEVELS.map(
  (l: WindyLevel) => `${l}: ${LEVEL_DESCRIPTIONS[l]}`,
).join(" | ");

export const windyModelSchema = z
  .enum(WINDY_MODELS)
  .default("gfs")
  .describe(
    "Numerical weather/sea/air-quality model. Pick a regional model when available for " +
      "better terrain resolution. Weather models: gfs (global default), icon, iconD2 (DE/AT/CH), " +
      "iconEu, arome*, nam*, hrrr*, canHrdps. Sea: gfsWave, iconWave, iconEuWave, canRdwpsWave, " +
      "cmems. Air quality: cams (global), camsEu (Europe + pollen). Details: " +
      modelDescriptions,
  );

export const windyParameterSchema = z
  .enum(WINDY_PARAMETERS)
  .describe(
    "Forecast variable to retrieve. Must be supported by the chosen model (mixed weather+sea " +
      "params require separate calls). Full list: " +
      parameterDescriptions,
  );

export const windyParametersSchema = z
  .array(windyParameterSchema)
  .min(1)
  .max(WINDY_PARAMETERS.length)
  .default(DEFAULT_TRAIL_PARAMETERS)
  .describe(
    "One or more forecast parameters. Default bundle covers typical trail planning: temp, wind, " +
      "windGust, precip, rh, pressure, ptype, lclouds.",
  );

export const windyLevelsSchema = z
  .array(z.enum(WINDY_LEVELS))
  .default(["surface"])
  .describe(
    "Pressure/geopotential levels for level-aware params (temp, dewpoint, wind, rh, gh). " +
      "Other params always use surface. Default ['surface']. Levels: " +
      levelDescriptions,
  );

export const latSchema = z
  .number()
  .min(-90)
  .max(90)
  .describe(
    "Latitude in WGS84 decimal degrees (-90 to 90). Rounded to 2 decimals by the API (~1 km).",
  );

export const lonSchema = z
  .number()
  .min(-180)
  .max(180)
  .describe(
    "Longitude in WGS84 decimal degrees (-180 to 180). Rounded to 2 decimals by the API (~1 km).",
  );

export const maxStepsSchema = z
  .number()
  .int()
  .min(1)
  .max(200)
  .optional()
  .describe(
    "Optional cap on returned forecast timesteps (from the start). Omit for the full model run. " +
      "Use to keep responses small (e.g. 24 for ~3 days of 3-hourly data).",
  );
