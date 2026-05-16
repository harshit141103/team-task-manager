import { useAuthStore } from "@/lib/stores/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, payload: unknown) {
    super(typeof payload === "object" && payload && "detail" in payload ? String((payload as { detail: unknown }).detail) : "Request failed");
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = RequestInit & {
  auth?: boolean;
  retry?: boolean;
};

async function parseResponse(response: Response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  return response.text();
}

async function refreshAccessToken() {
  const { refreshToken, setAccessToken, clearAuth } = useAuthStore.getState();
  const response = await fetch(`${API_URL}/auth/refresh/`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(refreshToken ? { refresh: refreshToken } : {})
  });

  if (!response.ok) {
    clearAuth();
    return null;
  }

  const data = (await response.json()) as { access: string; refresh?: string };
  setAccessToken(data.access, data.refresh);
  return data.access;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, retry = true, headers, ...init } = options;
  const token = useAuthStore.getState().accessToken;
  const requestHeaders = new Headers(headers);

  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!isFormData && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (auth && token) requestHeaders.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: requestHeaders,
    credentials: "include"
  });

  if (response.status === 401 && auth && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiFetch<T>(path, { ...options, retry: false });
  }

  const payload = await parseResponse(response);
  if (!response.ok) throw new ApiError(response.status, payload);
  return payload as T;
}

export function buildQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}
