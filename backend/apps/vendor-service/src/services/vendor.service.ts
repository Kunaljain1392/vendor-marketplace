import { AppDataSource } from "../config/database.js";
import {
  Vendor,
  VendorStatus,
} from "../entities/vendor.entity.js";
import type {
  CreateVendorInput,
  UpdateVendorInput,
} from "../schemas/vendor.schema.js";
import { publishVendorCreated } from "../events/vendor.events.js";

const vendorRepository = AppDataSource.getRepository(Vendor);

export class VendorService {
async createVendor(
  userId: string,
  role: string,
  data: CreateVendorInput,
): Promise<Vendor> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (role !== "VENDOR") {
    throw new Error("Only vendors can create a vendor profile");
  }

  const existingVendor = await vendorRepository.findOne({
    where: { userId },
  });

  if (existingVendor) {
    throw new Error("Vendor profile already exists");
  }

  const vendor = vendorRepository.create({
    userId,
    businessName: data.businessName,
    description: data.description ?? null,
    businessAddress: data.businessAddress ?? null,
    status: VendorStatus.ACTIVE,
  });

  const savedVendor = await vendorRepository.save(vendor);

  publishVendorCreated(
    savedVendor.userId,
    savedVendor.id,
  );

  return savedVendor;
}
  

  async getMyVendor(userId: string): Promise<Vendor> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const vendor = await vendorRepository.findOne({
      where: { userId },
    });

    if (!vendor) {
      throw new Error("Vendor profile not found");
    }

    return vendor;
  }

async getVendorByUserId(
  userId: string,
): Promise<Vendor> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const vendor = await vendorRepository.findOne({
    where: { userId },
  });

  if (!vendor) {
    throw new Error("Vendor profile not found");
  }

  return vendor;
}

  async updateMyVendor(
    userId: string,
    data: UpdateVendorInput,
  ): Promise<Vendor> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required");
    }

    const vendor = await vendorRepository.findOne({
      where: { userId },
    });

    if (!vendor) {
      throw new Error("Vendor profile not found");
    }

    if (data.businessName !== undefined) {
      vendor.businessName = data.businessName;
    }

    if (data.description !== undefined) {
      vendor.description = data.description;
    }

    if (data.businessAddress !== undefined) {
      vendor.businessAddress = data.businessAddress;
    }

    return vendorRepository.save(vendor);
  }
}

export const vendorService = new VendorService();