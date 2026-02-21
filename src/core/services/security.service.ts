import * as argon2 from "argon2";
import bcrypt from "bcrypt";
import * as crypto from "node:crypto";

import { DecryptionError, HashError } from "@/core/errors/security.errors.js";
import type { SecretRecord } from "@/core/schemas/security.schema.js";
import { env } from "@/env.js";
import type { Logger } from "@/logger.js";
import { err, ok, Result } from "neverthrow";

export type SecurityService = ReturnType<typeof createSecurityService>;

function randBytes(n: number): Buffer {
  return crypto.randomBytes(n);
}

async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    salt,
    raw: true,
    timeCost: 3,
    memoryCost: 64 * 1024,
    parallelism: 4,
    hashLength: 32,
  }) as unknown as Promise<Buffer>;
}

function aesGcmEncrypt(key: Buffer, plaintext: string) {
  const iv = randBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext, iv, tag };
}

function aesGcmDecrypt(
  key: Buffer,
  iv: Buffer,
  tag: Buffer,
  ciphertext: Buffer
): string {
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}


const MASTER_PASSWORD = env.ENCRYPTION_MASTER_PASSWORD;

/**
 * Creates the Security service with injected logger.
 * @param deps - Dependencies containing logger
 * @returns Service object with encryption and hashing methods
 */
export function createSecurityService(deps: { logger: Logger }) {
  const { logger } = deps;

  return {
    /**
     * Encrypts a secret with AES-256-GCM using the configured master password.
     * @param secret - Plaintext to encrypt
     * @returns Result with SecretRecord or error on crypto failure
     */
    async encrypt(secret: string): Promise<Result<SecretRecord, DecryptionError>> {
      try {
        logger.debug("Encrypting secret");
        const dataKey = randBytes(32);
        const encSecret = aesGcmEncrypt(dataKey, secret);
        const salt = randBytes(16);
        const masterKey = await deriveKey(MASTER_PASSWORD, salt);
        const encDataKey = aesGcmEncrypt(masterKey, dataKey.toString("base64"));

        return ok({
          ciphertext: encSecret.ciphertext.toString("base64"),
          iv_secret: encSecret.iv.toString("base64"),
          tag_secret: encSecret.tag.toString("base64"),
          encrypted_data_key: encDataKey.ciphertext.toString("base64"),
          iv_data_key: encDataKey.iv.toString("base64"),
          tag_data_key: encDataKey.tag.toString("base64"),
          salt: salt.toString("base64"),
        });
      } catch (e) {
        logger.error("Encryption failed", e);
        return err(new DecryptionError("Encryption failed", e));
      }
    },

    /**
     * Decrypts a SecretRecord with the master password.
     * @param record - Encrypted record from encrypt()
     * @returns Result with plaintext or DecryptionError if wrong password/corrupted data
     */
    async decrypt(record: SecretRecord): Promise<Result<string, DecryptionError>> {
      try {
        logger.debug("Decrypting secret");
        const salt = Buffer.from(record.salt, "base64");
        const masterKey = await deriveKey(MASTER_PASSWORD, salt);

        const dataKeyBase64 = aesGcmDecrypt(
          masterKey,
          Buffer.from(record.iv_data_key, "base64"),
          Buffer.from(record.tag_data_key, "base64"),
          Buffer.from(record.encrypted_data_key, "base64")
        );
        const dataKey = Buffer.from(dataKeyBase64, "base64");

        const secret = aesGcmDecrypt(
          dataKey,
          Buffer.from(record.iv_secret, "base64"),
          Buffer.from(record.tag_secret, "base64"),
          Buffer.from(record.ciphertext, "base64")
        );

        return ok(secret);
      } catch (e) {
        logger.debug("Decryption failed (wrong password or corrupted data)", { cause: e });
        return err(new DecryptionError("Decryption failed", e));
      }
    },

    /**
     * Hashes a password with bcrypt.
     * @param password - Plaintext password
     * @returns Result with bcrypt hash or HashError
     */
    async hash(password: string): Promise<Result<string, HashError>> {
      try {
        logger.debug("Hashing password");
        const hash = await bcrypt.hash(password, 10);
        return ok(hash);
      } catch (e) {
        logger.error("Hash failed", e);
        return err(new HashError("Hash failed", e));
      }
    },

    /**
     * Compares a password with a bcrypt hash.
     * @param password - Plaintext password
     * @param hashedPassword - Bcrypt hash to compare against
     * @returns Result with boolean or HashError
     */
    async compareHash(
      password: string,
      hashedPassword: string
    ): Promise<Result<boolean, HashError>> {
      try {
        logger.debug("Comparing password hash");
        const match = await bcrypt.compare(password, hashedPassword);
        return ok(match);
      } catch (e) {
        logger.error("Hash comparison failed", e);
        return err(new HashError("Hash comparison failed", e));
      }
    },
  };
}
