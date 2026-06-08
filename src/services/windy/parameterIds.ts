/** Request parameter names accepted by the Windy Point Forecast API. */
export const WINDY_PARAMETERS = [
  // Weather
  "temp",
  "dewpoint",
  "precip",
  "snowPrecip",
  "convPrecip",
  "wind",
  "windGust",
  "cape",
  "ptype",
  "lclouds",
  "mclouds",
  "hclouds",
  "rh",
  "gh",
  "pressure",
  "cbase",
  "visibility",
  "weatherWarnings",
  // Sea
  "waves",
  "windWaves",
  "wavesPower",
  "swell1",
  "swell2",
  "currents",
  "currentsTide",
  // Air quality
  "aqi",
  "so2sm",
  "dustsm",
  "cosc",
  "go3",
  "no2",
  "pm10",
  "pm2p5",
  "pollenAlder",
  "pollenBirch",
  "pollenGrass",
  "pollenMugwort",
  "pollenOlive",
  "pollenRagweed",
] as const;

export type WindyParameter = (typeof WINDY_PARAMETERS)[number];

export type ParameterCategory = "weather" | "sea" | "air_quality";
