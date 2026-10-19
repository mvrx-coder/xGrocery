import { API_URL } from "./constants";
import type { Category, Item, Settings, User } from "./types";

const TOKEN_KEY = "xgrocery_token";

// <img> não manda header Authorization: o token é espelhado num cookie que
// o backend aceita só na rota da foto (get_image_user). Cookie não distingue
// porta, então vale também em dev (vite 5178 → backend 8062).
const TOKEN_COOKIE = "xgrocery_token";

function writeTokenCookie(t: string | null) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = t
    ? `${TOKEN_COOKIE}=${t}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Strict${secure}`
    : `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Strict${secure}`;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
  writeTokenCookie(t);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  writeTokenCookie(null);
}

// Sessões abertas antes do cookie existir: espelha o token já guardado.
writeTokenCookie(getToken());

export function photoUrl(item: Item, mini = false): string {
  return `${API_URL}/api/items/${item.id}/foto?v=${item.foto_versao}${mini ? "&mini=true" : ""}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (res.status === 401) {
    clearToken();
    localStorage.removeItem("xgrocery_user");
    window.location.reload();
    throw new Error("Sessão expirada");
  }

  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    let message = res.statusText;
    if (ct.includes("application/json")) {
      const payload = await res.json().catch(() => null);
      if (typeof payload?.detail === "string") {
        message = payload.detail;
      } else if (Array.isArray(payload?.detail)) {
        message = payload.detail
          .map((err: { msg?: string }) => err.msg)
          .filter(Boolean)
          .join("; ");
      } else if (payload) {
        message = JSON.stringify(payload);
      }
    } else {
      message = (await res.text().catch(() => "")) || message;
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  login: (name: string) =>
    request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  items: {
    list: () => request<Item[]>("/api/items"),
    create: (body: {
      nome: string;
      categoria_id: number;
      ativo?: boolean;
      quantidade?: number | null;
    }) =>
      request<Item>("/api/items", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    patch: (
      id: number,
      body: Partial<{
        nome: string;
        categoria_id: number;
        ativo: boolean;
        quantidade: number | null;
      }>,
    ) =>
      request<Item>(`/api/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    delete: (id: number) =>
      request<void>(`/api/items/${id}`, { method: "DELETE" }),
    // Foto cheia primeiro (gera a versão), miniatura depois — ver backend.
    uploadPhoto: async (id: number, photo: Blob, mini: Blob) => {
      const jpeg = { "Content-Type": "image/jpeg" };
      const saved = await request<Item>(`/api/items/${id}/foto`, {
        method: "PUT",
        headers: jpeg,
        body: photo,
      });
      await request<Item>(`/api/items/${id}/foto?mini=true`, {
        method: "PUT",
        headers: jpeg,
        body: mini,
      });
      return saved;
    },
    deletePhoto: (id: number) =>
      request<Item>(`/api/items/${id}/foto`, { method: "DELETE" }),
  },
  categories: {
    list: () => request<Category[]>("/api/categories"),
    create: (body: { nome: string; cor: string; ordem_exibicao?: number }) =>
      request<Category>("/api/categories", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    patch: (
      id: number,
      body: Partial<{ nome: string; cor: string; ordem_exibicao: number }>,
    ) =>
      request<Category>(`/api/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    delete: (id: number) =>
      request<void>(`/api/categories/${id}`, { method: "DELETE" }),
  },
  settings: {
    get: () => request<Settings>("/api/settings"),
    patch: (body: Partial<{ paleta: string; estilo_diferenciacao: string }>) =>
      request<Settings>("/api/settings", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
  },
};
