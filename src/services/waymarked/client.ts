// Typed HTTP client for the Waymarked Trails API. One method per endpoint.
// All methods are flavour-aware and pass the language as an accept-language
// header (matching how the real frontend selects localised names).
import { fetchJson, fetchText, resolveRedirect } from "../../core/http.js";
import { ToolError } from "../../core/errors.js";
import { baseUrl, type Flavour } from "./flavours.js";
import type {
  DetailedRouteItem,
  ElevationResponse,
  GeoJsonFeatureCollection,
  NodeItemResponse,
  RouteListResponse,
  StatusResponse,
} from "./types.js";

function langHeaders(language: string): Record<string, string> {
  return { "accept-language": language };
}

export class WaymarkedClient {
  status(flavour: Flavour): Promise<StatusResponse> {
    return fetchJson<StatusResponse>(`${baseUrl(flavour)}/status`);
  }

  search(
    flavour: Flavour,
    args: { query: string; limit: number; page: number; language: string },
  ): Promise<RouteListResponse> {
    const url =
      `${baseUrl(flavour)}/list/search?query=${encodeURIComponent(args.query)}` +
      `&limit=${args.limit}&page=${args.page}`;
    return fetchJson<RouteListResponse>(url, { headers: langHeaders(args.language) });
  }

  byArea(
    flavour: Flavour,
    args: { bbox: string; limit: number; language: string },
  ): Promise<RouteListResponse> {
    const url = `${baseUrl(flavour)}/list/by_area?bbox=${encodeURIComponent(args.bbox)}&limit=${args.limit}`;
    return fetchJson<RouteListResponse>(url, { headers: langHeaders(args.language) });
  }

  byIds(
    flavour: Flavour,
    args: { relations: number[]; language: string },
  ): Promise<RouteListResponse> {
    const url = `${baseUrl(flavour)}/list/by_ids?relations=${args.relations.join(",")}`;
    return fetchJson<RouteListResponse>(url, { headers: langHeaders(args.language) });
  }

  segments(
    flavour: Flavour,
    args: { bbox: string; relations: number[] },
  ): Promise<GeoJsonFeatureCollection> {
    const url =
      `${baseUrl(flavour)}/list/segments?bbox=${encodeURIComponent(args.bbox)}` +
      `&relations=${args.relations.join(",")}`;
    return fetchJson<GeoJsonFeatureCollection>(url);
  }

  details(
    flavour: Flavour,
    args: { id: number; language: string },
  ): Promise<DetailedRouteItem> {
    return fetchJson<DetailedRouteItem>(`${baseUrl(flavour)}/details/relation/${args.id}`, {
      headers: langHeaders(args.language),
    });
  }

  elevation(
    flavour: Flavour,
    args: { id: number; simplify: number; language: string },
  ): Promise<ElevationResponse> {
    const url = `${baseUrl(flavour)}/details/relation/${args.id}/way-elevation?simplify=${args.simplify}`;
    return fetchJson<ElevationResponse>(url, { headers: langHeaders(args.language) });
  }

  guidepost(
    flavour: Flavour,
    args: { id: number; language: string },
  ): Promise<NodeItemResponse> {
    return fetchJson<NodeItemResponse>(`${baseUrl(flavour)}/details/guidepost/${args.id}`, {
      headers: langHeaders(args.language),
    });
  }

  /** Resolve the Wikipedia URL a route's wikilink endpoint redirects to (303). */
  async wikilink(
    flavour: Flavour,
    args: { id: number; language: string },
  ): Promise<string> {
    const url = `${baseUrl(flavour)}/details/relation/${args.id}/wikilink`;
    const { status, finalUrl } = await resolveRedirect(url, { headers: langHeaders(args.language) });
    // After following the 303, finalUrl points at Wikipedia. If we never left
    // the API host, there was no link.
    if (status >= 400 || finalUrl.includes("waymarkedtrails.org")) {
      throw new ToolError("not_found", `No Wikipedia link available for relation ${args.id}.`);
    }
    return finalUrl;
  }

  /** Fetch a route shield SVG by its symbol id. */
  symbol(flavour: Flavour, args: { symbolId: string }): Promise<string> {
    return fetchText(`${baseUrl(flavour)}/symbols/id/${encodeURIComponent(args.symbolId)}`);
  }
}
