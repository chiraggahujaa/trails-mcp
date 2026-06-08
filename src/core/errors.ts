// Typed errors + mapping to MCP tool results.
//
// Philosophy: expected, AI-actionable failures (no results, bad input, an
// upstream that is briefly unavailable) are returned as `isError: true` tool
// results so the model can read them and react. They are NOT thrown out of the
// process. The stdio loop must always stay alive.
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export type ToolErrorCode =
  | "not_found"
  | "bad_request"
  | "rate_limited"
  | "upstream_unavailable"
  | "internal";

/** A semantic, AI-facing error raised by a client or tool. */
export class ToolError extends Error {
  constructor(
    public readonly code: ToolErrorCode,
    message: string,
    public readonly detail?: unknown,
  ) {
    super(message);
    this.name = "ToolError";
  }
}

/** A non-2xx HTTP response from an upstream API. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
    public readonly body?: string,
  ) {
    super(`HTTP ${status} from ${url}`);
    this.name = "HttpError";
  }
}

/** Try to pull a human message out of an upstream JSON error body. */
function extractUpstreamMessage(body?: string): string | undefined {
  if (!body) return undefined;
  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    const msg = parsed.error ?? parsed.title ?? parsed.message;
    return typeof msg === "string" ? msg : undefined;
  } catch {
    return undefined;
  }
}

/** Normalise any thrown value into a ToolError. */
export function toToolError(err: unknown): ToolError {
  if (err instanceof ToolError) return err;

  if (err instanceof HttpError) {
    const upstream = extractUpstreamMessage(err.body);
    switch (err.status) {
      case 400:
        return new ToolError("bad_request", upstream ?? "The request was rejected as invalid.", {
          url: err.url,
        });
      case 404:
        return new ToolError("not_found", upstream ?? "The requested item was not found.", {
          url: err.url,
        });
      case 429:
        return new ToolError("rate_limited", upstream ?? "Upstream rate limit hit. Try again shortly.", {
          url: err.url,
        });
      default:
        return new ToolError(
          "upstream_unavailable",
          upstream ?? `Upstream returned HTTP ${err.status}.`,
          { url: err.url, status: err.status },
        );
    }
  }

  const message = err instanceof Error ? err.message : String(err);
  return new ToolError("internal", message);
}

/** Convert any thrown value into an `isError` tool result. */
export function toErrorResult(err: unknown): CallToolResult {
  const te = toToolError(err);
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: JSON.stringify({ error: te.code, message: te.message, detail: te.detail }, null, 2),
      },
    ],
  };
}
