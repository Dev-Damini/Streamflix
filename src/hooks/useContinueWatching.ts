import { useState, useCallback } from "react";
import type { Movie } from "@/types/movie";

const STORAGE_KEY = "streamflix_continue_watching";
const MAX_ITEMS = 8;

export interface ContinueWatchingItem {
  movie: Movie;
  progress: number; // 0-100
  watchedAt: number; // timestamp
  lastPosition: number; // seconds
  duration: number; // total seconds
}

export function getContinueWatching(): ContinueWatchingItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveContinueWatching(list: ContinueWatchingItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useContinueWatching() {
  const [items, setItems] = useState<ContinueWatchingItem[]>(() =>
    getContinueWatching()
  );

  const addOrUpdate = useCallback((movie: Movie, lastPosition = 0, duration = 0) => {
    setItems((prev) => {
      const progress =
        duration > 0 ? Math.min(Math.round((lastPosition / duration) * 100), 99) : 5;
      const existing = prev.findIndex((i) => i.movie.subjectId === movie.subjectId);
      let updated: ContinueWatchingItem[];

      const newItem: ContinueWatchingItem = {
        movie,
        progress,
        watchedAt: Date.now(),
        lastPosition,
        duration,
      };

      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = newItem;
        // Move to front
        updated.splice(existing, 1);
        updated.unshift(newItem);
      } else {
        updated = [newItem, ...prev].slice(0, MAX_ITEMS);
      }

      saveContinueWatching(updated);
      return updated;
    });
  }, []);

  const remove = useCallback((subjectId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.movie.subjectId !== subjectId);
      saveContinueWatching(updated);
      return updated;
    });
  }, []);

  const getProgress = useCallback(
    (subjectId: string) => {
      const item = items.find((i) => i.movie.subjectId === subjectId);
      return item?.progress ?? 0;
    },
    [items]
  );

  return { items, addOrUpdate, remove, getProgress };
}
