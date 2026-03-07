// ============================================================
// ChefZone — Recipe Service
// ============================================================
import request from "./api";
import type {
  Recipe,
  RecipeCardData,
  RecipeFormPayload,
  PaginatedResponse,
  RecipeFilters,
} from "@/types";

/**
 * Fetch paginated recipes with optional search/category filters.
 */
export const getRecipes = (filters: RecipeFilters = {}): Promise<PaginatedResponse<RecipeCardData>> => {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  params.set("page", String(filters.page ?? 1));
  params.set("perPage", String(filters.perPage ?? 12));

  return request(`/recipes?${params.toString()}`);
};

/**
 * Fetch a single recipe by ID.
 */
export const getRecipeById = (id: string): Promise<Recipe> => {
  return request(`/recipes/${id}`);
};

/**
 * Get related recipes by recipe ID.
 */
export const getRelatedRecipes = (id: string): Promise<RecipeCardData[]> => {
  return request(`/recipes/${id}/related`);
};

/**
 * Create a new recipe (auth required).
 */
export const createRecipe = (payload: RecipeFormPayload): Promise<Recipe> => {
  return request("/recipes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/**
 * Update an existing recipe (auth required).
 */
export const updateRecipe = (id: string, payload: RecipeFormPayload): Promise<Recipe> => {
  return request(`/recipes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

/**
 * Delete a recipe (auth required).
 */
export const deleteRecipe = (id: string): Promise<void> => {
  return request(`/recipes/${id}`, { method: "DELETE" });
};

/**
 * Toggle like on a recipe (auth required).
 * Returns updated like count and new isLiked state.
 */
export const toggleLike = (id: string): Promise<{ likesCount: number; isLiked: boolean }> => {
  return request(`/recipes/${id}/like`, { method: "POST" });
};

/**
 * Get recipes authored by a specific user.
 */
export const getUserRecipes = (userId: string): Promise<RecipeCardData[]> => {
  return request(`/users/${userId}/recipes`);
};

/**
 * Get recipes liked by the current authenticated user.
 */
export const getFavoriteRecipes = (): Promise<RecipeCardData[]> => {
  return request("/users/me/favorites");
};
