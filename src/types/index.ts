// ============================================================
// ChefZone — Shared TypeScript Types
// ============================================================

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  profilePicture?: string;
  bio?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Ingredient {
  id?: string;
  name: string;
  quantity: string;
  unit?: string;
}

export interface RecipeStep {
  order: number;
  description: string;
}

export interface Author {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  image: string;
  category: Category;
  author: Author;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  likesCount: number;
  isLiked?: boolean;
  publishedAt: string;
  updatedAt?: string;
  cookingTime?: number;    // minutes
  servings?: number;
}

export interface RecipeCardData {
  id: string;
  title: string;
  image: string;
  category: Category;
  author: Author;
  likesCount: number;
  isLiked?: boolean;
  publishedAt: string;
  cookingTime?: number;
}

// ---- API Payloads ----

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  age: number;
  username: string;
  email: string;
  password: string;
}

export interface RecipeFormPayload {
  title: string;
  description?: string;
  image: string;
  categoryId: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  cookingTime?: number;
  servings?: number;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  age?: number;
  username?: string;
  profilePicture?: string;
  bio?: string;
}

// ---- API Responses ----

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

// ---- Filters ----

export interface RecipeFilters {
  search?: string;
  categoryId?: string;
  page?: number;
  perPage?: number;
}

// ---- Auth state ----

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
