export const EXCHANGES = {
  AUTH: "auth.events",
} as const;

export const ROUTING_KEYS = {
  USER_REGISTERED: "user.registered",
  USER_VERIFIED: "auth.user.verified",
  PASSWORD_CHANGED: "auth.password.changed",
  PASSWORD_RESET_REQUESTED: "password.reset.requested",
} as const;