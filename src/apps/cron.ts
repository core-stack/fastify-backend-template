import { acquirePrismaClient, releasePrismaClient } from "@/infra/prisma.js";
import { createLogger } from "@/logger.js";

const logger = createLogger({ context: "cron" });

/**
 * Bootstraps the cron/scheduler jobs.
 */
export async function bootstrapCron() {
  await acquirePrismaClient("cron");
  logger.info("Cron jobs started");

  return async function shutdownCron() {
    await releasePrismaClient("cron");
    logger.info("Cron jobs stopped");
  };
}