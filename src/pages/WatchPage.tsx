import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  Star,
  AlertCircle,
  Loader2,
  ExternalLink,
  Play,
  Film,
  Bookmark,
  BookmarkCheck,
  Download,
  Tv,
  Maximize,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import MovieRow from "@/components/features/MovieRow";
import EpisodeSelector from "@/components/features/EpisodeSelector";
import SubtitlePanel from "@/components/features/SubtitlePanel";
import { fetchMedia, fetchRecommendations, formatDuration, getYear } from "@/lib/movieApi";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import type { Movie } from "@/types/movie";

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const movie = location.state?.movie as Movie | undefined;
  const [playerError, setPlayerError] = useState(false);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [currentEpisodeLabel, setCurrentEpisodeLabel] = useState<string | null>(null);
  const [embedKey, setEmbedKey] = useState(0);
  const [providerIndex, setProviderIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const { addOrUpdate } = useContinueWatching();

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ["media", movie?.subjectId],
    queryFn: () => fetchMedia(movie?.subjectId || ""),
    enabled: !!movie?.subjectId,
    staleTime: 1000 * 60 * 5,
  });

  const { data: recommendations } = useQuery({
    queryKey: ["recommendations", movie?.title],
    queryFn: () => fetchRecommendations(movie?.title || ""),
    enabled: !!movie?.title,
    staleTime: 1000 * 60 * 10,
  });

  // Track progress for Continue Watching
  useEffect(() => {
    if (!movie) return;
    addOrUpdate(movie, 0, movie.duration || 0);
  }, [movie?.subjectId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !movie) return;
    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime > 5) {
        addOrUpdate(movie, video.currentTime, video.duration);
      }
    };
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [movie, addOrUpdate]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Content not found</h2>
          <Link to="/" className="text-primary hover:underline text-sm">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  // Multiple embed providers — cycle through on error
  const getEmbedProviders = useCallback((): string[] => {
    if (!movie?.title) return [];
    const title = encodeURIComponent(movie.title);
    const isSeries = movie.subjectType === 2;
    return isSeries
      ? [
          `https://multiembed.mov/?video_id=${title}&tmdb=0&s=1&e=1`,
          `https://www.2embed.cc/embedtv/${title}?s=1&e=1`,
          `https://embed.su/embed/tv/${title}/1/1`,
          `https://vidsrc.xyz/embed/tv?tmdb=${title}&season=1&episode=1`,
        ]
      : [
          `https://multiembed.mov/?video_id=${title}&tmdb=0`,
          `https://www.2embed.cc/embed/${title}`,
          `https://embed.su/embed/movie/${title}`,
          `https://vidsrc.xyz/embed/movie?tmdb=${title}`,
        ];
  }, [movie]);

  // Build embed URL
  const getStreamUrl = (): string | null => {
    if (selectedStream) return selectedStream;

    // First try to extract a direct stream from media API
    if (mediaData) {
      const data = mediaData as Record<string, unknown>;
      const directFields = ["m3u8", "video", "url", "stream", "src", "source", "link", "playUrl", "playurl"];
      for (const field of directFields) {
        if (typeof data[field] === "string" && (data[field] as string).startsWith("http")) {
          return data[field] as string;
        }
      }
      for (const key of ["streams", "items", "links", "sources", "videos"]) {
        const arr = data[key] as Array<{ url?: string; src?: string }> | undefined;
        if (Array.isArray(arr) && arr.length > 0) {
          return arr[0].url || arr[0].src || null;
        }
      }
    }

    // Use embed providers (cycle on error)
    const providers = getEmbedProviders();
    if (providers.length > 0) {
      return providers[providerIndex % providers.length];
    }

    return null;
  };

  const streamUrl = getStreamUrl();

  const getAllStreams = () => {
    if (!mediaData) return [];
    const data = mediaData as Record<string, unknown>;
    const streams = data.streams as Array<{ url: string; quality?: string; label?: string }> | undefined;
    if (Array.isArray(streams)) return streams;
    return [];
  };

  const getDownloadUrl = (): string | null => {
    if (!mediaData) return null;
    const data = mediaData as Record<string, unknown>;
    const links = data.downloadLinks as Array<{ url: string; quality?: string }> | undefined;
    if (Array.isArray(links) && links[0]?.url) return links[0].url;
    return streamUrl;
  };

  const allStreams = getAllStreams();
  const downloadUrl = getDownloadUrl();
  const rating = parseFloat(movie.imdbRatingValue);
  const inWatchlist = isInWatchlist(movie.subjectId);

  const isM3U8 = streamUrl?.includes("m3u8");
  const isMP4 = streamUrl?.includes(".mp4");
  const isDirectVideo = isM3U8 || isMP4;
  const shouldUseIframe = streamUrl && !isDirectVideo;

  const handleTryNextProvider = () => {
    const providers = getEmbedProviders();
    const next = (providerIndex + 1) % providers.length;
    setProviderIndex(next);
    setSelectedStream(null);
    setPlayerError(false);
    setEmbedKey((k) => k + 1);
  };

  const handleFullscreen = () => {
    const el = playerContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen().catch(() => {
        // Fallback: try to go fullscreen on the iframe itself
        const iframe = el.querySelector("iframe");
        if (iframe) (iframe as HTMLIFrameElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen?.();
      });
    }
  };

  const handleEpisodeSelect = (url: string, label: string) => {
    setSelectedStream(url);
    setCurrentEpisodeLabel(label);
    setPlayerError(false);
    setEmbedKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isSeries = movie.subjectType === 2;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        {/* Back nav */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Back to details
          </button>
        </div>

        {/* Player Area */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Now Playing label */}
          {currentEpisodeLabel && (
            <div className="flex items-center gap-2 mb-3">
              <Tv size={14} className="text-primary" />
              <span className="text-sm font-semibold text-white">
                Playing {currentEpisodeLabel}
              </span>
            </div>
          )}

          <div className="rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl shadow-black/60">
            {/* 16:9 player */}
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <div ref={playerContainerRef} className="absolute inset-0 bg-black">
                {isLoading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-black">
                    <Loader2 size={36} className="text-primary animate-spin" />
                    <p className="text-white/50 text-sm">Loading stream...</p>
                  </div>
                ) : streamUrl && !playerError ? (
                  isDirectVideo ? (
                    <video
                      ref={videoRef}
                      src={streamUrl}
                      controls
                      autoPlay
                      className="w-full h-full bg-black"
                      crossOrigin="anonymous"
                      onError={() => setPlayerError(true)}
                      style={{ outline: "none" }}
                    />
                  ) : (
                    <>
                      <iframe
                        key={embedKey}
                        src={streamUrl}
                        className="w-full h-full border-0"
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; payment"
                        title={movie.title}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-top-navigation-by-user-activation"
                      />
                      {/* Fullscreen tap overlay — bottom-right corner */}
                      <button
                        onClick={handleFullscreen}
                        className="absolute bottom-3 right-3 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                        title="Fullscreen"
                        aria-label="Toggle fullscreen"
                      >
                        <Maximize size={18} />
                      </button>
                    </>
                  )
                ) : (
                  /* Fallback / No stream */
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#0d0d0d] to-black p-8 text-center relative">
                    {movie.cover?.url && (
                      <div className="absolute inset-0 opacity-10">
                        <img src={movie.cover.url} alt="" className="w-full h-full object-cover blur-2xl scale-110" />
                        <div className="absolute inset-0 bg-black/70" />
                      </div>
                    )}
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        {playerError ? (
                          <AlertCircle size={28} className="text-primary" />
                        ) : (
                          <Film size={28} className="text-primary/60" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          {playerError ? "Source Unavailable" : "Loading Player..."}
                        </h3>
                        <p className="text-sm text-white/50 max-w-xs">
                          Try a different source or open externally.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleTryNextProvider}
                          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          <RefreshCw size={14} />
                          Try Next Source
                        </button>
                        {streamUrl && (
                          <a
                            href={streamUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 glass-dark border border-white/10 text-white/70 text-sm px-4 py-2 rounded-lg hover:text-white transition-colors"
                          >
                            <ExternalLink size={14} />
                            Open External
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info Bar */}
            <div className="bg-[#0a0a0a] px-5 py-3 flex items-center justify-between gap-4 border-t border-white/5 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                {movie.cover?.url && (
                  <img src={movie.cover.url} alt={movie.title} className="w-8 h-10 object-cover rounded shrink-0" />
                )}
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-white truncate">{movie.title}</h2>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>{getYear(movie.releaseDate)}</span>
                    {movie.duration > 0 && <span>{formatDuration(movie.duration)}</span>}
                    {rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star size={10} fill="#facc15" className="rating-gold" />
                        <span>{rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={() => toggleWatchlist(movie)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all min-h-[36px] ${
                    inWatchlist
                      ? "bg-primary/20 border-primary/40 text-primary"
                      : "glass-card border-white/10 text-white/50 hover:text-white"
                  }`}
                >
                  {inWatchlist ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                  {inWatchlist ? "Saved" : "Save"}
                </button>

                {/* Download button */}
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border glass-card border-white/10 text-white/50 hover:text-white transition-colors min-h-[36px]"
                    title="Download to device"
                  >
                    <Download size={13} />
                    Download
                  </a>
                )}

                <button
                  onClick={handleTryNextProvider}
                  className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white glass-card border border-white/10 px-3 py-1.5 rounded-lg transition-colors min-h-[36px]"
                  title="Try a different source"
                >
                  <RefreshCw size={12} />
                  Next Source
                </button>

                {streamUrl && (
                  <a
                    href={streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white glass-card border border-white/10 px-3 py-1.5 rounded-lg transition-colors min-h-[36px]"
                  >
                    <ExternalLink size={12} />
                    External
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quality Selector */}
          {allStreams.length > 1 && (
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <span className="text-xs text-white/40">Quality:</span>
              {allStreams.map((stream, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedStream(stream.url); setPlayerError(false); }}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors min-h-[36px] ${
                    (selectedStream || allStreams[0]?.url) === stream.url
                      ? "bg-primary border-primary text-white"
                      : "border-white/15 text-white/50 hover:text-white glass-card"
                  }`}
                >
                  {stream.quality || stream.label || `Source ${i + 1}`}
                </button>
              ))}
            </div>
          )}

          {/* Movie quick info */}
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Genre", value: movie.genre || "—" },
              { label: "Country", value: movie.countryName || "—" },
              { label: "IMDB Rating", value: rating > 0 ? `${rating.toFixed(1)} / 10` : "Not rated" },
              {
                label: "Subtitles",
                value: movie.subtitles
                  ? movie.subtitles.split(",").slice(0, 3).join(", ") +
                    (movie.subtitles.split(",").length > 3 ? "..." : "")
                  : "None",
              },
            ].map(({ label, value }) => (
              <div key={label} className="glass-card rounded-xl p-4">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-medium text-white/80 line-clamp-1">{value}</p>
              </div>
            ))}
          </div>

          {/* Subtitle Panel */}
          {(() => {
            const mediaSubs = (mediaData as Record<string, unknown> | null)
              ?.subtitles as { url: string; lang: string; label: string }[] | undefined;
            return (
              <div className="mt-5">
                <SubtitlePanel
                  tracks={mediaSubs}
                  subtitleString={movie.subtitles}
                />
              </div>
            );
          })()}

          {/* Episode Selector — only for TV series */}
          {isSeries && (
            <div className="mt-6">
              <EpisodeSelector movie={movie} onSelectEpisode={handleEpisodeSelect} />
            </div>
          )}
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="max-w-[1400px] mx-auto mt-10 pb-10">
            <MovieRow title="More Like This" movies={recommendations} size="md" />
          </div>
        )}
      </div>
    </div>
  );
}
