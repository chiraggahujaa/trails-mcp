// Central version + User-Agent. Nominatim's usage policy requires a descriptive,
// identifying User-Agent on every request, so this is shared by all HTTP clients.
export const VERSION = "0.1.0";

export const USER_AGENT =
  process.env.TRAILS_MCP_USER_AGENT ??
  `trails-mcp/${VERSION} (+https://github.com/datainsights/trails-mcp; outdoor-data MCP server)`;
