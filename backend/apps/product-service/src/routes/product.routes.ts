import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  uploadMedia,
  setPrimaryImage,
  deleteMedia,
} from "../controllers/product-media.controller.js";
import {
  uploadProductMedia,
  validateProductMediaSize,
} from "../middleware/upload.middleware.js";
import { authenticatedHandler } from "../utils/authenticated-handler.js";

import {
  createProduct,
  getProduct,
  listProducts,
  updateProduct,
  deactivateProduct,
} from "../controllers/product.controller.js";

import {
  createProductSchema,
  productQuerySchema,
  productParamsSchema,
  productMediaParamsSchema,
  updateProductSchema,
} from "../schemas/product.schema.js";

const router = Router();

// Create product
router.post(
  "/",
  authenticate,
  authorize("VENDOR"),
  validate(createProductSchema, "body"),
  createProduct,
);

// List products
router.get(
  "/",
  validate(productQuerySchema, "query"),
  listProducts,
);

// Get single product
router.get(
  "/:productId",
  validate(productParamsSchema, "params"),
  getProduct,
);

// Update product
router.patch(
  "/:productId",
  authenticate,
  authorize("VENDOR"),
  validate(productParamsSchema, "params"),
  validate(updateProductSchema, "body"),
  updateProduct,
);

// Deactivate product
router.delete(
  "/:productId",
  authenticate,
  authorize("VENDOR"),
  validate(productParamsSchema, "params"),
  deactivateProduct,
);

// Upload product media

// Upload product media

router.post(
  "/:productId/media",
  authenticate,
  authorize("VENDOR"),
  validate(productParamsSchema, "params"),
  uploadProductMedia.single("file"),
  validateProductMediaSize,
  authenticatedHandler(uploadMedia),
);

// Set primary image

router.patch(
  "/:productId/media/:mediaId/primary",
  authenticate,
  authorize("VENDOR"),
  validate(productMediaParamsSchema, "params"),
  authenticatedHandler(setPrimaryImage),
);

// Delete product media

router.delete(
  "/:productId/media/:mediaId",
  authenticate,
  authorize("VENDOR"),
  validate(productMediaParamsSchema, "params"),
  authenticatedHandler(deleteMedia),
);