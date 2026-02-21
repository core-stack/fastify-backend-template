import z from "zod";

/** Params schema for :id routes */
export const idParamsSchema = z.object({
  id: z.uuid(),
});
export type IdParams = z.infer<typeof idParamsSchema>;
