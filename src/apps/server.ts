import { createRepositories } from "@/core/repositories/index.js";
import { createServices, Services } from "@/core/services/index.js";
import { env } from "@/env.js";
import { acquirePrismaClient, releasePrismaClient } from "@/infra/prisma.js";
import { createLogger, Logger, LoggerOptions } from "@/logger.js";
import { errorHandler } from "@/server/error-handler.js";
import Fastify from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import z from "zod";
import { registerControllers } from "../server/controllers/index.js";
import { registerPlugins } from "../server/plugins/index.js";


/**
 * Creates a Fastify-compatible logger instance.
 * Use with Fastify: Fastify({ logger: { loggerInstance: createFastifyLogger() } })
 * @param options - Logger options (context, minLevel)
 * @returns Logger instance compatible with Fastify's logger interface
 */
export function createFastifyLogger(options: LoggerOptions = {}) {
  const base = createLogger({ ...options, context: options.context ?? "server" });

  function logWithPinoStyle(level: "info" | "error" | "debug" | "warn", ...args: unknown[]) {
    const [first, second] = args;
    if (typeof first === "object" && first !== null && typeof second === "string") {
      base[level](second, first);
    } else if (typeof first === "string") {
      base[level](first, ...args.slice(1));
    }
  }

  return {
    info: (...args: unknown[]) => logWithPinoStyle("info", ...args),
    error: (...args: unknown[]) => logWithPinoStyle("error", ...args),
    debug: (...args: unknown[]) => logWithPinoStyle("debug", ...args),
    warn: (...args: unknown[]) => logWithPinoStyle("warn", ...args),
    fatal: (...args: unknown[]) => logWithPinoStyle("error", ...args),
    trace: (...args: unknown[]) => logWithPinoStyle("debug", ...args),
    silent: (..._args: unknown[]) => {},
    child: (bindings: Record<string, unknown>, _opts?: Record<string, unknown>) => {
      const reqId = bindings.reqId ?? (bindings.req as { id?: string })?.id;
      const childContext = reqId ? `req:${reqId}` : "request";
      return createFastifyLogger({
        ...options,
        context: options.context ? `${options.context}:${childContext}` : childContext,
        minLevel: options.minLevel,
      });
    },
    level: "info",
  };
}

export async function bootstrapServer() {
  const app = Fastify({
    loggerInstance: createFastifyLogger({ context: "server" }),
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await registerPlugins(app);
  app.setErrorHandler(errorHandler);

  const logger = createLogger({ context: "server" });

  const prisma = await acquirePrismaClient("server");
  app.addHook("onClose", () => releasePrismaClient("server"));

  const repositories = createRepositories({ prisma, logger: logger.child("repository") });
  const services = createServices({ repositories, logger: logger.child("service") });
  
  await registerRoutes(app, { services, logger: logger.child("routes") });

  await app.listen({ port: env.PORT, host: "0.0.0.0" });

  return app;
}

interface RoutesDeps {
  services: Services;
  logger: Logger;
}
async function registerRoutes(app: Awaited<ReturnType<typeof Fastify>>, deps: RoutesDeps) {
  app.get("/health", {
    schema: {
      description: "Health check endpoint",
      tags: ["Health"],
      response: { 200: z.object({ status: z.string() }) },
    },
    handler: async () => ({ status: "ok" }),
  });
  registerControllers(app, deps);
}
