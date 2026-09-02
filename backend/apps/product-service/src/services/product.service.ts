import type { Repository } from "typeorm";

import { AppDataSource } from "../config/database.js";
import { Product } from "../entities/product.entity.js";
import { ProductStatus } from "../entities/enum/product-status.enum.js";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/app-error.js";
import { env } from "../config/env.js";
import {
  publishProductCreated,
  publishProductUpdated,
  publishProductStatusChanged,
} from "../events/product.publisher.js";

interface CreateProductData {
  vendorId: string;
  name: string;
  description?: string;
  category: string;
  price: number;
}

interface UpdateProductData {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
}

export class ProductService {
  private readonly productRepository: Repository<Product>;

  constructor() {
    this.productRepository =
      AppDataSource.getRepository(Product);
  }

  private getPrimaryImageUrl(
  product: Product,
): string | null {
  const primaryImage = product.media?.find(
    (media) => media.isPrimary,
  );

  return (
    primaryImage?.url ??
    env.DEFAULT_PRODUCT_IMAGE_URL ??
    null
  );
}

  async createProduct(
    data: CreateProductData,
  ): Promise<Product> {
    const existingProduct =
      await this.productRepository.findOne({
        where: {
          vendorId: data.vendorId,
          name: data.name,
        },
      });

    if (existingProduct) {
      throw new AppError(
        "A product with this name already exists",
        409,
      );
    }

    const product =
      this.productRepository.create({
        vendorId: data.vendorId,
        name: data.name,
        description: data.description ?? null,
        category: data.category,
        price: data.price.toFixed(2),
        status: ProductStatus.ACTIVE,
      });

    const savedProduct =
      await this.productRepository.save(product);

    logger.info(
      {
        productId: savedProduct.id,
        vendorId: savedProduct.vendorId,
      },
      "Product created",
    );

    try {
      await publishProductCreated({
        productId: savedProduct.id,
        vendorId: savedProduct.vendorId,
        name: savedProduct.name,
        category: savedProduct.category,
        price: savedProduct.price,
      });
    } catch (error) {
      logger.error(
        {
          error,
          productId: savedProduct.id,
        },
        "Failed to publish product.created event",
      );
    }

    return savedProduct;
  }

  async getProductById(
    productId: string,
  ): Promise<Product & {primaryImage: string | null}> {
    const product =
      await this.productRepository.findOne({
        where: {
          id: productId,
        },
        relations: {
          media: true,
        },
      });

    if (!product) {
      throw new AppError(
        "Product not found",
        404,
      );
    }

    return {
      ...product,
      primaryImage: this.getPrimaryImageUrl(product),
    };
  }

  async updateProduct(
    productId: string,
    vendorId: string,
    data: UpdateProductData,
  ): Promise<Product> {
    const product =
      await this.productRepository.findOne({
        where: {
          id: productId,
        },
      });

    if (!product) {
      throw new AppError(
        "Product not found",
        404,
      );
    }

    if (product.vendorId !== vendorId) {
      logger.warn(
        {
          productId,
          vendorId,
          ownerVendorId: product.vendorId,
        },
        "Unauthorized product modification attempt",
      );

      throw new AppError(
        "You are not allowed to modify this product",
        403,
      );
    }

    if (data.name !== undefined) {
      const duplicateProduct =
        await this.productRepository.findOne({
          where: {
            vendorId,
            name: data.name,
          },
        });

      if (
        duplicateProduct &&
        duplicateProduct.id !== product.id
      ) {
        throw new AppError(
          "A product with this name already exists",
          409,
        );
      }

      product.name = data.name;
    }

    if (data.description !== undefined) {
      product.description = data.description;
    }

    if (data.category !== undefined) {
      product.category = data.category;
    }

    if (data.price !== undefined) {
      product.price = data.price.toFixed(2);
    }

    const updatedProduct =
      await this.productRepository.save(product);

    logger.info(
      {
        productId: updatedProduct.id,
        vendorId: updatedProduct.vendorId,
      },
      "Product updated",
    );

    try {
      await publishProductUpdated({
        productId: updatedProduct.id,
        vendorId: updatedProduct.vendorId,
        name: updatedProduct.name,
        category: updatedProduct.category,
        price: updatedProduct.price,
      });
    } catch (error) {
      logger.error(
        {
          error,
          productId: updatedProduct.id,
        },
        "Failed to publish product.updated event",
      );
    }

    return updatedProduct;
  }

  async deactivateProduct(
    productId: string,
    vendorId: string,
  ): Promise<Product> {
    const product =
      await this.productRepository.findOne({
        where: {
          id: productId,
        },
      });

    if (!product) {
      throw new AppError(
        "Product not found",
        404,
      );
    }

    if (product.vendorId !== vendorId) {
      logger.warn(
        {
          productId,
          vendorId,
          ownerVendorId: product.vendorId,
        },
        "Unauthorized product deactivation attempt",
      );

      throw new AppError(
        "You are not allowed to modify this product",
        403,
      );
    }

    if (
      product.status === ProductStatus.INACTIVE
    ) {
      return product;
    }

    product.status =
      ProductStatus.INACTIVE;

    const updatedProduct =
      await this.productRepository.save(product);

    logger.info(
      {
        productId: updatedProduct.id,
        vendorId: updatedProduct.vendorId,
        status: updatedProduct.status,
      },
      "Product status changed",
    );

    try {
      await publishProductStatusChanged({
        productId: updatedProduct.id,
        vendorId: updatedProduct.vendorId,
        status: updatedProduct.status,
      });
    } catch (error) {
      logger.error(
        {
          error,
          productId: updatedProduct.id,
        },
        "Failed to publish product.status_changed event",
      );
    }

    return updatedProduct;
  }

  async listProducts(
    page: number,
    limit: number,
    category?: string,
    status?: ProductStatus,
  ) {
    const queryBuilder =
      this.productRepository
        .createQueryBuilder("product")
        .leftJoinAndSelect(
          "product.media",
          "media",
        )
        .orderBy(
          "product.createdAt",
          "DESC",
        )
        .skip((page - 1) * limit)
        .take(limit);

    if (category) {
      queryBuilder.andWhere(
        "product.category = :category",
        { category },
      );
    }

    if (status) {
      queryBuilder.andWhere(
        "product.status = :status",
        { status },
      );
    }

    const [products, total] =
  await queryBuilder.getManyAndCount();

const productsWithPrimaryImage =
  products.map((product) => ({
    ...product,
    primaryImage:
      this.getPrimaryImageUrl(product),
  }));

return {
  products: productsWithPrimaryImage,
  pagination: {
    page,
    limit,
    total,
    totalPages:
      Math.ceil(total / limit),
  },
};
  }

  async verifyProductOwnership(
  productId: string,
  vendorId: string,
): Promise<void> {
  const product = await this.productRepository.findOne({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (product.vendorId !== vendorId) {
    throw new AppError(
      "You are not allowed to modify this product",
      403,
    );
  }
}
}