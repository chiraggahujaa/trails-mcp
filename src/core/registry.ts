// Collects ToolDefinitions from services and binds them to an McpServer.
//
// Each handler is wrapped so any thrown error becomes an `isError` tool result
// (the process never crashes), and so failures are logged to stderr.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolDefinition } from "./tool.js";
import { toErrorResult } from "./errors.js";
import { logger } from "./logger.js";

// Tools have heterogeneous input shapes, so the registry stores them with an
// erased shape. defineTool() preserves precise arg types at each call site;
// here we only need name/description/handler uniformity.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyToolDefinition = ToolDefinition<any>;

export class ToolRegistry {
  private readonly tools = new Map<string, AnyToolDefinition>();

  add(def: AnyToolDefinition): void {
    if (this.tools.has(def.name)) {
      throw new Error(`Duplicate tool name: "${def.name}"`);
    }
    this.tools.set(def.name, def);
  }

  addAll(defs: AnyToolDefinition[]): void {
    for (const def of defs) this.add(def);
  }

  list(): AnyToolDefinition[] {
    return [...this.tools.values()];
  }

  bind(server: McpServer): void {
    for (const def of this.tools.values()) {
      server.registerTool(
        def.name,
        {
          title: def.title,
          description: def.description,
          inputSchema: def.inputSchema,
        },
        async (args: unknown) => {
          try {
            return await def.handler(args as never);
          } catch (err) {
            logger.error(`tool "${def.name}" failed`, {
              message: err instanceof Error ? err.message : String(err),
            });
            return toErrorResult(err);
          }
        },
      );
    }
    logger.info(`registered ${this.tools.size} tools`, { tools: [...this.tools.keys()] });
  }
}
