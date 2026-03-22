import type { HomepageData, SearchData, Movie, MediaData } from "@/types/movie";

const BASE_URL = "https://movieapi.xcasper.space/api";

// No CORS proxy needed — this API has full CORS support
async function apiGet(endpoint: string, params: Record<string, string> = {}): Promise<Response> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

export async function fetchTrending(): Promise<Movie[]> {
  try {
    const res = await apiGet("/trending");
    const json = await res.json();
    if (json.success && json.data?.subjectList) {
      return json.data.subjectList as Movie[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchHomepage(): Promise<HomepageData> {
  try {
    const res = await apiGet("/homepage");
    const json = await res.json();
    return (json.data || {}) as HomepageData;
  } catch {
    return {} as HomepageData;
  }
}

export async function searchMovies(query: string, page = 1): Promise<SearchData> {
  try {
    const res = await apiGet("/search", { keyword: query, page: String(page) });
    const json = await res.json();
    return (json.data || { items: [], pager: {} }) as SearchData;
  } catch {
    return { items: [], pager: {} } as unknown as SearchData;
  }
}

export async function fetchMovieDetails(detailPath: string): Promise<Movie | null> {
  try {
    const res = await apiGet("/detail", { id: detailPath });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data as Movie;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchMedia(subjectId: string): Promise<MediaData | null> {
  try {
    const res = await apiGet("/rich-detail", { id: subjectId });
    const json = await res.json();
    if (json.success && json.data) {
      return json.data as MediaData;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchRecommendations(subject: string): Promise<Movie[]> {
  try {
    const res = await apiGet("/recommend", { id: subject });
    const json = await res.json();
    if (json.success && json.data) {
      const list = json.data.subjectList || json.data.items || (Array.isArray(json.data) ? json.data : []);
      return list as Movie[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchHotMovies(): Promise<Movie[]> {
  try {
    const res = await apiGet("/hot");
    const json = await res.json();
    if (json.success && json.data) {
      const movies = json.data.movie || [];
      const tv = json.data.tv || [];
      return [...movies, ...tv] as Movie[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchPopularSearches(): Promise<string[]> {
  try {
    const res = await apiGet("/popular-search");
    const json = await res.json();
    if (json.success && json.data) {
      if (Array.isArray(json.data)) return json.data as string[];
      if (json.data.keywords) return json.data.keywords as string[];
      if (json.data.items) return (json.data.items as { keyword?: string }[]).map((i) => i.keyword || "").filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
}

// ─── ShowBox Streaming ────────────────────────────────────────────────────────

export interface ShowBoxStream {
  quality: string;
  format: string;
  size: string;
  duration: number;
  proxyUrl: string;
  downloadUrl: string;
}

export interface ShowBoxStreamResult {
  title: string;
  type: string;
  imdbId?: string;
  year?: number;
  quality?: string;
  streams: ShowBoxStream[];
  showboxId?: number;
}

/** Search ShowBox catalog by title, return best matching ID */
export async function searchShowBox(title: string, type: "movie" | "tv"): Promise<number | null> {
  try {
    const res = await apiGet("/showbox/search", { keyword: title, type });
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      // Find best match by title similarity
      const titleLower = title.toLowerCase();
      const exact = json.data.find((m: { title: string }) =>
        m.title.toLowerCase() === titleLower
      );
      return (exact || json.data[0]).id as number;
    }
    return null;
  } catch {
    return null;
  }
}

/** Get real MP4 streaming URLs via ShowBox stream endpoint */
export async function fetchShowBoxStreams(
  title: string,
  isSeries: boolean,
  season = 1,
  episode = 1
): Promise<ShowBoxStreamResult | null> {
  try {
    const type = isSeries ? "tv" : "movie";
    const showboxId = await searchShowBox(title, type);
    if (!showboxId) return null;

    const params: Record<string, string> = { id: String(showboxId), type };
    if (isSeries) {
      params.season = String(season);
      params.episode = String(episode);
    }

    const res = await apiGet("/stream", params);
    const json = await res.json();
    if (json.success && json.data) {
      return { ...json.data, showboxId } as ShowBoxStreamResult;
    }
    return null;
  } catch {
    return null;
  }
}

/** Get ShowBox TV show details with episode list */
export async function fetchShowBoxTvDetails(
  showboxId: number,
  season = 1
): Promise<{ maxSeason: number; maxEpisode: number; episodes: ShowBoxEpisode[] } | null> {
  try {
    const res = await apiGet("/showbox/tv", { id: String(showboxId), season: String(season), episode: "1" });
    const json = await res.json();
    if (json.success && json.data) {
      return {
        maxSeason: json.data.max_season || 1,
        maxEpisode: json.data.max_episode || 1,
        episodes: (json.data.episode || []) as ShowBoxEpisode[],
      };
    }
    return null;
  } catch {
    return null;
  }
}

export interface ShowBoxEpisode {
  id: number;
  season: number;
  episode: number;
  title: string;
  synopsis?: string;
  thumbs?: string;
  runtime?: number;
  imdb_rating?: string;
  released?: string;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

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
