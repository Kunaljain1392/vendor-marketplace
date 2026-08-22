export type AuthUser = {
  userId: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
};