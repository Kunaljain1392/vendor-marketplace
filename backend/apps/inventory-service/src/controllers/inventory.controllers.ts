import { Request, Response, NextFunction } from "express";

import { inventoryService } from "../services/inventory.service.js";
import {
  createInventorySchema,
  updateInventorySchema,
} from "../schemas/inventory.schema.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export class InventoryController {
  async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { productId, quantity } = createInventorySchema.parse(
        req.body,
      );

      const token = req.headers.authorization!.slice(7);

      const inventory = await inventoryService.createInventory(
        productId,
        quantity,
        token,
        req.user!.userId,
      );

      res.status(201).json(inventory);
    } catch (error) {
      next(error);
    }
  }

  async get(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const inventory = await inventoryService.getInventory(
        String(req.params.productId),
      );

      res.status(200).json(inventory);
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { quantity } = updateInventorySchema.parse(req.body);

      const token = req.headers.authorization!.slice(7);

      const inventory = await inventoryService.updateInventory(
        String(req.params.productId),
        quantity,
        token,
        req.user!.userId,
      );

      res.status(200).json(inventory);
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryController = new InventoryController();