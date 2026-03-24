import { useState, useCallback } from "react";

const STORAGE_KEY = "nickflix_search_history";
const MAX_ITEMS = 10;

export function getSearchHistory(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(() => getSearchHistory());

  const addSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setHistory((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== query.toLowerCase());
      const updated = [query.trim(), ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeSearch = useCallback((query: string) => {
    setHistory((prev) => {
      const updated = prev.filter((q) => q !== query);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, addSearch, removeSearch, clearHistory };
}
