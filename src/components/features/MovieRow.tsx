import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";
import type { Movie } from "@/types/movie";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  size?: "sm" | "md" | "lg";
  badge?: string;
}

export default function MovieRow({ title, movies, size = "md", badge }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (rowRef.current) {
      const amount = dir === "left" ? -600 : 600;
      rowRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
          {badge && (
            <span className="text-xs font-semibold bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {/* Scroll Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable Row */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-2"
      >
        {movies.map((movie) => (
          <MovieCard key={movie.subjectId} movie={movie} size={size} />
        ))}
      </div>
    </section>
  );
}
