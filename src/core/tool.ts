// The unit of registration. A service produces ToolDefinitions; the registry
// binds them to the McpServer. defineTool() is an identity helper that gives
// us argument-type inference from the zod input shape.
import type { ZodRawShape, ZodTypeAny, objectOutputType } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export interface ToolDefinition<Shape extends ZodRawShape = ZodRawShape> {
  /** Globally unique tool name, namespaced `<service>_<verb>_<noun>`. */
  name: string;
  /** Optional human-friendly title shown by some clients. */
  title?: string;
  /** What the tool does + when to use it. Written for the model. */
  description: string;
  /** Zod raw shape (a map of field -> zod schema), consumed by the SDK. */
  inputSchema: Shape;
  /** Implementation. Receives parsed+defaulted args. */
  handler: (args: objectOutputType<Shape, ZodTypeAny>) => Promise<CallToolResult>;
}

export function defineTool<Shape extends ZodRawShape>(
  def: ToolDefinition<Shape>,
): ToolDefinition<Shape> {
  return def;
}
