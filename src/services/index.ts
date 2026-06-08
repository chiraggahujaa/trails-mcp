// THE single aggregation point for services.
//
// To add a new service: create src/services/<name>/ with a register() function,
// import it here, and add one call below. No existing tool/service file changes.
import type { ToolRegistry } from "../core/registry.js";
import { registerGeocoding } from "./geocoding/register.js";
import { registerWaymarked } from "./waymarked/register.js";

export function registerAllServices(registry: ToolRegistry): void {
  // Geocoding is shared infrastructure; it returns its client so route services
  // can reuse the same rate-limited instance.
  const { nominatim } = registerGeocoding(registry);

  registerWaymarked(registry, { nominatim });

  // Future services plug in here, e.g.:
  //   registerSomeOtherProvider(registry, { nominatim });
}
