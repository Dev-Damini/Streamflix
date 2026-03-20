import { useState, useCallback } from "react";
import type { Movie } from "@/types/movie";

const STORAGE_KEY = "streamflix_watchlist";

export function getWatchlist(): Movie[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveWatchlist(list: Movie[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Movie[]>(() => getWatchlist());

  const addToWatchlist = useCallback((movie: Movie) => {
    setWatchlist((prev) => {
      if (prev.find((m) => m.subjectId === movie.subjectId)) return prev;
      const updated = [movie, ...prev];
      saveWatchlist(updated);
      return updated;
    });
  }, []);

  const removeFromWatchlist = useCallback((subjectId: string) => {
    setWatchlist((prev) => {
      const updated = prev.filter((m) => m.subjectId !== subjectId);
      saveWatchlist(updated);
      return updated;
    });
  }, []);

  const toggleWatchlist = useCallback(
    (movie: Movie) => {
      if (watchlist.find((m) => m.subjectId === movie.subjectId)) {
        removeFromWatchlist(movie.subjectId);
      } else {
        addToWatchlist(movie);
      }
    },
    [watchlist, addToWatchlist, removeFromWatchlist]
  );

  const isInWatchlist = useCallback(
    (subjectId: string) => watchlist.some((m) => m.subjectId === subjectId),
    [watchlist]
  );

  return { watchlist, addToWatchlist, removeFromWatchlist, toggleWatchlist, isInWatchlist };
}
