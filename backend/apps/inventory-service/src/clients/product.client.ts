import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";

interface ProductResponse {
  id: string;
  vendorId: string;
  name: string;
  price: string | number;
  status: string;
}

export const getProduct = async (
  productId: string,
  token: string,
): Promise<ProductResponse> => {
  let response: Response;

  try {
    response = await fetch(
      `${env.PRODUCT_SERVICE_URL}/products/${productId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(5000),
      },
    );
  } catch {
    throw new AppError(503, "Product Service unavailable");
  }

  if (response.status === 404) {
    throw new AppError(404, "Product not found");
  }

  if (!response.ok) {
    throw new AppError(503, "Product Service unavailable");
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new AppError(503, "Invalid Product Service response");
  }

  if (
    typeof data !== "object" ||
    data === null ||
    typeof (data as ProductResponse).id !== "string" ||
    typeof (data as ProductResponse).vendorId !== "string" ||
    typeof (data as ProductResponse).name !== "string" ||
    (typeof (data as ProductResponse).price !== "string" &&
      typeof (data as ProductResponse).price !== "number") ||
    typeof (data as ProductResponse).status !== "string"
  ) {
    throw new AppError(503, "Invalid Product Service response");
  }

  return data as ProductResponse;
};