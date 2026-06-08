// Helpers to build MCP tool results (CallToolResult).
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/** A successful result carrying a JSON-serialised payload as text. */
export function jsonResult(data: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

/** A successful result carrying plain text. */
export function textResult(text: string): CallToolResult {
  return { content: [{ type: "text", text }] };
}

/** A successful result carrying an image (e.g. an SVG route shield). */
export function imageResult(base64Data: string, mimeType: string, caption?: string): CallToolResult {
  const content: CallToolResult["content"] = [{ type: "image", data: base64Data, mimeType }];
  if (caption) content.unshift({ type: "text", text: caption });
  return { content };
}
