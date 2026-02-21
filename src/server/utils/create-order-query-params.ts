import z from "zod";

export type BaseSchemaKeys<TBaseSchema extends z.ZodObject<any>> = Extract<keyof z.infer<TBaseSchema>, string>;
export type OrderField<TBaseSchema extends z.ZodObject<any>> = BaseSchemaKeys<TBaseSchema> | (string & {});

export function createOrderQueryParams<T extends z.ZodObject<any>>(fields: OrderField<T>[]) {
  return z.string().transform((value) => value.split(",").map((field) => field.trim())).refine((order) => {
    if (!order) return true;
    return order.every((field) => {
      const normalizedField = field.startsWith("-") ? field.slice(1) : field;
      return normalizedField.length > 0 && fields.includes(normalizedField as OrderField<T>);
    });
  }, { message: "Invalid order field" }).optional();
}