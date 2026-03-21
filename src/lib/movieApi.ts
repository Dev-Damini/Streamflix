import type { ApiResponse, HomepageData, SearchData, Movie, MediaData } from "@/types/movie";

const BASE_URL = "https://gzmovieboxapi.vercel.app/api";
const API_KEY = "Godszeal";
async function fetchWithProxy(endpoint: string, params: Record<string, string> = {}): Promise<Response> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("apikey", API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const targetUrl = url.toString();

  const makeRequest = async (proxyUrl: string): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      clearTimeout(timer);
      throw e;
    }
  };

  const proxyUrls = [
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
  ];

  // Race all proxies — fastest valid response wins
  return Promise.any(proxyUrls.map(makeRequest));
}

export async function fetchTrending(): Promise<Movie[]> {
  try {
    const res = await fetchWithProxy("/trending");
    const json = await res.json();
    if (json.status === "success" && json.data) {
      return (json.data.subjectList || json.data.items || (Array.isArray(json.data) ? json.data : []) || []) as Movie[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchHomepage(): Promise<HomepageData> {
  try {
    const res = await fetchWithProxy("/homepage");
    const json: ApiResponse<HomepageData> = await res.json();
    return json.data;
  } catch {
    return {} as HomepageData;
  }
}

export async function searchMovies(query: string, page = 1): Promise<SearchData> {
  try {
    const res = await fetchWithProxy("/search", { query, page: String(page) });
    const json = await res.json();
    return (json.data || { items: [], pager: {} }) as SearchData;
  } catch {
    return { items: [], pager: {} } as unknown as SearchData;
  }
}

export async function fetchMovieDetails(detailPath: string): Promise<Movie | null> {
  try {
    const res = await fetchWithProxy("/details", { id: detailPath });
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
    const res = await fetchWithProxy("/media", { id: subjectId });
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
    const res = await fetchWithProxy("/recommendations", { subject });
    const json = await res.json();
    if (json.status === "success" && json.data) {
      return (json.data.subjectList || json.data.items || (Array.isArray(json.data) ? json.data : []) || []) as Movie[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchHotMovies(): Promise<Movie[]> {
  try {
    const res = await fetchWithProxy("/hot");
    const json = await res.json();
    if (json.status === "success" && json.data) {
      return (json.data.subjectList || json.data.items || (Array.isArray(json.data) ? json.data : []) || []) as Movie[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchPopularSearches(): Promise<string[]> {
  try {
    const res = await fetchWithProxy("/popular");
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
