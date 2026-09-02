import { Router } from "express";

import { authenticate } from "../middlewares/auth.middleware.js";

import {
  createVendor,
  getMyVendor,
  updateMyVendor,
  getVendorByUserId,
} from "../controllers/vendor.controller.js";

const router = Router();

router.post("/", authenticate, createVendor);

router.get("/me", authenticate, getMyVendor);

router.patch("/me", authenticate, updateMyVendor);

router.get(
  "/internal/by-user/:userId",
  // INTERNAL SERVICE AUTH MIDDLEWARE
  getVendorByUserId,
);

export default router;