import z from "zod";

/** Error response schema for 4xx/5xx */
export const errorResponseSchema = z.object({
  error: z.string(),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
