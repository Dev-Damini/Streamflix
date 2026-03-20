import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Movie } from "@/types/movie";
import { getYear, formatDuration } from "@/lib/movieApi";

interface HeroSectionProps {
  movies: Movie[];
}

export default function HeroSection({ movies }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const navigate = useNavigate();

  const featured = movies.slice(0, 6);
  const current = featured[currentIndex];

  const goTo = useCallback(
    (index: number) => {
      if (transitioning) return;
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setTransitioning(false);
      }, 300);
    },
    [transitioning]
  );

  const next = useCallback(() => {
    goTo((currentIndex + 1) % featured.length);
  }, [currentIndex, featured.length, goTo]);

  const prev = useCallback(() => {
    goTo((currentIndex - 1 + featured.length) % featured.length);
  }, [currentIndex, featured.length, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  if (!current) return null;

  const rating = parseFloat(current.imdbRatingValue);
  const genres = current.genre ? current.genre.split(",").slice(0, 3) : [];

  const handleWatch = () => {
    navigate(`/movie/${encodeURIComponent(current.detailPath)}`, {
      state: { movie: current },
    });
  };

  const handleDetails = () => {
    navigate(`/movie/${encodeURIComponent(current.detailPath)}`, {
      state: { movie: current },
    });
  };

  // Use stills or cover as backdrop
  const backdropUrl = current.stills?.url || current.cover?.url;

  return (
    <div className="relative w-full h-[70vh] min-h-[520px] max-h-[780px] overflow-hidden">
      {/* Background Image */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          transitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {backdropUrl && (
          <img
            src={backdropUrl}
            alt={current.title}
            className="w-full h-full object-cover object-center"
          />
        )}
        {/* Gradients */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-x-0 bottom-0 h-40 hero-gradient-bottom" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div
        className={`relative h-full flex items-end pb-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto transition-all duration-500 ${
          transitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="max-w-xl">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded">
              {current.subjectType === 1 ? "MOVIE" : "SERIES"}
            </span>
            {current.countryName && (
              <span className="glass-dark text-white/80 text-xs px-2.5 py-1 rounded">
                {current.countryName}
              </span>
            )}
            {rating > 0 && (
              <div className="flex items-center gap-1 glass-dark px-2.5 py-1 rounded">
                <Star size={12} fill="#facc15" className="rating-gold" />
                <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
                {current.imdbRatingCount > 0 && (
                  <span className="text-xs text-white/50">
                    ({(current.imdbRatingCount / 1000).toFixed(0)}K)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-2">
            {current.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-white/60 mb-3">
            <span>{getYear(current.releaseDate)}</span>
            {current.duration > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>{formatDuration(current.duration)}</span>
              </>
            )}
          </div>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="flex gap-2 mb-4">
              {genres.map((g) => (
                <span
                  key={g}
                  className="text-xs text-white/70 border border-white/20 px-2.5 py-0.5 rounded-full"
                >
                  {g.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {current.description && (
            <p className="text-sm text-white/60 line-clamp-2 mb-5 leading-relaxed">
              {current.description}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleWatch}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 active:scale-95 min-h-[44px]"
            >
              <Play size={18} fill="white" />
              Watch Now
            </button>
            <button
              onClick={handleDetails}
              className="flex items-center gap-2 glass-dark hover:bg-white/10 text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 border border-white/10 hover:border-white/20 min-h-[44px]"
            >
              <Info size={18} />
              More Info
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {featured.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-dark flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-dark flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {featured.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentIndex
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
