import { apiFetch } from "@/lib/api/client";
import type { User } from "@/lib/types/domain";

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export function login(payload: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/auth/login/", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload)
  });
}

export function register(payload: { name: string; email: string; password: string }) {
  return apiFetch<AuthResponse>("/auth/register/", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload)
  });
}

export function logout(refresh?: string | null) {
  return apiFetch<null>("/auth/logout/", {
    method: "POST",
    body: JSON.stringify(refresh ? { refresh } : {})
  });
}

export function getMe() {
  return apiFetch<User>("/auth/me/");
}

export function updateMe(payload: Partial<Pick<User, "name" | "avatar_url" | "job_title" | "timezone">>) {
  return apiFetch<User>("/auth/me/", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}
