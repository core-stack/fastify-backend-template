import { Services } from "@/core/services/index.js";
import { Logger } from "@/logger.js";
import type { FastifyInstance } from "fastify";

export interface ControllersDeps {
  services: Services;
  logger: Logger;
}

/**
 * Registers all API v1 controllers.
 * @param app - Fastify instance
 */
export function registerControllers(_app: FastifyInstance, _deps: ControllersDeps) {
}

