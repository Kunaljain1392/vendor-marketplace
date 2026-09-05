import { z } from "zod";

export const createInventorySchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(0),
});

export const updateInventorySchema = z.object({
  quantity: z.number().int().min(0),
});

export const decreaseStockSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
  orderId: z.string().uuid().optional(),
});