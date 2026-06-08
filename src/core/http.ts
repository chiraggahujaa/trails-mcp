// Thin fetch wrappers: timeout via AbortController, shared User-Agent, and
// typed HttpError on non-2xx. Uses Node's global fetch (Node >= 18).
import { HttpError, ToolError } from "./errors.js";
import { USER_AGENT } from "../version.js";

const DEFAULT_TIMEOUT_MS = 15_000;

export interface FetchOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

async function doFetch(url: string, opts: FetchOptions, method = "GET"): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      headers: { "user-agent": USER_AGENT, accept: "*/*", ...opts.headers },
      signal: controller.signal,
    });
  } catch (err) {
    const host = (() => {
      try {
        return new URL(url).host;
      } catch {
        return url;
      }
    })();
    if (err instanceof Error && err.name === "AbortError") {
      throw new ToolError("upstream_unavailable", `Request to ${host} timed out.`, { url });
    }
    throw new ToolError("upstream_unavailable", `Could not reach ${host}.`, {
      url,
      cause: err instanceof Error ? err.message : String(err),
    });
  } finally {
    clearTimeout(timer);
  }
}

async function safeText(res: Response): Promise<string | undefined> {
  try {
    return await res.text();
  } catch {
    return undefined;
  }
}

/** GET JSON, throwing HttpError on non-2xx. */
export async function fetchJson<T>(url: string, opts: FetchOptions = {}): Promise<T> {
  const res = await doFetch(url, opts);
  if (!res.ok) throw new HttpError(res.status, url, await safeText(res));
  return (await res.json()) as T;
}

/** GET text (e.g. SVG), throwing HttpError on non-2xx. */
export async function fetchText(url: string, opts: FetchOptions = {}): Promise<string> {
  const res = await doFetch(url, opts);
  if (!res.ok) throw new HttpError(res.status, url, await safeText(res));
  return res.text();
}

/**
 * Resolve where a URL redirects to, returning the final URL after redirects.
 *
 * We use GET (the API returns 405 for HEAD) with the default follow behaviour,
 * then immediately cancel the response body so the redirect target (e.g. a
 * Wikipedia page) is never actually downloaded. We avoid `redirect: "manual"`
 * because the Fetch standard yields an opaque-redirect response whose Location
 * header cannot be read. Used for the wikilink endpoint (303 -> Wikipedia).
 */
export async function resolveRedirect(
  url: string,
  opts: FetchOptions = {},
): Promise<{ status: number; finalUrl: string }> {
  const res = await doFetch(url, opts);
  // Headers have arrived and res.url reflects the final hop; drop the body.
  try {
    await res.body?.cancel();
  } catch {
    /* ignore */
  }
  return { status: res.status, finalUrl: res.url };
}
