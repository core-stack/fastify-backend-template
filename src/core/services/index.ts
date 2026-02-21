import { Repositories } from "@/core/repositories/index.js";
import { Logger } from "@/logger.js";
import { createSecurityService } from "./security.service.js";

type ServicesDeps = {
  repositories: Repositories;
  logger: Logger;
};

export function createServices(deps: ServicesDeps) {
  const serviceLogger = deps.logger;
  return {
    securityService: createSecurityService({
      logger: serviceLogger.child("security"),
    }),
  };
}
export type Services = ReturnType<typeof createServices>;

export * from "./security.service.js";

