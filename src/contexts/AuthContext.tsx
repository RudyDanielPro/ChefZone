// ============================================================
// ChefZone — Authentication Context
// Manages user session, JWT token, login/register/logout
// ============================================================
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, LoginPayload, RegisterPayload, AuthState } from "@/types";
import { loginUser, registerUser, getMe } from "@/services/auth";
import { getToken, saveToken, removeToken } from "@/services/api";

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  /**
   * On mount: attempt to restore session from localStorage.
   */
  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();
      if (!token) {
        setState(s => ({ ...s, isLoading: false }));
        return;
      }

      try {
        const { user } = await getMe();
        setState({ user, token, isAuthenticated: true, isLoading: false });
      } catch {
        // Token is invalid or expired — clear it
        removeToken();
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { user, token } = await loginUser(payload);
    saveToken(token);
    localStorage.setItem("chefzone_user", JSON.stringify(user));
    setState({ user, token, isAuthenticated: true, isLoading: false });
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user, token } = await registerUser(payload);
    saveToken(token);
    localStorage.setItem("chefzone_user", JSON.stringify(user));
    setState({ user, token, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((user: User) => {
    localStorage.setItem("chefzone_user", JSON.stringify(user));
    setState(s => ({ ...s, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access auth context.
 * Must be used inside <AuthProvider>.
 */
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
