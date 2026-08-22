import { z } from "zod";

export const createVendorSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(1, "Business name must be at least 1 characters")
    .max(100, "Business name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  businessAddress: z
    .string()
    .trim()
    .max(300, "Business address cannot exceed 300 characters")
    .optional(),
});

export const updateVendorSchema = createVendorSchema.partial();

export type CreateVendorInput = z.infer<typeof createVendorSchema>;

export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;