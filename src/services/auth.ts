// ============================================================
// ChefZone — Auth Service
// ============================================================
import request from "./api";
import type { AuthResponse, LoginPayload, RegisterPayload } from "@/types";

/**
 * Log in with email and password.
 */
export const loginUser = (payload: LoginPayload): Promise<AuthResponse> => {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  }, false);
};

/**
 * Register a new user.
 */
export const registerUser = (payload: RegisterPayload): Promise<AuthResponse> => {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  }, false);
};

/**
 * Refresh session — useful on app load to validate existing token.
 */
export const getMe = (): Promise<{ user: import("@/types").User }> => {
  return request("/auth/me");
};
