import { apiRequest } from "./api";

export interface User {
  id: number;
  name: string;
  email: string | null;
  role: "owner" | "admin" | "viewer";
  status: "active" | "pending";
  invite_token: string | null;
  created_at: string | null;
}

export interface InviteInfo {
  name: string;
  role: string;
}

export async function fetchUsers(): Promise<User[]> {
  return apiRequest<User[]>("/users");
}

export async function createInvite(data: {
  name: string;
  role: string;
}): Promise<{ id: number; name: string; role: string; invite_token: string }> {
  return apiRequest("/users/invite", { method: "POST", body: data });
}

export async function updateUserRole(
  userId: number,
  role: string
): Promise<{ message: string }> {
  return apiRequest(`/users/${userId}/role`, {
    method: "PUT",
    body: { role },
  });
}

export async function resetUserPassword(
  userId: number,
  newPassword: string,
  confirmPassword: string
): Promise<{ message: string }> {
  return apiRequest(`/users/${userId}/reset-password`, {
    method: "PUT",
    body: { new_password: newPassword, confirm_password: confirmPassword },
  });
}

export async function deleteUser(
  userId: number
): Promise<{ message: string }> {
  return apiRequest(`/users/${userId}`, { method: "DELETE" });
}

export async function getInviteInfo(token: string): Promise<InviteInfo> {
  return apiRequest<InviteInfo>(`/setup/invite/${token}`);
}

export async function completeInvite(
  token: string,
  data: { email: string; password: string; confirm_password: string }
): Promise<{ message: string }> {
  return apiRequest(`/setup/invite/${token}`, { method: "POST", body: data });
}
