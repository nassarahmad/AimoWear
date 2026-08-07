import { getSessionUser, type AuthUser } from "./auth";

export type Role = "guest" | "user" | "admin";

export type Action =
  | "browse"
  | "addToCart"
  | "checkout"
  | "customStudio"
  | "writeReview"
  | "accessAdmin";

export function getCurrentUserRole(): Role {
  const user = getSessionUser();
  if (!user) return "guest";
  return user.role;
}

export function hasPermission(action: Action, user: AuthUser | null = getSessionUser()): boolean {
  const role: Role = user ? user.role : "guest";

  switch (action) {
    case "browse":
      return true; // Guest, User, Admin can browse everything
    case "addToCart":
    case "checkout":
    case "customStudio":
    case "writeReview":
      return role === "user" || role === "admin";
    case "accessAdmin":
      return role === "admin";
    default:
      return false;
  }
}
