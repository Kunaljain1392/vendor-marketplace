import { Router } from "express";
import { ProfileController } from "./profile.controller.js";
import { authenticateJWT } from "../../middleware/auth.middleware.js";


const router = Router();
const profileController = new ProfileController();

router.get("/", authenticateJWT, profileController.getProfile.bind(ProfileController))

router.patch("/", authenticateJWT, profileController.updateProfile.bind(ProfileController))

export default router;