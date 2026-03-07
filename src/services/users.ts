// ============================================================
// ChefZone — User Service
// ============================================================
import request from "./api";
import type { User, UpdateProfilePayload } from "@/types";

/**
 * Fetch a user's public profile by ID.
 */
export const getUserProfile = (userId: string): Promise<User> => {
  return request(`/users/${userId}`);
};

/**
 * Update the current user's profile (auth required).
 */
export const updateMyProfile = (payload: UpdateProfilePayload): Promise<User> => {
  return request("/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};
