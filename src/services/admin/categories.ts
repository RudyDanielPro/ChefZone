import request from "../api";

export const obtenerTodasCategorias = () => {
  return request("/categorias");
};

export const crearCategoria = (data: { nombre: string; descripcion?: string }) => {
  return request("/categorias", {
    method: "POST",
    body: JSON.stringify(data)
  });
};

export const actualizarCategoria = (id: number, data: { nombre: string; descripcion?: string }) => {
  return request(`/categorias/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
};

export const eliminarCategoria = (id: number) => {
  return request(`/categorias/${id}`, { method: "DELETE" });
};