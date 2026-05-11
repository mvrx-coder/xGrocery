import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api";
import type { Category, Item, Settings } from "../types";

const POLL_INTERVAL_MS = 15_000;

type ShoppingData = {
  items: Item[];
  categories: Category[];
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setItems: (next: Item[] | ((prev: Item[]) => Item[])) => void;
  setCategories: (
    next: Category[] | ((prev: Category[]) => Category[]),
  ) => void;
  setSettings: (next: Settings) => void;
  pausePolling: (key: string) => void;
  resumePolling: (key: string) => void;
};

export function useShoppingData(enabled: boolean): ShoppingData {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategoriesState] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pausedKeys = useRef<Set<string>>(new Set());
  const hiddenRef = useRef(false);

  const refetchItems = useCallback(async () => {
    try {
      const next = await api.items.list();
      setItems(next);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    }
  }, []);

  const refetch = useCallback(async () => {
    try {
      const [its, cats, st] = await Promise.all([
        api.items.list(),
        api.categories.list(),
        api.settings.get(),
      ]);
      setItems(its);
      setCategoriesState(cats);
      setSettings(st);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial.
  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    refetch();
  }, [enabled, refetch]);

  // Polling.
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      if (pausedKeys.current.size > 0 || hiddenRef.current) return;
      refetchItems();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled, refetchItems]);

  // Visibility.
  useEffect(() => {
    function handle() {
      hiddenRef.current = document.hidden;
      if (!document.hidden && enabled) {
        refetchItems();
      }
    }
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, [enabled, refetchItems]);

  const pausePolling = useCallback((key: string) => {
    pausedKeys.current.add(key);
  }, []);
  const resumePolling = useCallback(
    (key: string) => {
      pausedKeys.current.delete(key);
      if (enabled) refetchItems();
    },
    [enabled, refetchItems],
  );

  const setCategories = useCallback(
    (next: Category[] | ((prev: Category[]) => Category[])) => {
      setCategoriesState(next);
    },
    [],
  );

  return {
    items,
    categories,
    settings,
    loading,
    error,
    refetch,
    setItems,
    setCategories,
    setSettings,
    pausePolling,
    resumePolling,
  };
}
