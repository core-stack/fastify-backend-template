import { acquirePrismaClient, releasePrismaClient } from "@/infra/prisma.js";
import { createLogger } from "@/logger.js";

const logger = createLogger({ context: "worker" });

/**
 * Bootstraps the queue workers.
 */
export async function bootstrapWorker() {
  await acquirePrismaClient("worker");
  logger.info("Queue workers started");

  return async function shutdownWorker() {
    await releasePrismaClient("worker");
    logger.info("Queue workers stopped");
  };
}
