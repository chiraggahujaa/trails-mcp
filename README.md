# trails-mcp

A **multi-service MCP server** for outdoor / mapping data. Service 1 wraps the open
[Waymarked Trails](https://waymarkedtrails.org) API (recreational routes from OpenStreetMap)
and adds OpenStreetMap [Nominatim](https://nominatim.openstreetmap.org) geocoding so trails can
be found by place name.

The server is **read-only**, needs **no API keys**, and runs locally over stdio.

## What the AI can do

- Search trails by name or reference code (`GR20`, `E5`, "Pennine Way")
- Find trails near a place name in one step ("hiking trails near Zermatt")
- Find trails inside a lon/lat bounding box
- Get full route details: length, operator, description, website, Wikipedia, OSM tags, bbox,
  sub/super-routes, and (optionally) the full path geometry
- Get a route's elevation profile
- Get route geometry clipped to a map box (GeoJSON)
- Resolve a route's Wikipedia link
- Get a guidepost (signpost node)
- Get a route's waymarking symbol (SVG shield)
- Geocode any place name to coordinates

All six Waymarked Trails **flavours** are supported via a `flavour` parameter on each tool:
`hiking` (default), `cycling`, `mtb`, `riding`, `skating`, `slopes`.

> Coordinates: the upstream API speaks Web Mercator (EPSG:3857) internally. This server
> accepts and returns **WGS84 lon/lat** everywhere — the conversion is automatic. Route
> geometry is summarised by default (`geometry_detail: "summary"`) to keep responses small;
> pass `"full"` for every coordinate or `"none"` to omit geometry.

## Tools

| Tool | Purpose |
|---|---|
| `trails_status` | Health/last-update of a flavour |
| `search_routes_by_name` | Fuzzy name/ref search |
| `find_routes_near_place` | Geocode a place + return nearby routes (primary entrypoint) |
| `find_routes_in_bbox` | Routes inside an explicit lon/lat box |
| `get_routes_by_ids` | Batch summary lookup by relation id |
| `get_route_details` | Full route detail (geometry trimmed by default) |
| `get_route_elevation` | Elevation profile |
| `get_route_segments` | Route geometry clipped to a box (GeoJSON) |
| `get_route_wikilink` | Wikipedia URL for a route |
| `get_guidepost` | Guidepost node detail |
| `get_route_symbol` | Waymarking symbol SVG |
| `geocode_place` | Place name → coordinates (Nominatim) |

## Install & build

```bash
npm install
npm run build      # compiles src/ -> dist/
npm test           # unit tests for the geo/conversion helpers
```

Requires Node >= 18.18 (developed on Node 22).

## Connect to an MCP client

The same stdio command works everywhere; only the config file differs. Run `npm run build`
first — the config points at `dist/index.js`.

### Claude Code

Either run:

```bash
claude mcp add trails -- node /Users/chiragahuja/Desktop/trails-mcp/dist/index.js
```

…or add to `~/.claude.json` (global) or a project `.mcp.json`:

```json
{
  "mcpServers": {
    "trails": {
      "command": "node",
      "args": ["/Users/chiragahuja/Desktop/trails-mcp/dist/index.js"]
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json` (global) or `<project>/.cursor/mcp.json` (project-scoped):

```json
{
  "mcpServers": {
    "trails": {
      "command": "node",
      "args": ["/Users/chiragahuja/Desktop/trails-mcp/dist/index.js"]
    }
  }
}
```

### Live-development (no build step)

Point the client at the TypeScript source via `tsx` instead of the built file:

```json
{
  "mcpServers": {
    "trails": {
      "command": "npx",
      "args": ["tsx", "/Users/chiragahuja/Desktop/trails-mcp/src/index.ts"]
    }
  }
}
```

## Try it

Use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector):

```bash
npm run inspect
```

Or, in a connected client, prompt:

> Find hiking trails near Zermatt and show details of the longest one.

…which chains `find_routes_near_place` → `get_route_details`.

## Configuration (env vars)

| Variable | Default | Purpose |
|---|---|---|
| `TRAILS_MCP_LOG_LEVEL` | `info` | `debug` \| `info` \| `warn` \| `error` (logs go to **stderr**) |
| `TRAILS_MCP_USER_AGENT` | `trails-mcp/<version> (...)` | User-Agent sent to upstream APIs (Nominatim requires a descriptive one) |

## Architecture

```
src/
  core/        registry, tool type, http, errors, rate limiter, logger, result helpers
  geo/         Mercator <-> lon/lat conversion, bbox helpers, geometry trimming
  services/
    index.ts   registerAllServices() — the single place new services plug in
    geocoding/ Nominatim client + geocode_place (shared, rate-limited)
    waymarked/ Waymarked Trails client, response shapers, and one file per tool
```

**Adding another service** = create `src/services/<name>/` with a `register()` function and add
one call in `src/services/index.ts`. No existing tool files change. Tool names are namespaced
to avoid collisions, and the registry rejects duplicates.

## Attribution & usage

- Trail data: © OpenStreetMap contributors, served by Waymarked Trails (Sarah Hoffmann), ODbL.
- Geocoding: OpenStreetMap Nominatim — used within its
  [usage policy](https://operations.osmfoundation.org/policies/nominatim/) (max 1 request/sec,
  descriptive User-Agent), enforced in-process.

Please be considerate with request volume; these are free community services.

## License

MIT (this wrapper). Upstream data/services keep their own licenses.
