import { prisma } from "../../config/prisma.js";
import type { UpdateProfileDto } from "./dto/update-profile.dto.js";
import { publishEvent } from "../../events/publisher.js";
import { EXCHANGES } from "../../constants/rabbitmq.constants.js";

export class ProfileService {
  async getProfile(userId: string) {
    return prisma.userProfile.findUnique({
      where: { userId },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: dto,
    });

    await publishEvent(
      EXCHANGES.USER,
      "user.profile.updated",
      {
        userId,
      },
    );

    return updatedProfile;
  }
}