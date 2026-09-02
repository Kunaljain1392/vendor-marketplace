import { UploadApiResponse } from "cloudinary";

import { cloudinary } from "../config/cloudinary";
import { AppError } from "../utils/app-error";



export const uploadProductMedia = (
  buffer: Buffer,
  resourceType: "image" | "video",
  productId: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `vendor-marketplace/products/${productId}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error || !result) {
          reject(
            new AppError(
              "Failed to upload media",
              500,
            ),
          );
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
};

export const deleteProductMedia = (
  publicId: string,
  resourceType: "image" | "video",
): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          reject(
            new AppError(
              "Failed to delete media",
              500,
            ),
          );
          return;
        }

        if (result.result !== "ok" && result.result !== "not found") {
          reject(
            new AppError(
              "Failed to delete media",
              500,
            ),
          );
          return;
        }

        resolve();
      },
    );
  });
};