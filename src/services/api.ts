const BASE_URL ="https://chefzonebackend.onrender.com/api";

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const saveToken = (token: string): void => {
  localStorage.setItem("token", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
};

const buildHeaders = (includeAuth = true, isMultipart = false): HeadersInit => {
  const headers: Record<string, string> = {};
  
  // ✅ IMPORTANTE: Solo poner Content-Type si NO es multipart
  // El navegador pondrá el Content-Type correcto automáticamente para FormData
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  
  // ✅ Siempre aceptar JSON como respuesta
  headers["Accept"] = "application/json";
  
  // ✅ Añadir token si es necesario
  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log("🔑 Token añadido a headers:", token.substring(0, 20) + "...");
    } else {
      console.warn("⚠️ No hay token disponible para petición autenticada");
    }
  }
  
  return headers;
};

const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth = true
): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;
  
  // Detectar si es FormData
  const isMultipart = options.body instanceof FormData;
  
  const headers = buildHeaders(includeAuth, isMultipart);

  console.log(`📡 ${options.method || 'GET'} ${url}`, { 
    includeAuth, 
    isMultipart,
    hasToken: !!getToken() 
  });

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  };

  // Si es FormData, NO poner Content-Type (el navegador lo hará)
  if (isMultipart) {
    delete (fetchOptions.headers as any)['Content-Type'];
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    // Si es 403, es un problema de autenticación
    if (response.status === 403) {
      console.error("❌ Error 403: No autorizado. Verifica el token:", getToken()?.substring(0, 20) + "...");
    }
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
};

export default request;
export { BASE_URL };