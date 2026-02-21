type PrismaSortDirection = "asc" | "desc";

/**
 * Converts query `order` entries into Prisma `orderBy` objects.
 * Supports descending with `-` prefix (e.g. `-createdAt`).
 * @param order - Parsed order fields from querystring
 * @returns Prisma-compatible orderBy array
 */
export function toOrderFilter<TOrderBy extends Record<string, unknown> = Record<string, unknown>>(
  order?: string[]
): TOrderBy[] | undefined {
  if (!order || order.length === 0) return undefined;

  return order.map((field) => {
    const isDesc = field.startsWith("-");
    const normalizedField = isDesc ? field.slice(1) : field;
    const direction: PrismaSortDirection = isDesc ? "desc" : "asc";

    return { [normalizedField]: direction } as TOrderBy;
  });
}