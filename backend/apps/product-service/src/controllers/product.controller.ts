import type { Request, Response } from "express";

import { ProductService } from "../services/product.service.js";
import { ProductStatus } from "../entities/enum/product-status.enum.js";
import { getProductIdParam } from "../utils/request-params.js";
import { getVendorByUserId } from "../clients/vendor.client.js";
import { AppError } from "../utils/app-error.js";

const productService = new ProductService();

export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user || !req.accessToken) {
    throw new AppError(
      "Authentication required",
      401,
    );
  }

  const vendor = await getVendorByUserId(
    req.user.userId,
    req.accessToken,
  );

  const product =
    await productService.createProduct({
      vendorId: vendor.id,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
    });

  res.status(201).json({
    success: true,
    data: product,
  });
};

export const getProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const product =
    await productService.getProductById(
      getProductIdParam(
        req.params.productId,
      ),
    );

  res.status(200).json({
    success: true,
    data: product,
  });
};

export const listProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const page = req.query.page as unknown as number;
  const limit = req.query.limit as unknown as number;

  const category =
    req.query.category as string | undefined;

  const status =
    req.query.status as
      | ProductStatus
      | undefined;

  const result =
    await productService.listProducts(
      page,
      limit,
      category,
      status,
    );

  res.status(200).json({
    success: true,
    data: result.products,
    pagination: result.pagination,
  });
};

export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user || !req.accessToken) {
    throw new AppError(
      "Authentication required",
      401,
    );
  }

  const vendor = await getVendorByUserId(
    req.user.userId,
    req.accessToken,
  );

  const product =
    await productService.updateProduct(
      getProductIdParam(
        req.params.productId,
      ),
      vendor.id,
      {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
      },
    );

  res.status(200).json({
    success: true,
    data: product,
  });
};

export const deactivateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user || !req.accessToken) {
    throw new AppError(
      "Authentication required",
      401,
    );
  }

  const vendor = await getVendorByUserId(
    req.user.userId,
    req.accessToken,
  );

  const product =
    await productService.deactivateProduct(
      getProductIdParam(
        req.params.productId,
      ),
      vendor.id,
    );

  res.status(200).json({
    success: true,
    data: product,
  });
};