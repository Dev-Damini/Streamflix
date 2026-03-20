
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tv, ChevronDown, Play, Loader2 } from "lucide-react";
import { fetchMedia } from "@/lib/movieApi";
import type { Movie } from "@/types/movie";

interface Episode {
  episodeId?: string;
  title?: string;
  episode?: number;
  season?: number;
  duration?: number;
  cover?: string;
  description?: string;
  streamUrl?: string;
}

interface EpisodeSelectorProps {
  movie: Movie;
  onSelectEpisode: (streamUrl: string, label: string) => void;
}

export default function EpisodeSelector({ movie, onSelectEpisode }: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonMenuOpen, setSeasonMenuOpen] = useState(false);

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ["media-episodes", movie.subjectId, selectedSeason],
    queryFn: () => fetchMedia(movie.subjectId),
    enabled: !!movie.subjectId,
    staleTime: 1000 * 60 * 10,
  });

  // Parse episodes from whatever the API returns
  const parseEpisodes = (): Episode[] => {
    if (!mediaData) return [];
    const data = mediaData as Record<string, unknown>;

    // Try common episode array fields
    for (const key of ["episodes", "episodeList", "playlist", "items", "list"]) {
      const arr = data[key] as Episode[] | undefined;
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }

    // Try nested under seasons
    const seasons = data.seasons as Array<{ season: number; episodes: Episode[] }> | undefined;
    if (Array.isArray(seasons)) {
      const s = seasons.find((s) => s.season === selectedSeason);
      if (s?.episodes) return s.episodes;
      if (seasons[0]?.episodes) return seasons[0].episodes;
    }

    // If there's a single stream, generate a single episode entry
    for (const field of ["m3u8", "video", "url", "stream", "src"]) {
      if (typeof data[field] === "string" && (data[field] as string).startsWith("http")) {
        return [{ title: `${movie.title} - Episode 1`, streamUrl: data[field] as string, episode: 1, season: 1 }];
      }
    }

    // If API returns nothing, generate placeholder episode list for series using vidsrc URLs
    return Array.from({ length: 12 }, (_, i) => ({
      title: `Episode ${i + 1}`,
      episode: i + 1,
      season: selectedSeason,
      streamUrl: `https://vidsrc.me/embed/tv?title=${encodeURIComponent(movie.title)}&s=${selectedSeason}&e=${i + 1}`,
    }));
  };

  const episodes = parseEpisodes();

  // Get distinct seasons — always have at least seasons 1-3 for series
  const seasons = episodes.some((e) => e.season && e.season > 1)
    ? [...new Set(episodes.map((e) => e.season || 1))].sort((a, b) => a - b)
    : [1, 2, 3, 4, 5];
  const filteredEpisodes = episodes.filter((e) => (e.season || 1) === selectedSeason);

  const getStreamUrl = (ep: Episode, epIndex: number): string => {
    if (ep.streamUrl) return ep.streamUrl;
    const data = mediaData as Record<string, unknown>;
    for (const field of ["m3u8", "video", "url", "stream"]) {
      if (typeof data[field] === "string") return data[field] as string;
    }
    // Fallback: generate vidsrc embed URL for this episode
    const season = ep.season || selectedSeason;
    const episode = ep.episode || epIndex + 1;
    return `https://vidsrc.me/embed/tv?title=${encodeURIComponent(movie.title)}&s=${season}&e=${episode}`;
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 flex items-center justify-center gap-3">
        <Loader2 size={20} className="text-primary animate-spin" />
        <span className="text-sm text-white/50">Loading episodes...</span>
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Tv size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-white">Episodes</h3>
        </div>
        <p className="text-xs text-white/40">
          Episode list not available for this title. You can still watch using the player above.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tv size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-white">Episodes</h3>
          <span className="text-xs bg-primary/20 text-primary border border-primary/30 rounded-full px-2 py-0.5">
            {filteredEpisodes.length} eps
          </span>
        </div>

        {/* Season selector */}
        {seasons.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setSeasonMenuOpen(!seasonMenuOpen)}
              className="flex items-center gap-1.5 glass-dark border border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white transition-colors min-h-[36px]"
            >
              Season {selectedSeason}
              <ChevronDown size={12} className={`transition-transform ${seasonMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {seasonMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-20 min-w-[120px] overflow-hidden">
                {seasons.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSelectedSeason(s); setSeasonMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                      s === selectedSeason
                        ? "bg-primary/20 text-primary"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    Season {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Episode Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1 scrollbar-hide">
        {filteredEpisodes.map((ep, i) => {
          const epNum = ep.episode || i + 1;
          const url = getStreamUrl(ep, i);
          const label = `S${ep.season || 1} E${epNum}`; // <-- Missing semicolon or return statement here

          return (
            <button
              key={ep.episodeId || i}
              onClick={() => url && onSelectEpisode(url, label)}
              disabled={false}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all group border ${
                url
                  ? "border-white/8 hover:border-primary/40 hover:bg-primary/10"
                  : "border-white/5 opacity-40 cursor-not-allowed"
              } bg-white/3`}
            >
              {/* Thumbnail or number */}
              <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0 bg-white/5 flex items-center justify-center">
                {ep.cover ? (
                  <img src={ep.cover} alt={label} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-white/30">{epNum}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-primary">{label}</span>
                  {ep.duration && (
                    <span className="text-[10px] text-white/30">
                      {Math.round(ep.duration / 60)}m
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-white/70 truncate group-hover:text-white transition-colors">
                  {ep.title || `Episode ${epNum}`}
                </p>
              </div>

              {url && (
                <Play
                  size={14}
                  className="text-white/20 group-hover:text-primary transition-colors shrink-0"
                  fill="currentColor"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
