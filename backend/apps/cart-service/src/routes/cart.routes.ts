import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import { cartController } from "../controllers/cart.controllers.js";

const router = Router();

router.use(authenticate);

router.get("/", (req, res) =>
  cartController.getCart(req, res),
);

router.post("/items", (req, res) =>
  cartController.addItem(req, res),
);

router.patch("/items/:productId", (req, res) =>
  cartController.updateItem(req, res),
);

router.delete("/items/:productId", (req, res) =>
  cartController.removeItem(req, res),
);

router.delete("/", (req, res) =>
  cartController.clearCart(req, res),
);

export default router;