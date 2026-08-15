import { prisma } from "../../config/prisma.js";
import type { UpdateProfileDto } from "./dto/update-profile.dto.js";


export class ProfileService {
    async getProfile(userId: string) {
        return prisma.userProfile.findUnique({
            where: {userId},
        });
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        return prisma.userProfile.update({
            where: {userId},
            data: dto,
        });
    }
}