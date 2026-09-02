import { env } from "../config/env";
import { AppError } from "../utils/app-error";

export interface Vendor {
  id: string;
  userId: string;
  status: string;
}

export const getVendorByUserId = async (
  userId: string,
): Promise<Vendor> => {
  const response = await fetch(
    `${env.VENDOR_SERVICE_URL}/internal/vendors/user/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (response.status === 404) {
    throw new AppError(
      "Vendor profile not found",
      404,
    );
  }

  if (!response.ok) {
    throw new AppError(
      "Vendor service unavailable",
      503,
    );
  }

  return (await response.json()) as Vendor;
};