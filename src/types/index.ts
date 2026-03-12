// ============================================================
// ChefZone — Tipos (DEFINITIVOS - BASADO EN BACKEND REAL)
// ============================================================

// ===== USUARIOS =====
export interface Usuario {
  id: number; // o string, según tu backend
  nombre: string;
  apellido: string;
  email: string;
  usuario: string;
  rol: string;
  foto?: { ruta: string };
  profilePicture?: string;
  recetasCount?: number; // 👈 Añadir esto
  likesCount?: number;   // 👈 Añadir esto
}


export interface RegistroPayload {
  nombre: string;           // ✅ SOLO estos campos (sin edad)
  apellido: string;
  email: string;
  usuario: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ActualizarPerfilPayload {
  nombre?: string;
  apellido?: string;
  email?: string;
  usuario?: string;
  bio?: string;
}

export interface AuthResponse {
  token: string;
  user: Usuario;
}

// ===== CATEGORÍAS =====
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

// ===== RECETAS =====
export interface Receta {
  id: number;
  titulo: string;
  descripcion?: string;
  instrucciones: string;
  ingredientes: string;
  categoria: Categoria;
  usuario: Usuario;
  foto?: {
    ruta: string;
  };
  // Propiedades que vienen del DTO RecipeResponse
  imagenUrl?: string;          // URL plana de Cloudinary
  cantidadLikes: number;       // Match con el backend
  likedByCurrentUser: boolean; // Match con el backend (antes isLiked)
}

export interface RecetaResumen {
  id: number;
  titulo: string;
  descripcionCorta?: string;   // Match con RecipeSummaryResponse
  imagenUrl?: string;          // Match con RecipeSummaryResponse
  categoriaNombre: string;     // Match con RecipeSummaryResponse
  autorNombre: string;         // Match con RecipeSummaryResponse
  autorFoto?: string;
  cantidadLikes: number;       // Match con RecipeSummaryResponse
  likedByCurrentUser: boolean; // Match con RecipeSummaryResponse
}

export interface RecetaPayload {
  titulo: string;
  descripcion?: string;
  instrucciones: string;
  ingredientes: string;
  categoriaId: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}