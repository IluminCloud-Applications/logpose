import { getCookie, removeCookie } from "@/lib/cookies";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

/** Evita múltiplos redirects simultâneos de 401 */
let isRedirecting = false;

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const token = getCookie("access_token");
  if (token) {
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    if (response.status === 401) {
      removeCookie("access_token");
      localStorage.removeItem("user");

      // Evitar loop infinito — só redireciona se não estiver já redirecionando
      // e se não estiver em /login ou /setup
      const currentPath = window.location.pathname;
      if (!isRedirecting && currentPath !== "/login" && currentPath !== "/setup") {
        isRedirecting = true;
        window.location.replace("/login");
      }

      throw new Error("Sessão expirada");
    }

    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

