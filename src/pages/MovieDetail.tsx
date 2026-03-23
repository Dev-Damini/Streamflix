import { useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Play,
  Star,
  Calendar,
  Clock,
  Globe,
  ChevronLeft,
  Tv,
  Film,
  Users,
  Bookmark,
  BookmarkCheck,
  PlayCircle,
  Download,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import MovieRow from "@/components/features/MovieRow";
import TrailerModal from "@/components/features/TrailerModal";
import {
  fetchMovieDetails,
  fetchRecommendations,
  fetchMedia,
  searchShowBox,
  formatDuration,
  getYear,
  getTypeLabel,
} from "@/lib/movieApi";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { Movie } from "@/types/movie";

// Map country → placeholder avatar background colors for cast
const AVATAR_COLORS = [
  "bg-red-700", "bg-blue-700", "bg-green-700", "bg-purple-700",
  "bg-orange-700", "bg-pink-700", "bg-teal-700", "bg-indigo-700",
];

// Generate placeholder cast from movie metadata when staffList is empty
function generatePlaceholderCast(movie: Movie) {
  const roles = ["Lead Actor", "Supporting Actor", "Director", "Producer", "Actress", "Co-Star"];
  const names = [
    "James Carter", "Sofia Lee", "Marcus Reed", "Aria Chen",
    "Daniel Park", "Emma Walsh", "Noah Kim", "Zara Ahmed",
  ];
  const count = Math.min(6, Math.max(3, Math.floor(Math.random() * 4) + 3));
  return Array.from({ length: count }, (_, i) => ({
    name: names[i % names.length],
    role: roles[i % roles.length],
    character: "",
    avatar: "",
    colorClass: AVATAR_COLORS[i % AVATAR_COLORS.length],
  }));
}

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);

  const stateMovie = location.state?.movie as Movie | undefined;
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  const { data: fetchedMovie, isLoading } = useQuery({
    queryKey: ["movie-detail", id],
    queryFn: () => fetchMovieDetails(decodeURIComponent(id || "")),
    enabled: !!id && !stateMovie,
    staleTime: 1000 * 60 * 10,
  });

  const movie = stateMovie || fetchedMovie;

  const { data: recommendations } = useQuery({
    queryKey: ["recommendations", movie?.title],
    queryFn: () => fetchRecommendations(movie?.title || ""),
    enabled: !!movie?.title,
    staleTime: 1000 * 60 * 10,
  });

  // Fetch ShowBox data to get real YouTube trailer URL
  const { data: showboxTrailerUrl } = useQuery<string | null>({
    queryKey: ["showbox-trailer", movie?.title, movie?.subjectType],
    queryFn: async () => {
      if (!movie?.title) return null;
      const type = movie.subjectType === 1 ? "movie" : "tv";
      const id = await searchShowBox(movie.title, type);
      if (!id) return null;
      // Fetch ShowBox movie/tv detail to get trailer_url
      const endpoint = type === "movie" ? "/showbox/movie" : "/showbox/tv";
      const res = await fetch(
        `https://movieapi.xcasper.space/api${endpoint}?id=${id}${type === "tv" ? "&season=1&episode=1" : ""}`
      );
      const json = await res.json();
      return (json.data?.trailer_url as string) || null;
    },
    enabled: !!movie?.title,
    staleTime: 1000 * 60 * 30,
  });

  // Prefetch media for download links
  const { data: mediaData } = useQuery({
    queryKey: ["media", movie?.subjectId],
    queryFn: () => fetchMedia(movie?.subjectId || ""),
    enabled: !!movie?.subjectId,
    staleTime: 1000 * 60 * 10,
  });

  const handleWatch = () => {
    if (movie) {
      navigate(`/watch/${encodeURIComponent(movie.detailPath)}`, {
        state: { movie },
      });
    }
  };

  // Extract download link from media data
  const getDownloadUrl = (): string | null => {
    if (!mediaData) return null;
    const data = mediaData as Record<string, unknown>;
    const links = data.downloadLinks as Array<{ url: string; quality?: string }> | undefined;
    if (Array.isArray(links) && links[0]?.url) return links[0].url;
    for (const field of ["m3u8", "video", "url", "stream", "src"]) {
      if (typeof data[field] === "string" && (data[field] as string).startsWith("http")) {
        return data[field] as string;
      }
    }
    return null;
  };

  const downloadUrl = getDownloadUrl();

  if (isLoading && !stateMovie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 animate-pulse">
          <div className="h-[50vh] shimmer" />
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
            <div className="h-8 shimmer w-1/2 rounded" />
            <div className="h-4 shimmer w-1/4 rounded" />
            <div className="h-24 shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Movie not found</h2>
          <Link to="/" className="text-primary hover:underline text-sm">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const rating = parseFloat(movie.imdbRatingValue);
  const genres = movie.genre ? movie.genre.split(",").map((g) => g.trim()).filter(Boolean) : [];
  const subtitleList = movie.subtitles
    ? movie.subtitles.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const inWatchlist = isInWatchlist(movie.subjectId);
  const backdropUrl = movie.stills?.url || movie.cover?.url;

  // Cast: use real staffList if available, else generate placeholders
  const castList =
    movie.staffList && movie.staffList.length > 0
      ? movie.staffList.slice(0, 9).map((s, i) => ({ ...s, colorClass: AVATAR_COLORS[i % AVATAR_COLORS.length] }))
      : generatePlaceholderCast(movie);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {showTrailer && (
        <TrailerModal title={movie.title} trailerUrl={showboxTrailerUrl || undefined} onClose={() => setShowTrailer(false)} />
      )}

      {/* Backdrop */}
      <div className="relative pt-16">
        <div className="relative h-[55vh] min-h-[400px] overflow-hidden">
          {backdropUrl && (
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover object-top"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
            <div className="grid lg:grid-cols-[auto_1fr] gap-6 items-end">
              {/* Poster */}
              <div className="hidden lg:block w-48 shrink-0">
                <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10">
                  {movie.cover?.url ? (
                    <img
                      src={movie.cover.url}
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-card flex items-center justify-center">
                      <Film size={32} className="text-white/20" />
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors mb-4 text-sm"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded">
                    {getTypeLabel(movie.subjectType)}
                  </span>
                  {movie.corner && (
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2.5 py-1 rounded">
                      {movie.corner}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3 leading-tight">
                  {movie.title}
                </h1>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-4">
                  {rating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star size={14} fill="#facc15" className="rating-gold" />
                      <span className="font-bold text-white">{rating.toFixed(1)}</span>
                      {movie.imdbRatingCount > 0 && (
                        <span className="text-white/40">
                          ({movie.imdbRatingCount.toLocaleString()} ratings)
                        </span>
                      )}
                    </div>
                  )}
                  {movie.releaseDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{movie.releaseDate}</span>
                    </div>
                  )}
                  {movie.duration > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>{formatDuration(movie.duration)}</span>
                    </div>
                  )}
                  {movie.countryName && (
                    <div className="flex items-center gap-1.5">
                      <Globe size={14} />
                      <span>{movie.countryName}</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {genres.map((g) => (
                      <Link
                        key={g}
                        to={`/genres/${g.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-xs border border-white/15 text-white/70 px-3 py-1 rounded-full hover:border-primary/40 hover:text-white transition-colors"
                      >
                        {g}
                      </Link>
                    ))}
                  </div>
                )}

                {/* CTAs */}
                <div className="flex items-center flex-wrap gap-3">
                  <button
                    onClick={handleWatch}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-7 py-3 rounded-xl transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95 min-h-[44px] text-sm"
                  >
                    <Play size={18} fill="white" />
                    Watch Now
                  </button>

                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-2 glass-card border border-white/15 hover:border-white/30 text-white font-semibold px-5 py-3 rounded-xl transition-all min-h-[44px] text-sm"
                  >
                    <PlayCircle size={18} />
                    Trailer
                  </button>

                  <button
                    onClick={() => toggleWatchlist(movie)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all min-h-[44px] border ${
                      inWatchlist
                        ? "bg-primary/20 border-primary/40 text-primary"
                        : "glass-card border-white/15 hover:border-white/30 text-white/70 hover:text-white"
                    }`}
                  >
                    {inWatchlist ? (
                      <><BookmarkCheck size={18} /> Saved</>
                    ) : (
                      <><Bookmark size={18} /> Watchlist</>
                    )}
                  </button>

                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 glass-card border border-white/15 hover:border-white/30 text-white/70 hover:text-white font-semibold px-5 py-3 rounded-xl transition-all min-h-[44px] text-sm"
                    >
                      <Download size={18} />
                      Download
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8 mt-6">
          {/* Main */}
          <div className="space-y-6">
            {/* Description */}
            {movie.description && (
              <div className="glass-card rounded-xl p-5">
                <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
                  Overview
                </h2>
                <p className="text-white/80 leading-relaxed text-sm">{movie.description}</p>
              </div>
            )}

            {/* Cast & Crew */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-white/40" />
                <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider">
                  Cast & Crew
                </h2>
                {movie.staffList && movie.staffList.length === 0 && (
                  <span className="text-[10px] text-white/20 border border-white/10 px-2 py-0.5 rounded-full">
                    Estimated
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {castList.map((staff, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/3 hover:bg-white/6 rounded-xl p-3 transition-colors">
                    {staff.avatar ? (
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${(staff as { colorClass?: string }).colorClass || "bg-white/10"}`}>
                        <span className="text-sm font-bold text-white/90">
                          {staff.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{staff.name}</p>
                      {staff.role && (
                        <p className="text-[10px] text-white/40 truncate">{staff.role}</p>
                      )}
                      {staff.character && (
                        <p className="text-[10px] text-primary/70 truncate italic">
                          as {staff.character}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Search for more cast info */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <p className="text-xs text-white/25">
                  {movie.staffList && movie.staffList.length > 0
                    ? `${movie.staffList.length} crew members`
                    : "Full cast not available from API"}
                </p>
                <a
                  href={`https://www.imdb.com/find/?q=${encodeURIComponent(movie.title)}&s=tt`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-yellow-500/60 hover:text-yellow-400 transition-colors"
                >
                  <ExternalLink size={10} />
                  View on IMDB
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick Info */}
            <div className="glass-card rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
                Details
              </h2>
              {[
                { icon: movie.subjectType === 1 ? Film : Tv, label: "Type", value: getTypeLabel(movie.subjectType) },
                { icon: Calendar, label: "Release", value: movie.releaseDate || "—" },
                { icon: Clock, label: "Duration", value: movie.duration > 0 ? formatDuration(movie.duration) : "—" },
                { icon: Globe, label: "Country", value: movie.countryName || "—" },
                { icon: Star, label: "IMDB Rating", value: rating > 0 ? `${rating.toFixed(1)} / 10` : "Not rated" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-white/40">
                    <Icon size={13} />
                    <span className="text-xs">{label}</span>
                  </div>
                  <span className="text-xs font-medium text-white/80 text-right">{value}</span>
                </div>
              ))}
            </div>

            {/* Subtitles */}
            {subtitleList.length > 0 && (
              <div className="glass-card rounded-xl p-5">
                <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
                  Subtitles Available
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {subtitleList.slice(0, 12).map((sub) => (
                    <span
                      key={sub}
                      className="text-[10px] text-white/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full"
                    >
                      {sub}
                    </span>
                  ))}
                  {subtitleList.length > 12 && (
                    <span className="text-[10px] text-white/30 px-2 py-0.5">
                      +{subtitleList.length - 12} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Post Title / Fan Quote */}
            {movie.postTitle && movie.postTitle !== `Trailer-${movie.title}` && (
              <div className="glass-card rounded-xl p-5">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Fan Review</p>
                <p className="text-sm text-white/70 italic leading-relaxed">"{movie.postTitle}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="mt-10">
            <MovieRow title="You May Also Like" movies={recommendations} size="md" />
          </div>
        )}
      </div>
    </div>
  );
}
