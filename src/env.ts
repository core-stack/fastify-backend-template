import z from "zod";

const envSchema = z.object({

  /**
   * The port to run the server on.
   * @default 8852
   */
  PORT: z.coerce.number().default(8852),

  /**
   * The node environment.
   * @default "development"
   */
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  /**
   * The database URL.
   * @example "postgresql://user:password@localhost:5432/database"
   */
  DATABASE_URL: z.string(),

  /**
   * The apps to run.
   * @default "server,worker,cron"
   * @example "server,cron"
   */
  APPS: z.string()
    .default("server,worker,cron")
    .transform((s) => s.split(",").map((x) => x.trim().toLowerCase() as "server" | "worker" | "cron")),


  /**
   * The log level.
   * @default "debug" in development, "info" in production
   * @enum "debug", "info", "warn", "error"
   */
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default(process.env.NODE_ENV === "production" ? "info" : "debug"),

  /**
   * The master password for the encryption.
   * @example "my-master-password"
   */
  ENCRYPTION_MASTER_PASSWORD: z.string().min(8).default("password"),

  /**
   * The JWT secret.
   * @example "my-jwt-secret"
   */
  JWT_SECRET: z.string(),

  /**
   * The JWT access token duration.
   * @default 5 minutes
   */
  JWT_ACCESS_TOKEN_DURATION: z.coerce.number().default(60 * 5 * 1000), // 5 min

  /**
   * The JWT refresh token duration.
   * @default 30 days
   */
  JWT_REFRESH_TOKEN_DURATION: z.coerce.number().default(60 * 60 * 24 * 30 * 1000), // 30 days

  /**
   * The active account token expiration.
   * @default 1 hour
   */
  ACTIVE_ACCOUNT_TOKEN_EXPIRES: z.coerce.number().default(60 * 60 * 1000), // 1h

  /**
   * The reset password token expiration.
   * @default 1 hour
   */
  RESET_PASSWORD_TOKEN_EXPIRES: z.coerce.number().default(60 * 60 * 1000), // 1h

  /**
   * Whether to allow creating accounts.
   * @default true
   */
  ALLOW_CREATE_ACCOUNT: z.coerce.boolean().default(true),

  /**
   * The Redis URL.
   * @example "redis://localhost:6379"
   */
  REDIS_URL: z.url().optional(),

  /**
   * The cookie secret.
   * @example "supersecret"
   */
  COOKIE_SECRET: z.string().default("supersecret"),
});
export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);