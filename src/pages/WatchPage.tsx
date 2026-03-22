import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  Star,
  AlertCircle,
  Loader2,
  Film,
  Bookmark,
  BookmarkCheck,
  Download,
  Tv,
  Maximize,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import MovieRow from "@/components/features/MovieRow";
import SubtitlePanel from "@/components/features/SubtitlePanel";
import { fetchRecommendations, fetchShowBoxStreams, formatDuration, getYear } from "@/lib/movieApi";
import type { ShowBoxStream } from "@/lib/movieApi";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import type { Movie } from "@/types/movie";

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const movie = location.state?.movie as Movie | undefined;

  const [selectedStream, setSelectedStream] = useState<ShowBoxStream | null>(null);
  const [currentSeason, setCurrentSeason] = useState(1);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [playerError, setPlayerError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const { addOrUpdate, getProgress } = useContinueWatching();

  const isSeries = movie?.subjectType === 2;

  // Fetch real MP4 streams from ShowBox
  const { data: streamResult, isLoading: streamLoading } = useQuery({
    queryKey: ["showbox-streams", movie?.title, isSeries, currentSeason, currentEpisode],
    queryFn: () =>
      fetchShowBoxStreams(movie?.title || "", isSeries, currentSeason, currentEpisode),
    enabled: !!movie?.title,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const { data: recommendations } = useQuery({
    queryKey: ["recommendations", movie?.title],
    queryFn: () => fetchRecommendations(movie?.title || ""),
    enabled: !!movie?.title,
    staleTime: 1000 * 60 * 10,
  });

  // Auto-select best quality stream when results arrive
  useEffect(() => {
    if (streamResult?.streams && streamResult.streams.length > 0 && !selectedStream) {
      // Prefer 480p, fallback to first available
      const preferred =
        streamResult.streams.find((s) => s.quality === "480p") ||
        streamResult.streams[0];
      setSelectedStream(preferred);
    }
  }, [streamResult]);

  // Reset stream when episode changes
  useEffect(() => {
    setSelectedStream(null);
    setPlayerError(false);
  }, [currentSeason, currentEpisode]);

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
  }, [movie, addOrUpdate, selectedStream]);

  const handleFullscreen = () => {
    const el = playerContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen().catch(() => {
        const video = el.querySelector("video");
        if (video) (video as HTMLVideoElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen?.();
      });
    }
  };

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

  const streams = streamResult?.streams || [];
  const activeStreamUrl = selectedStream?.proxyUrl || null;
  const activeDownloadUrl = selectedStream?.downloadUrl || null;
  const rating = parseFloat(movie.imdbRatingValue);
  const inWatchlist = isInWatchlist(movie.subjectId);
  const progress = getProgress(movie.subjectId);

  // Episode navigation for series
  const maxSeason = 10; // Will be overridden by ShowBox data when available
  const totalEpisodes = isSeries ? 24 : 0; // Generous default

  const goToEpisode = (season: number, episode: number) => {
    setCurrentSeason(season);
    setCurrentEpisode(episode);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build season/episode rows for series
  const seasonEpisodes = Array.from({ length: Math.min(totalEpisodes, 24) }, (_, i) => i + 1);
  const seasons = Array.from({ length: Math.min(maxSeason, 10) }, (_, i) => i + 1);

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
            Back
          </button>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Now Playing label */}
          {isSeries && (
            <div className="flex items-center gap-2 mb-3">
              <Tv size={14} className="text-primary" />
              <span className="text-sm font-semibold text-white">
                Season {currentSeason} · Episode {currentEpisode}
              </span>
            </div>
          )}

          {/* Player */}
          <div className="rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl shadow-black/60">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <div ref={playerContainerRef} className="absolute inset-0 bg-black">
                {streamLoading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-black">
                    <Loader2 size={36} className="text-primary animate-spin" />
                    <p className="text-white/50 text-sm">Finding stream...</p>
                    <p className="text-white/25 text-xs">{movie.title}</p>
                  </div>
                ) : activeStreamUrl && !playerError ? (
                  <>
                    <video
                      ref={videoRef}
                      key={activeStreamUrl}
                      src={activeStreamUrl}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full bg-black"
                      onError={() => setPlayerError(true)}
                      style={{ outline: "none" }}
                    />
                    {/* Fullscreen button */}
                    <button
                      onClick={handleFullscreen}
                      className="absolute bottom-14 right-3 z-10 w-10 h-10 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                      title="Fullscreen"
                    >
                      <Maximize size={18} />
                    </button>
                  </>
                ) : (
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
                          {playerError
                            ? "Stream Error"
                            : streams.length === 0
                            ? "Stream Not Found"
                            : "Select a Quality"}
                        </h3>
                        <p className="text-sm text-white/50 max-w-xs">
                          {playerError
                            ? "The stream encountered an error. Try a different quality."
                            : streams.length === 0
                            ? "This title isn't available in the stream catalog yet."
                            : "Choose a quality below to start watching."}
                        </p>
                      </div>
                      {playerError && (
                        <button
                          onClick={() => {
                            setPlayerError(false);
                            setSelectedStream(streams[0] || null);
                          }}
                          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          <RefreshCw size={14} />
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info bar */}
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
                        <Star size={10} fill="#facc15" className="text-yellow-400" />
                        <span>{rating.toFixed(1)}</span>
                      </div>
                    )}
                    {streamResult?.quality && (
                      <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">
                        {streamResult.quality}
                      </span>
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

                {activeDownloadUrl && (
                  <a
                    href={activeDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border glass-card border-white/10 text-white/50 hover:text-white transition-colors min-h-[36px]"
                  >
                    <Download size={13} />
                    Download
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quality Selector */}
          {streams.length > 0 && (
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <span className="text-xs text-white/40 font-medium">Quality:</span>
              {streams.map((stream, i) => {
                const isActive = selectedStream?.quality === stream.quality;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedStream(stream);
                      setPlayerError(false);
                    }}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition-all min-h-[36px] ${
                      isActive
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                        : "glass-card border-white/15 text-white/60 hover:text-white hover:border-white/30"
                    }`}
                  >
                    {isActive && <CheckCircle size={12} />}
                    {stream.quality}
                    {stream.format && (
                      <span className={`text-[10px] ${isActive ? "text-white/70" : "text-white/30"}`}>
                        {stream.format}
                      </span>
                    )}
                  </button>
                );
              })}
              {streams[0]?.downloadUrl && (
                <a
                  href={streams.find((s) => s.quality === "720p")?.downloadUrl || streams[0].downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg border glass-card border-white/15 text-white/50 hover:text-white transition-colors min-h-[36px]"
                >
                  <Download size={12} />
                  Download
                </a>
              )}
            </div>
          )}

          {/* Progress bar */}
          {progress > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/30">Progress</span>
                <span className="text-xs text-white/40">{Math.round(progress)}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Movie info grid */}
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

          {/* Subtitle panel */}
          <div className="mt-5">
            <SubtitlePanel tracks={undefined} subtitleString={movie.subtitles} />
          </div>

          {/* Season/Episode selector for TV Series */}
          {isSeries && (
            <div className="mt-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Tv size={16} className="text-primary" />
                Episodes
              </h3>

              {/* Season tabs */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
                {seasons.slice(0, 6).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setCurrentSeason(s); setCurrentEpisode(1); }}
                    className={`shrink-0 px-4 py-2 rounded-lg text-xs font-semibold border transition-all min-h-[36px] ${
                      currentSeason === s
                        ? "bg-primary border-primary text-white"
                        : "glass-card border-white/15 text-white/50 hover:text-white"
                    }`}
                  >
                    Season {s}
                  </button>
                ))}
              </div>

              {/* Episode grid */}
              <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-2">
                {seasonEpisodes.map((ep) => (
                    <button
                      key={ep}
                      onClick={() => goToEpisode(currentSeason, ep)}
                      className={`aspect-square rounded-lg text-xs font-bold border transition-all flex items-center justify-center min-h-[40px] ${
                        currentEpisode === ep
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                          : "glass-card border-white/10 text-white/50 hover:text-white hover:border-white/25"
                      }`}
                    >
                      {ep}
                    </button>
                  ))}
              </div>
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
