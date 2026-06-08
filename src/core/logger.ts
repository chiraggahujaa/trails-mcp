// STDERR-ONLY logger.
//
// CRITICAL: an MCP stdio server uses stdout exclusively for JSON-RPC protocol
// frames. Writing anything else to stdout corrupts the stream and breaks the
// client. Therefore every diagnostic line goes to stderr. Never use console.log.
type Level = "debug" | "info" | "warn" | "error";

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

// TRAILS_MCP_LOG_LEVEL=debug enables verbose logging; default is "info".
const threshold = LEVELS[(process.env.TRAILS_MCP_LOG_LEVEL as Level) ?? "info"] ?? LEVELS.info;

function emit(level: Level, msg: string, meta?: unknown): void {
  if (LEVELS[level] < threshold) return;
  const record: Record<string, unknown> = {
    t: new Date().toISOString(),
    level,
    msg,
  };
  if (meta !== undefined) record.meta = meta;
  process.stderr.write(`${JSON.stringify(record)}\n`);
}

export const logger = {
  debug: (msg: string, meta?: unknown) => emit("debug", msg, meta),
  info: (msg: string, meta?: unknown) => emit("info", msg, meta),
  warn: (msg: string, meta?: unknown) => emit("warn", msg, meta),
  error: (msg: string, meta?: unknown) => emit("error", msg, meta),
};
