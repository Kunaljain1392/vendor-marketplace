import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export interface ProductResponse {
  id: string;
  name: string;
  price: string | number;
  status: string;
}

export class ProductClient {
  async getProduct(
    productId: string,
    token: string,
  ): Promise<ProductResponse> {
    const url = `${env.services.productServiceUrl}/products/${productId}`;

    logger.info(
      {
        productId,
        url,
      },
      "Calling Product Service",
    );

    let response: Response;

    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      });
    } catch (error) {
      logger.error(
        {
          productId,
          error,
        },
        "Product Service request failed",
      );

      throw new Error("Product Service is unavailable");
    }

    logger.info(
      {
        productId,
        statusCode: response.status,
      },
      "Product Service response received",
    );

    if (response.status === 404) {
      logger.warn(
        { productId },
        "Product not found",
      );

      throw new Error("Product not found");
    }

    if (!response.ok) {
      logger.error(
        {
          productId,
          statusCode: response.status,
        },
        "Product Service returned an error",
      );

      throw new Error(
        `Product Service returned status ${response.status}`,
      );
    }

    let data: ProductResponse;

    try {
      data = (await response.json()) as ProductResponse;
    } catch (error) {
      logger.error(
        {
          productId,
          error,
        },
        "Failed to parse Product Service response",
      );

      throw new Error("Invalid response from Product Service");
    }

    if (
      !data.id ||
      !data.name ||
      data.price === undefined ||
      !data.status
    ) {
      logger.error(
        { productId },
        "Product Service returned an invalid product response",
      );

      throw new Error("Invalid response from Product Service");
    }

    if (data.status !== "ACTIVE") {
      logger.warn(
        {
          productId,
          status: data.status,
        },
        "Product is not active",
      );

      throw new Error("Product is not active");
    }

    logger.info(
      {
        productId,
      },
      "Product validated successfully",
    );

    return data;
  }
}

export const productClient = new ProductClient();