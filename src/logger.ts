import { env } from "./env.js";

/** ANSI color codes for terminal output */
const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
} as const;

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: COLORS.dim,
  info: COLORS.green,
  warn: COLORS.yellow,
  error: COLORS.red,
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: "DEBUG",
  info: "INFO",
  warn: "WARN",
  error: "ERROR",
};

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const useColors =
  process.stdout.isTTY === true &&
  process.env.NO_COLOR === undefined &&
  process.env.FORCE_COLOR !== "0";

function colorize(text: string, color: string): string {
  return useColors ? `${color}${text}${COLORS.reset}` : text;
}

function timestamp(): string {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatMessage(
  level: LogLevel,
  context: string | undefined,
  message: string,
  args: unknown[]
): string {
  const ts = timestamp();
  const levelLabel = colorize(LEVEL_LABELS[level].padEnd(5), LEVEL_COLORS[level]);
  const prefix = context ? colorize(`[${context}]`, COLORS.cyan) + " " : "";
  const extra = args.length > 0 ? " " + args.map((a) => formatArg(a)).join(" ") : "";
  return `${ts} ${levelLabel} ${prefix}${message}${extra}`;
}

function formatArg(arg: unknown): string {
  if (arg instanceof Error) {
    return (arg.stack ?? arg.message).replace(/\n/g, "\n    ");
  }
  if (typeof arg === "object" && arg !== null) {
    // Handle Fastify req/res style objects for cleaner output
    const obj = arg as Record<string, unknown>;
    if (obj.req && obj.res) {
      const req = obj.req as { method?: string; url?: string };
      const res = obj.res as { statusCode?: number };
      return `{ method: ${req.method}, url: ${req.url}, statusCode: ${res.statusCode} }`;
    }
    if (obj.req && !obj.res) {
      const req = obj.req as { method?: string; url?: string };
      return `{ method: ${req.method}, url: ${req.url} }`;
    }
    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

export interface LoggerOptions {
  /** Optional context/prefix for log messages (e.g. "server", "worker", "cron") */
  context?: string;
  /** Minimum level to output. Default: "debug" in development, "info" in production */
  minLevel?: LogLevel;
}

/**
 * Creates a logger instance with optional context.
 * @param options - Logger options (context, minLevel)
 * @returns Logger with debug, info, warn, error methods
 */
export function createLogger(options: LoggerOptions = {}) {
  let { context, minLevel } = options;
  minLevel ??= env.LOG_LEVEL;
  const minPriority =
    minLevel !== undefined
      ? LOG_LEVEL_PRIORITY[minLevel]
      : process.env.NODE_ENV === "production"
        ? LOG_LEVEL_PRIORITY.info
        : LOG_LEVEL_PRIORITY.debug;

  function shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= minPriority;
  }

  function log(level: LogLevel, message: string, ...args: unknown[]) {
    if (!shouldLog(level)) return;
    const line = formatMessage(level, context, message, args);
    const output = level === "error" ? process.stderr : process.stdout;
    output.write(line + "\n");
  }

  return {
    debug: (message: string, ...args: unknown[]) => log("debug", message, ...args),
    info: (message: string, ...args: unknown[]) => log("info", message, ...args),
    warn: (message: string, ...args: unknown[]) => log("warn", message, ...args),
    error: (message: string, ...args: unknown[]) => log("error", message, ...args),
    child: (childContext: string) =>
      createLogger({
        ...options,
        context: context ? `${context}:${childContext}` : childContext,
        minLevel,
      }),
  };
}

export type Logger = ReturnType<typeof createLogger>;

/** Default logger without context. Use createLogger() for context. */
export const logger = createLogger();
