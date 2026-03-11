export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  usuario: string;           // 🔴 username en frontend, usuario en backend
  rol: string;               // 🔴 "ADMIN" o "USER"
  profilePicture?: string;   // 🔴 fotoPerfil en backend
  bio?: string;
  firstName?: string;        // Para compatibilidad (nombre)
  lastName?: string;         // Para compatibilidad (apellido)
  username?: string;         // Para compatibilidad (usuario)
}

export interface UpdateProfilePayload {
  firstName?: string;        // nombre
  lastName?: string;         // apellido
  username?: string;         // usuario
  email?: string;            // 🔴 SÍ existe
  bio?: string;
  profilePicture?: string;
}

// ===== AUTENTICACIÓN =====
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;         // nombre
  lastName: string;          // apellido
  age?: number;
  username: string;          // usuario
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ===== CATEGORÍAS =====
export interface Category {
  id: string;
  nombre: string;
  descripcion?: string;
  slug?: string;
  recetasCount?: number;
}

// ===== RECETAS =====
export interface Author {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit?: string;
}

export interface RecipeStep {
  order: number;
  description: string;
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
  cookingTime?: number;
  servings?: number;
  likesCount: number;
  isLiked?: boolean;
  publishedAt: string;
}

export interface RecipeCardData {
  id: string;
  title: string;
  image: string;
  description?: string;
  descriptionCorta?: string;
  category?: Category;
  categoriaNombre?: string;
  author?: Author;
  autorNombre?: string;
  cookingTime?: number;
  likesCount: number;
  isLiked?: boolean;
}

export interface RecipeFormPayload {
  title: string;
  description?: string;
  instructions?: string;     // 🔴 instrucciones en backend
  image?: string;
  categoryId: string;
  ingredients: Ingredient[];
  steps?: RecipeStep[];
  cookingTime?: number;
  servings?: number;
}

export interface RecipeFilters {
  search?: string;
  categoryId?: string;
  page?: number;
  perPage?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}