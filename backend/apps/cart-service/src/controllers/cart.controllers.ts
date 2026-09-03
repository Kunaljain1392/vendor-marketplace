import type { Request, Response } from "express";

import { logger } from "../config/logger.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

import {
  addCartItemSchema,
  updateCartItemSchema,
} from "../schemas/cart.schema.js";

import { cartService } from "../services/cart.service.js";

function getToken(req: Request): string {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Authentication token missing");
  }

  return authorization.substring(7);
}

function getProductId(req: Request): string {
  const { productId } = req.params;

  if (typeof productId !== "string" || !productId) {
    throw new Error("Product ID is required");
  }

  return productId;
}

export class CartController {
  async getCart(
    req: Request,
    res: Response,
  ): Promise<void> {
    const authenticatedReq =
      req as AuthenticatedRequest;

    const userId = authenticatedReq.user.userId;

    const cart = await cartService.getCart(userId);

    logger.info(
      {
        userId,
      },
      "Cart fetched successfully",
    );

    res.status(200).json({
      success: true,
      data: cart,
    });
  }

  async addItem(
    req: Request,
    res: Response,
  ): Promise<void> {
    const authenticatedReq =
      req as AuthenticatedRequest;

    const userId = authenticatedReq.user.userId;
    const token = getToken(req);

    const input = addCartItemSchema.parse(req.body);

    const cart = await cartService.addItem(
      userId,
      input.productId,
      input.quantity,
      token,
    );

    logger.info(
      {
        userId,
        productId: input.productId,
        quantity: input.quantity,
      },
      "Cart item added successfully",
    );

    res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      data: cart,
    });
  }

  async updateItem(
    req: Request,
    res: Response,
  ): Promise<void> {
    const authenticatedReq =
      req as AuthenticatedRequest;

    const userId = authenticatedReq.user.userId;
    const token = getToken(req);

    const input = updateCartItemSchema.parse(req.body);
    const productId = getProductId(req);

    const cart = await cartService.updateItem(
      userId,
      productId,
      input.quantity,
      token,
    );

    logger.info(
      {
        userId,
        productId,
        quantity: input.quantity,
      },
      "Cart item updated successfully",
    );

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: cart,
    });
  }

  async removeItem(
    req: Request,
    res: Response,
  ): Promise<void> {
    const authenticatedReq =
      req as AuthenticatedRequest;

    const userId = authenticatedReq.user.userId;
    const productId = getProductId(req);

    const cart = await cartService.removeItem(
      userId,
      productId,
    );

    logger.info(
      {
        userId,
        productId,
      },
      "Cart item removed successfully",
    );

    res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
      data: cart,
    });
  }

  async clearCart(
    req: Request,
    res: Response,
  ): Promise<void> {
    const authenticatedReq =
      req as AuthenticatedRequest;

    const userId = authenticatedReq.user.userId;

    const cart = await cartService.clearCart(userId);

    logger.info(
      {
        userId,
      },
      "Cart cleared successfully",
    );

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  }
}

export const cartController = new CartController();