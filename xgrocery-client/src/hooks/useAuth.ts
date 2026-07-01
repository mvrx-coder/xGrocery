import { useCallback, useState } from "react";
import { api, clearToken, getToken, setToken } from "../api";
import type { User } from "../types";

const USER_KEY = "xgrocery_user";

function loadUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() =>
    getToken() ? loadUser() : null,
  );

  const login = useCallback(async (name: string) => {
    const res = await api.login(name);
    setToken(res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return { user, login, logout };
}
