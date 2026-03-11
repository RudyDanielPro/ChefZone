// ============================================================
// ChefZone — Recetas Service (ESPAÑOL)
// ============================================================
import request from "./api";
import type { Receta, RecetaPayload, RecetaResumen, PaginatedResponse } from "@/types";

export const obtenerRecetas = (params?: {
  busqueda?: string;
  categoriaId?: number;
  pagina?: number;
  porPagina?: number;
}): Promise<PaginatedResponse<RecetaResumen>> => {
  const queryParams = new URLSearchParams();
  if (params?.busqueda) queryParams.set("busqueda", params.busqueda);
  if (params?.categoriaId) queryParams.set("categoriaId", String(params.categoriaId));
  if (params?.pagina) queryParams.set("pagina", String(params.pagina));
  if (params?.porPagina) queryParams.set("porPagina", String(params.porPagina));

  return request(`/recetas?${queryParams.toString()}`);
};

export const obtenerRecetaPorId = (id: number): Promise<Receta> => {
  return request(`/recetas/${id}`);
};

export const crearReceta = (payload: RecetaPayload): Promise<Receta> => {
  return request("/recetas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const actualizarReceta = (id: number, payload: RecetaPayload): Promise<Receta> => {
  return request(`/recetas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const eliminarReceta = (id: number): Promise<void> => {
  return request(`/recetas/${id}`, { method: "DELETE" });
};


export const darLike = (id: number): Promise<{ liked: boolean; cantidadLikes: number }> => {
  return request(`/recetas/${id}/like`, {
    method: "POST",
  });
};

export const obtenerRecetasDeUsuario = (usuarioId: number): Promise<RecetaResumen[]> => {
  return request(`/usuarios/${usuarioId}/recetas`);
};

export const obtenerRecetasRelacionadas = (id: number): Promise<RecetaResumen[]> => {
  return request(`/recetas/${id}`);
};

export const subirImagenReceta = (recetaId: number, file: File): Promise<Receta> => {
  const formData = new FormData();
  formData.append('file', file);

  return request(`/recetas/${recetaId}/foto`, {
    method: "POST",
    body: formData,
    headers: {}
  });
};
