// ============================================================
// ChefZone — Categorias Service (ESPAÑOL)
// ============================================================
import request from "./api";
import type { Categoria } from "@/types";

export const obtenerCategorias = (): Promise<Categoria[]> => {
  return request<Categoria[]>("/categorias", {}, false);
};