import type { ApiResponse, HomepageData, TrendingData, SearchData, Movie, MediaData } from "@/types/movie";

const BASE_URL = "https://gzmovieboxapi.vercel.app/api";
const API_KEY = "Godszeal";

function buildUrl(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("apikey", API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

export async function fetchTrending(): Promise<TrendingData> {
  const res = await fetch(buildUrl("/trending"));
  const json: ApiResponse<TrendingData> & { data: { subjectList: Movie[] } } = await res.json();
  return json.data as unknown as TrendingData;
}

export async function fetchHomepage(): Promise<HomepageData> {
  const res = await fetch(buildUrl("/homepage"));
  const json: ApiResponse<HomepageData> = await res.json();
  return json.data;
}

export async function searchMovies(query: string, page = 1): Promise<SearchData> {
  const res = await fetch(buildUrl("/search", { query, page: String(page) }));
  const json = await res.json();
  return json.data as SearchData;
}

export async function fetchMovieDetails(detailPath: string): Promise<Movie | null> {
  try {
    const res = await fetch(buildUrl("/details", { id: detailPath }));
    const json = await res.json();
    if (json.status === "success" && json.data) {
      return json.data as Movie;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchMedia(subjectId: string): Promise<MediaData | null> {
  try {
    const res = await fetch(buildUrl("/media", { id: subjectId }));
    const json = await res.json();
    if (json.status === "success") {
      return json.data as MediaData;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchRecommendations(subject: string): Promise<Movie[]> {
  try {
    const res = await fetch(buildUrl("/recommendations", { subject }));
    const json = await res.json();
    if (json.status === "success" && json.data) {
      return (json.data.subjectList || json.data.items || json.data || []) as Movie[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchHotMovies(): Promise<Movie[]> {
  try {
    const res = await fetch(buildUrl("/hot"));
    const json = await res.json();
    if (json.status === "success" && json.data) {
      return (json.data.subjectList || json.data.items || json.data || []) as Movie[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchPopularSearches(): Promise<string[]> {
  try {
    const res = await fetch(buildUrl("/popular"));
    const json = await res.json();
    if (json.status === "success" && json.data) {
      if (Array.isArray(json.data)) return json.data as string[];
      if (json.data.keywords) return json.data.keywords as string[];
      if (json.data.items) return (json.data.items as { keyword: string }[]).map((i) => i.keyword || i);
    }
    return [];
  } catch {
    return [];
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function getYear(dateStr: string): string {
  if (!dateStr) return "";
  return dateStr.split("-")[0];
}

export function getTypeLabel(type: 1 | 2): string {
  return type === 1 ? "Movie" : "Series";
}
