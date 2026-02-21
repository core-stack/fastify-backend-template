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
});
export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);