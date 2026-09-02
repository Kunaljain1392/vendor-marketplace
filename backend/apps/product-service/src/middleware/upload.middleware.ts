import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
]);

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const multerUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_VIDEO_SIZE,
  },

  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(
        new AppError(
          "Only JPEG, PNG, WebP, MP4 and WebM files are allowed",
          400,
        ),
      );
      return;
    }

    callback(null, true);
  },
});

export const uploadProductMedia = {
  single: (fieldName: string) =>
    multerUpload.single(fieldName) as unknown as (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => void,
};

export const validateProductMediaSize = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const file = req.file;

  if (!file) {
    next(
      new AppError(
        "Media file is required",
        400,
      ),
    );
    return;
  }

  const isVideo =
    file.mimetype.startsWith("video/");

  if (
    !isVideo &&
    file.size > MAX_IMAGE_SIZE
  ) {
    next(
      new AppError(
        "Image size cannot exceed 10 MB",
        400,
      ),
    );
    return;
  }

  if (
    isVideo &&
    file.size > MAX_VIDEO_SIZE
  ) {
    next(
      new AppError(
        "Video size cannot exceed 100 MB",
        400,
      ),
    );
    return;
  }

  next();
};