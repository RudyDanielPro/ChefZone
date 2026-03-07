// ============================================================
// ChefZone — Categories Service
// ============================================================
import request from "./api";
import type { Category } from "@/types";

/**
 * Fetch all available recipe categories.
 */
export const getCategories = (): Promise<Category[]> => {
  return request<Category[]>("/categories", {}, false);
};
