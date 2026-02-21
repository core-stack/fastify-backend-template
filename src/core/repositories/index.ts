import { Logger } from "@/logger.js";
import { PrismaClient } from "@prisma/client";


type RepositoryDeps = {
  prisma: PrismaClient;
  logger: Logger;
}

export function createRepositories(_deps: RepositoryDeps) {
  return {
    
  };
}

export type Repositories = ReturnType<typeof createRepositories>;

