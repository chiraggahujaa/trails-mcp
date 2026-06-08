#!/usr/bin/env node
// Binary entrypoint. Keeps the process alive on the stdio transport and exits
// non-zero on a fatal startup error (logged to stderr, never stdout).
import { main } from "./server.js";
import { logger } from "./core/logger.js";

main().catch((err) => {
  logger.error("fatal: failed to start trails-mcp", {
    message: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
