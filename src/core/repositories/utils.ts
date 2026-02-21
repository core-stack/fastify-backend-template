import { DbError } from "../errors/db.errors.js";

export function toDbError(cause: unknown): DbError {
  const message = cause instanceof Error ? cause.message : "Unexpected database error";
  return new DbError(message, cause);
}

export function isPrismaUniqueViolation(e: unknown): boolean {
  return e instanceof Error && "code" in e && (e as { code: string }).code === "P2002";
}
