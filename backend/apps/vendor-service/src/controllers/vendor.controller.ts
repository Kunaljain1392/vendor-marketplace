import type { Request, Response } from "express";
import {
  createVendorSchema,
  updateVendorSchema,
} from "../schemas/vendor.schema.js";
import { vendorService } from "../services/vendor.service.js";
import { AppError } from "../errors/app.error.js";

export const createVendor = async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const result = createVendorSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const vendor = await vendorService.createVendor(
    req.user.userId,
    req.user.role,
    result.data,
  );

  return res.status(201).json({
    success: true,
    data: vendor,
  });
};

export const getMyVendor = async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const vendor = await vendorService.getMyVendor(
    req.user.userId,
  );

  return res.status(200).json({
    success: true,
    data: vendor,
  });
};

export const updateMyVendor = async (
  req: Request,
  res: Response,
) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const result = updateVendorSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const vendor = await vendorService.updateMyVendor(
    req.user.userId,
    result.data,
  );

  return res.status(200).json({
    success: true,
    data: vendor,
  });
};