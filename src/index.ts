import "dotenv/config";
import { bootstrapCron } from "./apps/cron.js";
import { bootstrapServer } from "./apps/server.js";
import { bootstrapWorker } from "./apps/worker.js";
import { env } from "./env.js";
import { logger } from "./logger.js";

type ShutdownTask = () => Promise<void>;

async function bootstrap() {
  const shutdownTasks: ShutdownTask[] = [];

  if (env.APPS.includes("server")) {
    const serverApp = await bootstrapServer();
    shutdownTasks.push(async () => {
      await serverApp.close();
    });
  }

  if (env.APPS.includes("worker")) {
    const stopWorker = await bootstrapWorker();
    if (stopWorker) shutdownTasks.push(stopWorker);
  }

  if (env.APPS.includes("cron")) {
    const stopCron = await bootstrapCron();
    if (stopCron) shutdownTasks.push(stopCron);
  }

  let shuttingDown = false;
  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info(`Received ${signal}. Shutting down applications...`);
    await Promise.allSettled(shutdownTasks.map((task) => task()));
    process.exit(0);
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

bootstrap().catch((err) => {
  logger.error("Bootstrap failed", err);
  process.exit(1);
});
