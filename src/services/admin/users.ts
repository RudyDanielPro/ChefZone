import request from "../api";

export const obtenerTodosUsuarios = ({ pagina = 1, busqueda = "" }) => {
  const params = new URLSearchParams();
  params.set("pagina", String(pagina));
  if (busqueda) params.set("busqueda", busqueda);
  
  return request(`/usuarios?${params.toString()}`);
};

export const eliminarUsuario = (usuarioId: number) => {
  return request(`/usuarios/${usuarioId}`, { method: "DELETE" });
};

export const registrarUsuarioPorAdmin = (datosUsuario) => {
  return request(`/usuarios/registro-admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datosUsuario),
  });
};

// CORRECCIÓN: Asegurar que el PUT envíe el Content-Type

export const actualizarRol = (usuarioId, rol) => {
  return request(`/usuarios/${usuarioId}/rol`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json" // <--- CRÍTICO
    },
    body: JSON.stringify({ rol })
  });
};