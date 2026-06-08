import type { ToolRegistry } from "../../core/registry.js";
import { WindyClient } from "./client.js";
import { getPointForecastTool, listForecastOptionsTool } from "./tools/getPointForecast.js";

/** Register Windy Point Forecast tools. */
export function registerWindy(registry: ToolRegistry): void {
  const client = new WindyClient();
  registry.addAll([getPointForecastTool(client), listForecastOptionsTool(client)]);
}
