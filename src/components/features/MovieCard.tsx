import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Play, Tv, Film, Bookmark, BookmarkCheck, Info } from "lucide-react";
import type { Movie } from "@/types/movie";
import { getYear, getTypeLabel } from "@/lib/movieApi";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useContinueWatching } from "@/hooks/useContinueWatching";

interface MovieCardProps {
  movie: Movie;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
}

export default function MovieCard({ movie, size = "md", showProgress = false }: MovieCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();
  const { getProgress } = useContinueWatching();

  const handleClick = () => {
    navigate(`/movie/${encodeURIComponent(movie.detailPath)}`, {
      state: { movie },
    });
  };

  const handleWatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${encodeURIComponent(movie.detailPath)}`, {
      state: { movie },
    });
  };

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  const rating = parseFloat(movie.imdbRatingValue);
  const hasRating = rating > 0;
  const inWatchlist = isInWatchlist(movie.subjectId);
  const progress = getProgress(movie.subjectId);
  const genres = movie.genre ? movie.genre.split(",").slice(0, 2).map((g) => g.trim()) : [];

  const sizeClasses = { sm: "w-[140px]", md: "w-[180px]", lg: "w-[220px]" };
  const imgHeightClasses = { sm: "h-[210px]", md: "h-[270px]", lg: "h-[330px]" };

  return (
    <div
      onClick={handleClick}
      className={`${sizeClasses[size]} shrink-0 cursor-pointer movie-card-hover group`}
    >
      {/* Poster */}
      <div className={`relative ${imgHeightClasses[size]} rounded-xl overflow-hidden bg-card`}>
        {/* Shimmer while loading */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 shimmer rounded-xl" />
        )}

        {/* Cover Image */}
        {!imgError && movie.cover?.url ? (
          <img
            src={movie.cover.url}
            alt={movie.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-card gap-2">
            <Film size={32} className="text-white/20" />
            <span className="text-xs text-white/30 text-center px-2 line-clamp-2">
              {movie.title}
            </span>
          </div>
        )}

        {/* ── Rich hover overlay ── */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl flex flex-col justify-end p-3">
          {/* Title */}
          <p className="text-xs font-bold text-white leading-tight mb-1.5 line-clamp-2">
            {movie.title}
          </p>

          {/* Rating + year */}
          <div className="flex items-center gap-2 mb-2">
            {hasRating && (
              <div className="flex items-center gap-0.5">
                <Star size={9} fill="#facc15" className="text-yellow-400" />
                <span className="text-[10px] font-bold text-yellow-400">{rating.toFixed(1)}</span>
              </div>
            )}
            <span className="text-[10px] text-white/50">{getYear(movie.releaseDate)}</span>
            {movie.countryName && (
              <span className="text-[10px] text-white/40 truncate">{movie.countryName}</span>
            )}
          </div>

          {/* Genre pills */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {genres.map((g) => (
                <span
                  key={g}
                  className="text-[9px] bg-white/10 border border-white/15 text-white/70 px-1.5 py-0.5 rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-1.5">
            <button
              onClick={handleWatch}
              className="flex-1 flex items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors min-h-[28px]"
            >
              <Play size={10} fill="white" />
              Watch
            </button>
            <button
              onClick={handleClick}
              className="flex items-center justify-center bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg transition-colors min-h-[28px] min-w-[28px]"
            >
              <Info size={10} />
            </button>
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 left-2 group-hover:opacity-0 transition-opacity duration-200">
          <div className="flex items-center gap-1 glass-dark rounded-full px-2 py-0.5">
            {movie.subjectType === 2 ? (
              <Tv size={10} className="text-primary" />
            ) : (
              <Film size={10} className="text-primary" />
            )}
            <span className="text-[10px] text-white/80 font-medium">
              {getTypeLabel(movie.subjectType)}
            </span>
          </div>
        </div>

        {/* Watchlist button */}
        <button
          onClick={handleToggleWatchlist}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
            inWatchlist
              ? "bg-primary text-white shadow-lg shadow-primary/40"
              : "glass-dark text-white/60 hover:text-white opacity-0 group-hover:opacity-100"
          }`}
        >
          {inWatchlist ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
        </button>

        {/* Corner badge */}
        {movie.corner && (
          <div className="absolute top-9 right-2 group-hover:opacity-0 transition-opacity duration-200">
            <span className="bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {movie.corner}
            </span>
          </div>
        )}

        {/* Rating badge (hidden on hover) */}
        {hasRating && (
          <div className="absolute bottom-2 right-2 group-hover:opacity-0 transition-opacity duration-200">
            <div className="flex items-center gap-1 glass-dark rounded-full px-2 py-0.5">
              <Star size={10} fill="#facc15" className="rating-gold" />
              <span className="text-[10px] font-semibold text-white">{rating.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Progress bar for continue watching */}
        {(showProgress || progress > 0) && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div
              className="h-full bg-primary rounded-b-xl transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2 px-0.5">
        <h3
          className={`font-semibold text-white line-clamp-1 leading-tight ${
            size === "sm" ? "text-xs" : "text-sm"
          }`}
        >
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-white/40">{getYear(movie.releaseDate)}</span>
          {movie.genre && (
            <span className="text-xs text-white/30 truncate">{movie.genre.split(",")[0]}</span>
          )}
        </div>
      </div>
    </div>
  );
}
