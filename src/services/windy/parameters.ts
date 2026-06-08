import {
  WINDY_PARAMETERS,
  type ParameterCategory,
  type WindyParameter,
} from "./parameterIds.js";

export { WINDY_PARAMETERS, type ParameterCategory, type WindyParameter };

export interface ParameterInfo {
  id: WindyParameter;
  category: ParameterCategory;
  /** Human-readable name for shaped output. */
  label: string;
  /** What it measures and why it matters for outdoor activity. */
  description: string;
  /** Response keys in the raw API body (may expand per level). */
  responseKeys: string[];
  /** Whether this parameter respects the `levels` array. */
  levelAware: boolean;
  /** Typical units (actual units are in the API `units` object). */
  typicalUnits?: string;
  /** Decode hints for coded values. */
  valueGuide?: string;
}

export const PARAMETER_INFO: Record<WindyParameter, ParameterInfo> = {
  temp: {
    id: "temp",
    category: "weather",
    label: "Air temperature",
    description:
      "Air temperature at the requested pressure level. At surface this is near ground-level " +
      "air (not skin/feels-like). Critical for layering, hypothermia/heat-stress risk, and " +
      "whether precipitation falls as rain or snow. Compare with dewpoint: a small gap (<3 °C) " +
      "suggests fog or cloud formation.",
    responseKeys: ["temp-{level}"],
    levelAware: true,
    typicalUnits: "°C or K (see units in response)",
  },
  dewpoint: {
    id: "dewpoint",
    category: "weather",
    label: "Dew point",
    description:
      "Temperature at which air becomes saturated (100 % relative humidity). When dewpoint is " +
      "close to air temperature, expect fog, mist, or low clouds — common on mountain cols at " +
      "dawn. A large spread indicates dry air and better visibility.",
    responseKeys: ["dewpoint-{level}"],
    levelAware: true,
    typicalUnits: "°C or K",
  },
  precip: {
    id: "precip",
    category: "weather",
    label: "Total precipitation (3 h)",
    description:
      "Liquid-water equivalent accumulated over the preceding 3 hours — includes rainfall, " +
      "snow meltwater, and convective precipitation. Use for trail mud, river crossings, and " +
      "gear choice. Sum consecutive 3 h bins for longer windows.",
    responseKeys: ["past3hprecip-surface"],
    levelAware: false,
    typicalUnits: "mm (water column)",
  },
  snowPrecip: {
    id: "snowPrecip",
    category: "weather",
    label: "Snowfall (3 h)",
    description:
      "Snowfall expressed as liquid-water equivalent over the preceding 3 hours (not snow " +
      "depth). Rough rule: 1 mm water ≈ 1 cm fresh snow in cold air, less when wet. Important " +
      "for alpine route finding and avalanche context (with terrain).",
    responseKeys: ["past3hsnowprecip-surface"],
    levelAware: false,
    typicalUnits: "mm (water equivalent)",
  },
  convPrecip: {
    id: "convPrecip",
    category: "weather",
    label: "Convective precipitation (3 h)",
    description:
      "Precipitation from convection (showers, thunderstorms) over the preceding 3 hours. " +
      "High values with high CAPE suggest thunderstorm risk on exposed ridges — seek shelter " +
      "below treeline.",
    responseKeys: ["past3hconvprecip-surface"],
    levelAware: false,
    typicalUnits: "mm",
  },
  wind: {
    id: "wind",
    category: "weather",
    label: "Wind (u/v components)",
    description:
      "Horizontal wind as a 2-D vector. `u` is eastward component (positive = wind blowing " +
      "toward the east, i.e. from the west). `v` is northward component (positive = toward " +
      "north, i.e. from the south). The shaped response adds speed (m/s) and meteorological " +
      "direction (degrees, direction wind comes FROM: 0=N, 90=E).",
    responseKeys: ["wind_u-{level}", "wind_v-{level}"],
    levelAware: true,
    typicalUnits: "m/s per component",
  },
  windGust: {
    id: "windGust",
    category: "weather",
    label: "Wind gusts",
    description:
      "Peak short-duration wind speed at the surface — often 30–50 % above sustained wind. " +
      "Exposed cols and summits: gusts above ~15 m/s (~34 mph) make balance difficult; above " +
      "~25 m/s is dangerous without protection.",
    responseKeys: ["gust-surface"],
    levelAware: false,
    typicalUnits: "m/s",
  },
  cape: {
    id: "cape",
    category: "weather",
    label: "CAPE",
    description:
      "Convective Available Potential Energy — atmospheric instability in J/kg. Values " +
      "below ~500: stable; 500–1500: weak convection possible; 1500–2500: showers likely; " +
      "above ~2500: strong thunderstorms possible. Pair with convPrecip and ptype on ridge days.",
    responseKeys: ["cape-surface"],
    levelAware: false,
    typicalUnits: "J/kg",
  },
  ptype: {
    id: "ptype",
    category: "weather",
    label: "Precipitation type",
    description:
      "Dominant precipitation type at the surface (integer code). Shaped output includes a " +
      "text label. Not all models support all types.",
    responseKeys: ["ptype-surface"],
    levelAware: false,
    typicalUnits: "unitless code",
    valueGuide: "0=none, 1=rain, 3=freezing rain, 5=snow, 7=rain+snow mix, 8=ice pellets",
  },
  lclouds: {
    id: "lclouds",
    category: "weather",
    label: "Low cloud cover",
    description:
      "Fractional coverage of low clouds (pressure level above 800 hPa — roughly below ~2 km). " +
      "High values mean overcast low cloud, reduced visibility, and dull conditions in valleys.",
    responseKeys: ["lclouds-surface"],
    levelAware: false,
    typicalUnits: "% (0–100)",
  },
  mclouds: {
    id: "mclouds",
    category: "weather",
    label: "Medium cloud cover",
    description:
      "Coverage of mid-level clouds (450–800 hPa, roughly 2–6 km). Often altocumulus/altostratus — " +
      "can signal approaching fronts.",
    responseKeys: ["mclouds-surface"],
    levelAware: false,
    typicalUnits: "% (0–100)",
  },
  hclouds: {
    id: "hclouds",
    category: "weather",
    label: "High cloud cover",
    description:
      "Coverage of high clouds (below 450 hPa, above ~6 km). Cirrus/cirrostratus — may precede " +
      "warm fronts; usually less impact on ground visibility than low cloud.",
    responseKeys: ["hclouds-surface"],
    levelAware: false,
    typicalUnits: "% (0–100)",
  },
  rh: {
    id: "rh",
    category: "weather",
    label: "Relative humidity",
    description:
      "Relative humidity (%): moisture relative to saturation at that temperature/level. " +
      "Near 100 % at the surface → fog/drizzle risk; very low values → dehydration risk and " +
      "static wildfire conditions in dry regions.",
    responseKeys: ["rh-{level}"],
    levelAware: true,
    typicalUnits: "%",
  },
  gh: {
    id: "gh",
    category: "weather",
    label: "Geopotential height",
    description:
      "Altitude (in geopotential metres) of the requested pressure surface. Tells you how high " +
      "a pressure level sits — rises with warm air masses, falls with cold. Useful to compare " +
      "850 hPa temperature with actual summit elevation.",
    responseKeys: ["gh-{level}"],
    levelAware: true,
    typicalUnits: "m (geopotential)",
  },
  pressure: {
    id: "pressure",
    category: "weather",
    label: "Surface pressure",
    description:
      "Mean sea-level or surface air pressure. Falling pressure → deteriorating weather; rising " +
      "→ improving. Rapid drops warn of strong winds or storms within 24 h.",
    responseKeys: ["pressure-surface"],
    levelAware: false,
    typicalUnits: "Pa or hPa",
  },
  cbase: {
    id: "cbase",
    category: "weather",
    label: "Cloud base height",
    description:
      "Height of the lowest cloud layer above ground (AGL). Low cloud base (<300 m) often means " +
      "summits are in cloud even if the trailhead is clear. Available on AROME models only.",
    responseKeys: ["cbase-surface"],
    levelAware: false,
    typicalUnits: "m AGL",
  },
  visibility: {
    id: "visibility",
    category: "weather",
    label: "Horizontal visibility",
    description:
      "Horizontal visibility at the surface — how far you can see through air obscurants (fog, " +
      "haze, precipitation). Below ~1 km: navigation hazard; below ~200 m: serious safety risk " +
      "on unmarked terrain. AROME models only.",
    responseKeys: ["visibility-surface"],
    levelAware: false,
    typicalUnits: "m",
  },
  weatherWarnings: {
    id: "weatherWarnings",
    category: "weather",
    label: "Significant weather (3 h)",
    description:
      "WMO-style significant weather code for the past 3 hours. Shaped output maps codes to " +
      "text (fog, drizzle, rain, snow, showers, thunderstorm, etc.). AROME family only.",
    responseKeys: ["weatherwarnings-surface"],
    levelAware: false,
    typicalUnits: "WMO code",
  },
  waves: {
    id: "waves",
    category: "sea",
    label: "Combined waves",
    description:
      "Total sea state: significant wave height, mean period (seconds between crests at a fixed " +
      "point), and direction waves come FROM (0=N, 90=E). Height >2 m affects coastal walking; " +
      ">4 m dangerous near cliffs.",
    responseKeys: [
      "waves_height-surface",
      "waves_period-surface",
      "waves_direction-surface",
    ],
    levelAware: false,
    typicalUnits: "m, s, degrees",
  },
  windWaves: {
    id: "windWaves",
    category: "sea",
    label: "Wind waves",
    description:
      "Locally wind-generated waves (not swell from distant storms). Height/period/direction " +
      "where waves come FROM. After wind dies, wind waves become swell. gfsWave model only.",
    responseKeys: [
      "wwaves_height-surface",
      "wwaves_period-surface",
      "wwaves_direction-surface",
    ],
    levelAware: false,
    typicalUnits: "m, s, degrees",
  },
  wavesPower: {
    id: "wavesPower",
    category: "sea",
    label: "Wave power flux",
    description:
      "Energy flux transported by waves per unit crest length (kW/m). Higher values mean more " +
      "energetic surf — relevant for coastal safety and kayak launch windows.",
    responseKeys: ["waves_power-surface"],
    levelAware: false,
    typicalUnits: "kW/m",
  },
  swell1: {
    id: "swell1",
    category: "sea",
    label: "Primary swell",
    description:
      "Dominant swell train from a distant fetch: height, period, direction (FROM). Long period " +
      "(>12 s) with moderate height → powerful but organised surf; short period → choppy seas.",
    responseKeys: [
      "swell1_height-surface",
      "swell1_period-surface",
      "swell1_direction-surface",
    ],
    levelAware: false,
    typicalUnits: "m, s, degrees",
  },
  swell2: {
    id: "swell2",
    category: "sea",
    label: "Secondary swell",
    description:
      "Secondary swell system — usually lower height, different direction/period than swell1. " +
      "Crossing swells create confused seas.",
    responseKeys: [
      "swell2_height-surface",
      "swell2_period-surface",
      "swell2_direction-surface",
    ],
    levelAware: false,
    typicalUnits: "m, s, degrees",
  },
  currents: {
    id: "currents",
    category: "sea",
    label: "Ocean surface currents",
    description:
      "Non-tidal ocean current as u/v vector (m/s). u positive = eastward flow; v positive = " +
      "northward. Shaped output adds speed and direction. cmems model only.",
    responseKeys: ["seacurrents_u-surface", "seacurrents_v-surface"],
    levelAware: false,
    typicalUnits: "m/s",
  },
  currentsTide: {
    id: "currentsTide",
    category: "sea",
    label: "Tidal current component",
    description:
      "Tidal contribution to surface current (u/v). Combine mentally with total currents for " +
      "estuary or tidal-flat crossings. cmems model only.",
    responseKeys: ["seacurrents_tide_u-surface", "seacurrents_tide_v-surface"],
    levelAware: false,
    typicalUnits: "m/s",
  },
  aqi: {
    id: "aqi",
    category: "air_quality",
    label: "US Air Quality Index",
    description:
      "US EPA AQI (0–500). 0–50 Good; 51–100 Moderate; 101–150 Unhealthy for sensitive groups; " +
      "151–200 Unhealthy; 201–300 Very unhealthy; 301+ Hazardous. Relevant for smoke from " +
      "wildfires or urban plumes on long ridge days.",
    responseKeys: ["aqi_us-surface"],
    levelAware: false,
    typicalUnits: "AQI index",
  },
  so2sm: {
    id: "so2sm",
    category: "air_quality",
    label: "Sulfur dioxide",
    description:
      "Surface sulfur dioxide — volcanic emissions and fossil-fuel combustion. Irritant; spikes " +
      "near active volcanoes or industrial areas.",
    responseKeys: ["chem_so2sm-surface"],
    levelAware: false,
    typicalUnits: "µg/m³",
  },
  dustsm: {
    id: "dustsm",
    category: "air_quality",
    label: "Mineral dust",
    description:
      "Atmospheric dust (soil, sandstorms, volcanic ash). High values reduce visibility and " +
      "irritate airways — common in deserts and after Saharan plumes over Europe.",
    responseKeys: ["chem_dustsm-surface"],
    levelAware: false,
    typicalUnits: "µg/m³",
  },
  cosc: {
    id: "cosc",
    category: "air_quality",
    label: "Carbon monoxide",
    description:
      "Tropospheric CO — product of incomplete combustion. Elevated near wildfires, urban traffic, " +
      "or stagnant valley inversions.",
    responseKeys: ["chem_cosc-surface"],
    levelAware: false,
    typicalUnits: "µg/m³ or mg/m³",
  },
  go3: {
    id: "go3",
    category: "air_quality",
    label: "Ground-level ozone",
    description:
      "Ozone at the surface — secondary pollutant from sunlight + NOx/VOCs. High on sunny summer " +
      "afternoons; strenuous exertion at AQI-sensitive levels is harder.",
    responseKeys: ["go3-surface"],
    levelAware: false,
    typicalUnits: "µg/m³",
  },
  no2: {
    id: "no2",
    category: "air_quality",
    label: "Nitrogen dioxide",
    description:
      "NO₂ from combustion (traffic, industry). Proxy for urban pollution plumes reaching " +
      "peri-urban trails.",
    responseKeys: ["no2-surface"],
    levelAware: false,
    typicalUnits: "µg/m³",
  },
  pm10: {
    id: "pm10",
    category: "air_quality",
    label: "PM10",
    description:
      "Particulate matter ≤10 µm — coarse dust, pollen fragments, smoke. Enters upper airways; " +
      "masks recommended above local guidelines during fires.",
    responseKeys: ["pm10-surface"],
    levelAware: false,
    typicalUnits: "µg/m³",
  },
  pm2p5: {
    id: "pm2p5",
    category: "air_quality",
    label: "PM2.5",
    description:
      "Fine particulate ≤2.5 µm — smoke, combustion aerosols. Penetrates deep into lungs; primary " +
      "metric during wildfire smoke events.",
    responseKeys: ["pm2p5-surface"],
    levelAware: false,
    typicalUnits: "µg/m³",
  },
  pollenAlder: {
    id: "pollenAlder",
    category: "air_quality",
    label: "Alder pollen",
    description:
      "Alder (Alnus) pollen concentration — early spring allergen in temperate Europe. camsEu only.",
    responseKeys: ["pollen_alder-surface"],
    levelAware: false,
    typicalUnits: "pollen/m³",
  },
  pollenBirch: {
    id: "pollenBirch",
    category: "air_quality",
    label: "Birch pollen",
    description:
      "Birch pollen — major spring allergen across northern/central Europe. camsEu only.",
    responseKeys: ["pollen_birch-surface"],
    levelAware: false,
    typicalUnits: "pollen/m³",
  },
  pollenGrass: {
    id: "pollenGrass",
    category: "air_quality",
    label: "Grass pollen",
    description:
      "Grass pollen — peak summer hay-fever trigger on open meadow trails. camsEu only.",
    responseKeys: ["pollen_grass-surface"],
    levelAware: false,
    typicalUnits: "pollen/m³",
  },
  pollenMugwort: {
    id: "pollenMugwort",
    category: "air_quality",
    label: "Mugwort pollen",
    description:
      "Mugwort (Artemisia) pollen — late-summer allergen. camsEu only.",
    responseKeys: ["pollen_mugwort-surface"],
    levelAware: false,
    typicalUnits: "pollen/m³",
  },
  pollenOlive: {
    id: "pollenOlive",
    category: "air_quality",
    label: "Olive pollen",
    description:
      "Olive tree pollen — Mediterranean spring allergen. camsEu only.",
    responseKeys: ["pollen_olive-surface"],
    levelAware: false,
    typicalUnits: "pollen/m³",
  },
  pollenRagweed: {
    id: "pollenRagweed",
    category: "air_quality",
    label: "Ragweed pollen",
    description:
      "Ragweed (Ambrosia) pollen — late-summer allergen spreading in central/eastern Europe. camsEu only.",
    responseKeys: ["pollen_ragweed-surface"],
    levelAware: false,
    typicalUnits: "pollen/m³",
  },
};

export const PARAMETER_TO_CATEGORY: Record<WindyParameter, ParameterCategory> = Object.fromEntries(
  WINDY_PARAMETERS.map((p) => [p, PARAMETER_INFO[p].category]),
) as Record<WindyParameter, ParameterCategory>;

/** Expand response key templates for level-aware parameters. */
export function expandResponseKeys(param: WindyParameter, levels: string[]): string[] {
  const info = PARAMETER_INFO[param];
  if (!info.levelAware) {
    return info.responseKeys.map((k) => k.replace("{level}", "surface"));
  }
  return levels.flatMap((level) =>
    info.responseKeys.map((k) => k.replace("{level}", level)),
  );
}

/** Precipitation type codes (ptype-surface). */
export const PTYPE_LABELS: Record<number, string> = {
  0: "No precipitation",
  1: "Rain",
  3: "Freezing rain",
  5: "Snow",
  7: "Rain and snow mixture",
  8: "Ice pellets",
};

/** WMO significant weather codes (weatherwarnings-surface). */
export const WEATHER_WARNING_LABELS: Record<number, string> = {
  45: "Fog",
  48: "Fog, depositing rime",
  51: "Slight drizzle",
  53: "Moderate drizzle",
  55: "Heavy drizzle",
  56: "Freezing drizzle, slight",
  57: "Freezing drizzle, moderate or heavy",
  61: "Slight rain, not freezing",
  63: "Moderate rain, not freezing",
  65: "Heavy rain, not freezing",
  66: "Freezing rain, slight",
  67: "Freezing rain, moderate or heavy",
  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Slight rain shower(s)",
  81: "Moderate or heavy rain shower(s)",
  82: "Violent rain shower(s)",
  85: "Slight snow shower(s)",
  86: "Moderate or heavy snow shower(s)",
  95: "Thunderstorm, slight or moderate",
  96: "Thunderstorm with hail, or heavy thunderstorm",
};

/** Default parameter bundle for general trail/day-hike planning. */
export const DEFAULT_TRAIL_PARAMETERS: WindyParameter[] = [
  "temp",
  "wind",
  "windGust",
  "precip",
  "rh",
  "pressure",
  "ptype",
  "lclouds",
];
