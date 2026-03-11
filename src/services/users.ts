import request from "./api";
import type { Usuario } from "@/types";

export const getUserProfile = (userId: number): Promise<Usuario> => {
  return request(`/usuarios/${userId}`);
};

export const getCurrentUserProfile = (): Promise<Usuario> => {
  return request("/usuarios/perfil");
};

export const updateMyProfile = (userId: number, payload: {
  nombre?: string;
  apellido?: string;
  usuario?: string;
  bio?: string;
  profilePicture?: string;
}): Promise<Usuario> => {
  const backendPayload: Record<string, any> = {};
  if (payload.nombre) backendPayload.nombre = payload.nombre;
  if (payload.apellido) backendPayload.apellido = payload.apellido;
  if (payload.usuario) backendPayload.usuario = payload.usuario;
  if (payload.bio) backendPayload.bio = payload.bio;
  
  return request(`/usuarios/${userId}`, {
    method: "PUT",
    body: JSON.stringify(backendPayload),
  });
};

export const uploadProfilePhoto = (userId: number, file: File): Promise<Usuario> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return request(`/usuarios/${userId}/foto`, {
    method: "POST",
    body: formData,
    headers: {}
  });
};

export const deleteProfilePhoto = (userId: number): Promise<void> => {
  return request(`/usuarios/${userId}/foto`, { method: "DELETE" });
};