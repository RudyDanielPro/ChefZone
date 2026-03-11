import request from "./api";
import type { AuthResponse, LoginPayload, RegistroPayload } from "@/types";

export const login = (payload: LoginPayload): Promise<AuthResponse> => {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  }, false);
};

export const registro = (payload: RegistroPayload): Promise<AuthResponse> => {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  }, false);
};