import { AppError } from "./app-error";

export const getProductIdParam = (
  value: string | string[],
): string => {
  if (Array.isArray(value)) {
    throw new AppError(
      "Invalid product ID",
      400,
    );
  }

  return value;
};

export const getRequestParam = (
  value: string | string[],
  message = "Invalid request parameter",
): string => {
  if (Array.isArray(value)) {
    throw new AppError(message, 400);
  }

  return value;
};