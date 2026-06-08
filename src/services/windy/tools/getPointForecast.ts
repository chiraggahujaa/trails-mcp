import { z } from "zod";
import { defineTool } from "../../../core/tool.js";
import { jsonResult } from "../../../core/result.js";
import type { WindyClient } from "../client.js";
import { LEVEL_ALTITUDE_HINTS, LEVEL_DESCRIPTIONS, WINDY_LEVELS } from "../levels.js";
import { MODEL_INFO, WINDY_MODELS } from "../models.js";
import { PARAMETER_INFO, WINDY_PARAMETERS } from "../parameters.js";
import { shapeForecast } from "../shape.js";
import {
  latSchema,
  lonSchema,
  maxStepsSchema,
  windyLevelsSchema,
  windyModelSchema,
  windyParametersSchema,
} from "../schemas.js";

export function getPointForecastTool(client: WindyClient) {
  return defineTool({
    name: "get_point_forecast",
    title: "Get weather forecast at coordinates",
    description:
      "Fetch machine-readable weather, marine, or air-quality forecast data for a lat/lon point " +
      "from the Windy Point Forecast API (https://api.windy.com/point-forecast). Requires " +
      "WINDY_API_KEY. Returns shaped timesteps with decoded wind direction, precipitation type, " +
      "and WMO weather codes plus a parameterGuide explaining each requested variable. Pick a " +
      "regional model when available (iconEu for Europe, hrrrConus for US, arome for France). " +
      "Use list_forecast_options to browse all models, parameters, and pressure levels.",
    inputSchema: {
      lat: latSchema,
      lon: lonSchema,
      model: windyModelSchema,
      parameters: windyParametersSchema,
      levels: windyLevelsSchema,
      max_steps: maxStepsSchema,
    },
    handler: async ({ lat, lon, model, parameters, levels, max_steps }) => {
      const raw = await client.pointForecast({ lat, lon, model, parameters, levels });
      const shaped = shapeForecast(raw, {
        lat,
        lon,
        model,
        parameters,
        levels,
        maxSteps: max_steps,
      });
      return jsonResult(shaped);
    },
  });
}

/** Reference catalog of all Windy models, parameters, and levels — no API call. */
export function listForecastOptionsTool(client: WindyClient) {
  return defineTool({
    name: "list_forecast_options",
    title: "List Windy forecast models, parameters, and levels",
    description:
      "Return the full catalog of Windy Point Forecast models, parameters, and pressure levels " +
      "with descriptions and model–parameter compatibility. Does not call the Windy API (no quota " +
      "used). Use before get_point_forecast to choose valid model/parameter combinations.",
    inputSchema: {
      category: z
        .enum(["all", "weather", "sea", "air_quality"])
        .default("all")
        .describe("Filter models and parameters by category."),
    },
    handler: async ({ category }) => {
      const models = WINDY_MODELS.filter(
        (m) => category === "all" || MODEL_INFO[m].category === category,
      ).map((m) => ({
        id: m,
        category: MODEL_INFO[m].category,
        coverage: MODEL_INFO[m].coverage,
        useWhen: MODEL_INFO[m].useWhen,
        parameters: MODEL_INFO[m].parameters,
      }));

      const parameters = WINDY_PARAMETERS.filter(
        (p) => category === "all" || PARAMETER_INFO[p].category === category,
      ).map((p) => ({
        id: p,
        category: PARAMETER_INFO[p].category,
        label: PARAMETER_INFO[p].label,
        description: PARAMETER_INFO[p].description,
        levelAware: PARAMETER_INFO[p].levelAware,
        typicalUnits: PARAMETER_INFO[p].typicalUnits,
        valueGuide: PARAMETER_INFO[p].valueGuide,
        responseKeys: PARAMETER_INFO[p].responseKeys,
      }));

      const levels = WINDY_LEVELS.map((l) => ({
        id: l,
        description: LEVEL_DESCRIPTIONS[l],
        approximateAltitude: LEVEL_ALTITUDE_HINTS[l],
        appliesTo: ["temp", "dewpoint", "wind", "rh", "gh"],
      }));

      return jsonResult({
        apiConfigured: client.isConfigured(),
        apiKeyEnv: "WINDY_API_KEY",
        endpoint: "POST https://api.windy.com/api/point-forecast/v2",
        models,
        parameters,
        levels,
      });
    },
  });
}
