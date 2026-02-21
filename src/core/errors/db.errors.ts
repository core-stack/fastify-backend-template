/**
 * Generic error for unexpected database/Prisma failures.
 */
export class DbError extends Error {
  code = "DB_ERROR";

  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "DbError";
  }
}
