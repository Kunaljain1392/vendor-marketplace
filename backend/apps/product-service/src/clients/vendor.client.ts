import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

interface VendorResponse {
  id: string;
  userId: string;
  businessName: string;
  description: string | null;
  businessAddress: string | null;
  status: string;
}

interface VendorApiResponse {
  success: boolean;
  data: VendorResponse;
}

export const getVendorByUserId = async (
  userId: string,
  accessToken: string,
): Promise<VendorResponse> => {
  const response = await fetch(
    `${env.VENDOR_SERVICE_URL}/internal/by-user/${userId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
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

  const result =
    (await response.json()) as VendorApiResponse;

  return result.data;
};