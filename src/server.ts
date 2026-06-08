// Builds the MCP server, registers all service tools, and serves over stdio.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ToolRegistry } from "./core/registry.js";
import { registerAllServices } from "./services/index.js";
import { logger } from "./core/logger.js";
import { VERSION } from "./version.js";

export async function main(): Promise<void> {
  const server = new McpServer({
    name: "trails-mcp",
    version: VERSION,
  });

  const registry = new ToolRegistry();
  registerAllServices(registry);
  registry.bind(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("trails-mcp server connected over stdio");
}
