import z from "zod";

export const queryParamsSchema = z.object({
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});