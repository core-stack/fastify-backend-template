/**
 * Error when decryption fails (wrong password or corrupted data).
 */
export class DecryptionError extends Error {
  code = "DECRYPTION_ERROR";

  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "DecryptionError";
  }
}

/**
 * Error when hashing or comparison fails.
 */
export class HashError extends Error {
  code = "HASH_ERROR";

  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "HashError";
  }
}
