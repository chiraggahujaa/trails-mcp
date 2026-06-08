import { fetchPostJson } from "../../core/http.js";
import { ToolError } from "../../core/errors.js";
import { WINDY_POINT_FORECAST_URL, getWindyApiKey } from "./config.js";
import type { WindyLevel } from "./levels.js";
import type { WindyModel } from "./models.js";
import { MODEL_INFO, unsupportedParameters } from "./models.js";
import type { WindyParameter } from "./parameters.js";
import type { WindyPointForecastRequest, WindyRawForecast } from "./types.js";

export interface PointForecastOptions {
  lat: number;
  lon: number;
  model: WindyModel;
  parameters: WindyParameter[];
  levels?: WindyLevel[];
}

export class WindyClient {
  /** Whether a Point Forecast API key is configured. */
  isConfigured(): boolean {
    return getWindyApiKey() !== undefined;
  }

  async pointForecast(opts: PointForecastOptions): Promise<WindyRawForecast> {
    const key = getWindyApiKey();
    if (!key) {
      throw new ToolError(
        "bad_request",
        "WINDY_API_KEY is not set. Add your Point Forecast API key to the environment " +
          "(see .env.example). Keys from Map Forecast or Webcams do not work here.",
      );
    }

    const levels = opts.levels?.length ? opts.levels : (["surface"] as WindyLevel[]);
    const unsupported = unsupportedParameters(opts.model, opts.parameters);
    if (unsupported.length > 0) {
      throw new ToolError(
        "bad_request",
        `Model "${opts.model}" does not support: ${unsupported.join(", ")}. ` +
          `Supported: ${MODEL_INFO[opts.model].parameters.join(", ")}.`,
        { model: opts.model, unsupported },
      );
    }

    const body: WindyPointForecastRequest = {
      lat: roundCoord(opts.lat),
      lon: roundCoord(opts.lon),
      model: opts.model,
      parameters: opts.parameters,
      levels,
      key,
    };

    try {
      return await fetchPostJson<WindyRawForecast>(WINDY_POINT_FORECAST_URL, body);
    } catch (err) {
      if (err instanceof ToolError) throw err;
      throw err;
    }
  }
}

/** Windy rounds coordinates to 2 decimal places (~1 km max error). */
function roundCoord(n: number): number {
  return Math.round(n * 100) / 100;
}
