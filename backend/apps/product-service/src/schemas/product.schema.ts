import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(150, "Product name cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .max(5000, "Description cannot exceed 5000 characters")
    .optional(),

  category: z
    .string()
    .trim()
    .min(2, "Category must be at least 2 characters")
    .max(100, "Category cannot exceed 100 characters"),

  price: z
    .number()
    .positive("Price must be greater than 0")
    .max(9999999999.99, "Price cannot exceed 9,999,999,999.99")

    .refine(
      (value) => Number.isInteger(value * 100),
      "Price can have at most 2 decimal places",
    ),
});

export const productMediaParamsSchema = z.object({
  productId: z.uuid("Invalid product ID"),
  mediaId: z.uuid("Invalid media ID"),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(20),

  category: z.string().trim().max(100).optional(),

  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const productParamsSchema = z.object({
  productId: z.uuid("Invalid product ID"),
});
