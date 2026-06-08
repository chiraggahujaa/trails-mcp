/**
 * Geopotential / pressure levels for Windy Point Forecast.
 *
 * Levels apply to: temp, dewpoint, wind, rh, gh.
 * All other parameters always use surface regardless of the levels array.
 *
 * Pressure levels (e.g. 850h) represent the altitude in the atmosphere where that
 * pressure surface exists — useful for mountain weather (treeline, summit winds).
 */
export const WINDY_LEVELS = [
  "surface",
  "1000h",
  "950h",
  "925h",
  "900h",
  "850h",
  "800h",
  "700h",
  "600h",
  "500h",
  "400h",
  "300h",
  "200h",
  "150h",
] as const;

export type WindyLevel = (typeof WINDY_LEVELS)[number];

/** Approximate geopotential height (m) for common pressure levels at mid-latitudes. */
export const LEVEL_ALTITUDE_HINTS: Record<WindyLevel, string> = {
  surface: "Ground / 2 m above surface (model-dependent)",
  "1000h": "~0–100 m (near sea level)",
  "950h": "~500 m",
  "925h": "~800 m",
  "900h": "~1,000 m",
  "850h": "~1,500 m (common free-troposphere reference)",
  "800h": "~2,000 m",
  "700h": "~3,000 m",
  "600h": "~4,200 m",
  "500h": "~5,600 m",
  "400h": "~7,200 m",
  "300h": "~9,100 m (jet-stream level)",
  "200h": "~11,800 m",
  "150h": "~13,500 m",
};

export const LEVEL_DESCRIPTIONS: Record<WindyLevel, string> = {
  surface:
    "Surface level (default). Best for trailhead conditions: ground temperature, " +
    "surface wind, and precipitation at the coordinate.",
  "1000h":
    "1000 hPa (~sea level). Useful for coastal/lowland forecasts when surface " +
    "orography differs from the model grid cell.",
  "950h": "950 hPa (~500 m). Lower foothills and valley inversions.",
  "925h": "925 hPa (~800 m). Mid-elevation valleys and lower mountain slopes.",
  "900h": "900 hPa (~1 km). Lower mountain ridges and high valleys.",
  "850h":
    "850 hPa (~1.5 km). Standard level for free-atmosphere temperature/wind; " +
    "often used for mountain-pass and sub-alpine conditions.",
  "800h": "800 hPa (~2 km). High ridges and lower alpine terrain.",
  "700h": "700 hPa (~3 km). High alpine / treeline elevation band.",
  "600h": "600 hPa (~4.2 km). Upper alpine and lower glaciated terrain.",
  "500h": "500 hPa (~5.6 km). High peaks and upper-atmosphere weather systems.",
  "400h": "400 hPa (~7.2 km). Very high summits; jet-stream proximity.",
  "300h": "300 hPa (~9.1 km). Jet-stream level; strong winds aloft.",
  "200h": "200 hPa (~11.8 km). Upper troposphere.",
  "150h": "150 hPa (~13.5 km). Near tropopause.",
};
