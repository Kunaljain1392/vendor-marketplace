import { Router } from "express";

const router = Router();

// health check route
router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "auth-service",
    status: "healthy",
  });
});

export default router;