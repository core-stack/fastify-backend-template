const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Checks if a string is a valid UUID.
 * @param value - Candidate UUID string
 * @returns True when the value matches UUID format
 */
export function isUUID(value: string) {
  return UUID_REGEX.test(value);
}
