// ============================================================
// ChefZone — Authentication Context (CORREGIDO)
// ============================================================
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Usuario, LoginPayload, RegistroPayload } from "@/types";
import { login, registro } from "@/services/auth";
import { getToken, saveToken, removeToken } from "@/services/api";

interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  autenticado: boolean;
  cargando: boolean;
  iniciarSesion: (payload: LoginPayload) => Promise<void>;
  registrarse: (payload: RegistroPayload) => Promise<void>;
  cerrarSesion: () => void;
  actualizarUsuario: (usuario: Usuario) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Función para normalizar usuario (unificar foto?.ruta, fotoPerfil, profilePicture)
const normalizarUsuario = (user: any): Usuario => {
  const fotoUrl = user.foto?.ruta || user.fotoPerfil || user.profilePicture || null;

  return {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    usuario: user.usuario,
    rol: user.rol || "USER",
    foto: fotoUrl ? { ruta: fotoUrl } : undefined,
    profilePicture: fotoUrl,
    // ✅ ESTO ES LO QUE FALTA:
    recetasCount: user.recetasCount || 0,
    likesCount: user.likesCount || 0,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const restaurarSesion = async () => {
      const tokenGuardado = getToken();
      const usuarioGuardado = localStorage.getItem("usuario");

      if (tokenGuardado && usuarioGuardado) {
        try {
          const usuarioParseado = JSON.parse(usuarioGuardado);
          setUsuario(usuarioParseado);
          setToken(tokenGuardado);
          setAutenticado(true);
        } catch (error) {
          console.error("Error al restaurar sesión:", error);
          removeToken();
        }
      }
      setCargando(false);
    };

    restaurarSesion();
  }, []);

  const iniciarSesion = useCallback(async (payload: LoginPayload) => {
    try {
      console.log("Iniciando sesión...");
      const { user, token } = await login(payload);
      console.log("Usuario recibido del login:", user);

      const usuarioNormalizado = normalizarUsuario(user);
      console.log("Usuario normalizado:", usuarioNormalizado);
      console.log("Rol del usuario:", usuarioNormalizado.rol);

      saveToken(token);
      localStorage.setItem("usuario", JSON.stringify(usuarioNormalizado));
      setUsuario(usuarioNormalizado);
      setToken(token);
      setAutenticado(true);
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  }, []);

  const registrarse = useCallback(async (payload: RegistroPayload) => {
    try {
      const { user, token } = await registro(payload);
      const usuarioNormalizado = normalizarUsuario(user);
      saveToken(token);
      localStorage.setItem("usuario", JSON.stringify(usuarioNormalizado));
      setUsuario(usuarioNormalizado);
      setToken(token);
      setAutenticado(true);
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  }, []);

  const cerrarSesion = useCallback(() => {
    removeToken();
    setUsuario(null);
    setToken(null);
    setAutenticado(false);
  }, []);

  const actualizarUsuario = useCallback((usuarioActualizado: Usuario) => {
    localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
    setUsuario(usuarioActualizado);
  }, []);

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      autenticado,
      cargando,
      iniciarSesion,
      registrarse,
      cerrarSesion,
      actualizarUsuario
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
};