import { Router } from "express";

import { inventoryController } from "../controllers/inventory.controllers.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", (req, res, next) =>
  inventoryController.create(req, res, next),
);

router.get("/:productId", (req, res, next) =>
  inventoryController.get(req, res, next),
);

router.patch("/:productId", (req, res, next) =>
  inventoryController.update(req, res, next),
);

export default router;