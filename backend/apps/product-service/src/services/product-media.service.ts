import { Repository } from "typeorm";

import { AppDataSource } from "../config/database";
import { ProductMedia } from "../entities/product-media.entity";
import { ProductMediaType } from "../entities/enum/product-media-type.enum";
import { AppError } from "../utils/app-error";
import { Product } from "../entities/product.entity";
import { deleteProductMedia } from "./cloudinary.service";

export class ProductMediaService {
  private readonly mediaRepository: Repository<ProductMedia>;

  private readonly productRepository: Repository<Product>;

  constructor() {
    this.mediaRepository = AppDataSource.getRepository(ProductMedia);

    this.productRepository =
    AppDataSource.getRepository(Product);
  }

  async addMedia(
  productId: string,
  type: ProductMediaType,
  url: string,
  publicId: string,
): Promise<ProductMedia> {
  const product = await this.productRepository.findOne({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const media = await this.mediaRepository.find({
    where: { productId },
  });

  const images = media.filter(
    (item) => item.type === ProductMediaType.IMAGE,
  );

  const videos = media.filter(
    (item) => item.type === ProductMediaType.VIDEO,
  );

  if (
    type === ProductMediaType.IMAGE &&
    images.length >= 5
  ) {
    throw new AppError(
      "A product can have a maximum of 5 images",
      400,
    );
  }

  if (
    type === ProductMediaType.VIDEO &&
    videos.length >= 1
  ) {
    throw new AppError(
      "A product can have only one demo video",
      400,
    );
  }

  const isPrimary =
    type === ProductMediaType.IMAGE &&
    images.length === 0;

  const productMedia = this.mediaRepository.create({
    productId,
    type,
    url,
    publicId,
    isPrimary,
  });

  return this.mediaRepository.save(productMedia);
}

  async setPrimaryImage(productId: string, mediaId: string): Promise<void> {
    const media = await this.mediaRepository.findOne({
      where: {
        id: mediaId,
        productId,
      },
    });

    if (!media) {
      throw new AppError("Media not found", 404);
    }

    if (media.type !== ProductMediaType.IMAGE) {
      throw new AppError("Only an image can be the primary media", 400);
    }

    await this.mediaRepository.update(
      {
        productId,
        type: ProductMediaType.IMAGE,
      },
      {
        isPrimary: false,
      },
    );

    await this.mediaRepository.update(
      {
        id: mediaId,
        productId,
      },
      {
        isPrimary: true,
      },
    );
  }

  async deleteMedia(productId: string, mediaId: string): Promise<void> {
    const media = await this.mediaRepository.findOne({
      where: {
        id: mediaId,
        productId,
      },
    });

    if (!media) {
      throw new AppError("Media not found", 404);
    }

    await deleteProductMedia(
    media.publicId,
    media.type === ProductMediaType.VIDEO
      ? "video"
      : "image",
  );

    await this.mediaRepository.remove(media);

    if (media.type === ProductMediaType.IMAGE && media.isPrimary) {
      const nextImage = await this.mediaRepository.findOne({
        where: {
          productId,
          type: ProductMediaType.IMAGE,
        },
        order: {
          createdAt: "ASC",
        },
      });

      if (nextImage) {
        nextImage.isPrimary = true;

        await this.mediaRepository.save(nextImage);
      }
    }
  }
}

export const productMediaService =
  new ProductMediaService();