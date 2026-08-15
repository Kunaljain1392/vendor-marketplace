import type { Request, Response, NextFunction } from "express";
import { ProfileService } from "./profile.service.js";
import {
  updateProfileSchema,
  type UpdateProfileDto,
} from "./dto/update-profile.dto.js";

const profileService = new ProfileService();

export class ProfileController {
  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user.userId;
      

      const profile = await profileService.getProfile(userId);

      if (!profile) {
        res.status(404).json({
          message: "Profile not found",
        });
        return;
      }

      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user.userId;

      const data : UpdateProfileDto = updateProfileSchema.parse(req.body)

      const profile = await profileService.updateProfile(userId, data);

      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  }
}
