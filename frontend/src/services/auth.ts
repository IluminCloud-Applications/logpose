import { apiRequest } from "./api";
import { setCookie, getCookie, removeCookie } from "@/lib/cookies";

interface SetupStatus {
  is_configured: boolean;
}

interface SetupData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "owner" | "admin" | "viewer";
  };
}

export async function checkSetupStatus(): Promise<SetupStatus> {
  return apiRequest<SetupStatus>("/setup/status");
}

export async function createAdmin(data: SetupData): Promise<{ message: string }> {
  return apiRequest("/setup", { method: "POST", body: data });
}

export async function loginUser(data: LoginData): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>("/login", {
    method: "POST",
    body: data,
  });

  setCookie("access_token", response.access_token, 30);
  localStorage.setItem("user", JSON.stringify(response.user));

  return response;
}

export function logout() {
  removeCookie("access_token");
  localStorage.removeItem("user");
}

export function getStoredUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
  return !!getCookie("access_token");
}
