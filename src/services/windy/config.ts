// Windy Point Forecast API configuration.
export const WINDY_POINT_FORECAST_URL = "https://api.windy.com/api/point-forecast/v2";

/** Read the Point Forecast API key from the environment. */
export function getWindyApiKey(): string | undefined {
  const key = process.env.WINDY_API_KEY?.trim();
  return key || undefined;
}
