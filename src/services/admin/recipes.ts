import request from "../api";

export const obtenerTodasRecetas = ({ pagina = 1, busqueda = "" }) => {
  const params = new URLSearchParams();
  params.set("pagina", String(pagina));
  if (busqueda) params.set("busqueda", busqueda);
  
  return request(`/recetas?${params.toString()}`);
};

export const eliminarReceta = (recetaId: number) => {
  return request(`/recetas/${recetaId}`, { method: "DELETE" });
};