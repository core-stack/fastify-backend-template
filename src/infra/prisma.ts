import { env } from "@/env.js";
import { createLogger } from "@/logger.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const logger = createLogger({ context: "infra:prisma" });
let prismaClient: PrismaClient | null = null;
let activeConsumers = 0;
let lifecycleQueue: Promise<unknown> = Promise.resolve();

function runExclusive<T>(operation: () => Promise<T>): Promise<T> {
  const next = lifecycleQueue.then(operation, operation);
  lifecycleQueue = next.then(() => undefined, () => undefined);
  return next;
}

function getOrCreateClient() {
  if (prismaClient) return prismaClient;

  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  prismaClient = new PrismaClient({ adapter });
  return prismaClient;
}

/**
 * Acquires a shared Prisma client for an application context.
 * The underlying DB connection is opened on first consumer only.
 * @returns Shared Prisma client instance
 */
export async function acquirePrismaClient(context: string = "default") {
  return runExclusive(async () => {
    logger.info("Acquiring Prisma client for context", { context });
    const client = getOrCreateClient();

    if (activeConsumers === 0) {
      logger.info("Connecting to database", { context });
      try {
        await client.$connect();
        logger.info("Connected to database", { context });
      } catch (error) {
        logger.error("Failed to connect to database", { context, error });
        throw error;
      }
    }

    activeConsumers += 1;
    logger.info("Acquired Prisma client for context", { context, activeConsumers });
    return client;
  });
}

/**
 * Releases a shared Prisma consumer.
 * The underlying DB connection is closed only when the last consumer leaves.
 */
export async function releasePrismaClient(context: string = "default") {
  await runExclusive(async () => {
    logger.info("Releasing Prisma client for context", { context });
    if (!prismaClient || activeConsumers === 0) return;

    activeConsumers -= 1;
    logger.info("Released Prisma client for context", { context, activeConsumers });
    if (activeConsumers === 0) {
      logger.info("Disconnecting from database", { context });
      try {
        await prismaClient.$disconnect();
        logger.info("Disconnected from database", { context });
      } catch (error) {
        logger.error("Failed to disconnect from database", { context, error });
        throw error;
      }
    }
  });
}
