import { z } from "zod";

/**
 * Schema for an encrypted secret record.
 * Stores ciphertext, IVs, auth tags, and encrypted data key.
 */
export const secretRecordSchema = z.object({
  ciphertext: z.string(),
  iv_secret: z.string(),
  tag_secret: z.string(),
  encrypted_data_key: z.string(),
  iv_data_key: z.string(),
  tag_data_key: z.string(),
  salt: z.string(),
});

export type SecretRecord = z.infer<typeof secretRecordSchema>;
