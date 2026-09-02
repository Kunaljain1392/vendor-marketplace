import type { Response } from "express";

import type { AuthenticatedRequest } from "../types/auth.ts";

import { ProductMediaType } from "../entities/enum/product-media-type.enum";
import { uploadProductMedia } from "../services/cloudinary.service";
import { productMediaService } from "../services/product-media.service";
import { AppError } from "../utils/app-error";
import { getVendorByUserId } from "../clients/vendor.client";
import { ProductService } from "../services/product.service";
import {
  getProductIdParam,
  getRequestParam,
} from "../utils/request-params.js";

const productService = new ProductService();

export const uploadMedia = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const productId = getProductIdParam(
    req.params.productId,
  );

  if (!req.file) {
    throw new AppError("Media file is required", 400);
  }

  const vendor = await getVendorByUserId(
    req.user.userId,
    req.accessToken,
  );

  await productService.verifyProductOwnership(
    productId,
    vendor.id,
  );

  const isVideo = req.file.mimetype.startsWith("video/");

  const type = isVideo
    ? ProductMediaType.VIDEO
    : ProductMediaType.IMAGE;

  const result = await uploadProductMedia(
    req.file.buffer,
    isVideo ? "video" : "image",
    productId,
  );

  const media = await productMediaService.addMedia(
    productId,
    type,
    result.secure_url,
    result.public_id,
  );

  res.status(201).json({
    success: true,
    data: media,
  });
};

export const setPrimaryImage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const productId = getProductIdParam(
    req.params.productId,
  );

  const mediaId = getRequestParam(
  req.params.mediaId,
  "Invalid media ID",
);

  const vendor = await getVendorByUserId(
    req.user.userId,
    req.accessToken,
  );

  await productService.verifyProductOwnership(
    productId,
    vendor.id,
  );

  await productMediaService.setPrimaryImage(
    productId,
    mediaId,
  );

  res.status(200).json({
    success: true,
    message: "Primary image updated successfully",
  });
};

export const deleteMedia = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const productId = getProductIdParam(
    req.params.productId,
  );

  const mediaId = getRequestParam(
  req.params.mediaId,
  "Invalid media ID",
);

  const vendor = await getVendorByUserId(
    req.user.userId,
    req.accessToken,
  );

  await productService.verifyProductOwnership(
    productId,
    vendor.id,
  );

  await productMediaService.deleteMedia(
    productId,
    mediaId,
  );

  res.status(200).json({
    success: true,
    message: "Media deleted successfully",
  });
};