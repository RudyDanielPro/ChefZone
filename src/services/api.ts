// ============================================================
// ChefZone — API Service
// Configured with base URL from env variable VITE_API_BASE_URL
// ============================================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

/**
 * Retrieves the JWT token from localStorage.
 */
export const getToken = (): string | null => {
  return localStorage.getItem("chefzone_token");
};

/**
 * Saves the JWT token to localStorage.
 */
export const saveToken = (token: string): void => {
  localStorage.setItem("chefzone_token", token);
};

/**
 * Removes the JWT token from localStorage.
 */
export const removeToken = (): void => {
  localStorage.removeItem("chefzone_token");
  localStorage.removeItem("chefzone_user");
};

/**
 * Builds default fetch headers, attaching Authorization if token exists.
 */
const buildHeaders = (includeAuth = true): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

/**
 * Generic fetch wrapper with error handling.
 */
const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth = true
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = buildHeaders(includeAuth);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // ignore parse error
    }
    throw new Error(errorMessage);
  }

  // 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
};

export default request;
export { BASE_URL };
