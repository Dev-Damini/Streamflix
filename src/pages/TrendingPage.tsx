import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Film, Tv } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import MovieCard from "@/components/features/MovieCard";
import SkeletonCard from "@/components/features/SkeletonCard";
import RatingFilter from "@/components/features/RatingFilter";
import LanguageFilter, { matchesLanguageFilter } from "@/components/features/LanguageFilter";
import { fetchTrending } from "@/lib/movieApi";
import type { Movie } from "@/types/movie";

export default function TrendingPage() {
  const [filterType, setFilterType] = useState<"ALL" | "1" | "2">("ALL");
  const [minRating, setMinRating] = useState(0);
  const [language, setLanguage] = useState("");

  const { data: trendingData, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: fetchTrending,
    staleTime: 1000 * 60 * 5,
  });

  const trending: Movie[] = trendingData?.subjectList || [];

  const typeFiltered =
    filterType === "ALL"
      ? trending
      : trending.filter((m) => String(m.subjectType) === filterType);

  const ratingFiltered =
    minRating === 0
      ? typeFiltered
      : typeFiltered.filter((m) => parseFloat(m.imdbRatingValue) >= minRating);

  const filtered = language
    ? ratingFiltered.filter((m) => matchesLanguageFilter(m, language))
    : ratingFiltered;

  const ratingCounts: Record<number, number> = {};
  [0, 5, 6, 7, 8, 9].forEach((r) => {
    ratingCounts[r] = r === 0 ? typeFiltered.length : typeFiltered.filter((m) => parseFloat(m.imdbRatingValue) >= r).length;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
            <TrendingUp size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Trending Now</h1>
            <p className="text-sm text-white/40">
              Showing <span className="text-white font-semibold">{filtered.length}</span> of {trending.length} titles
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-8">
          {/* Type filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "All", value: "ALL" },
              { label: "Movies", value: "1", icon: Film },
              { label: "Series", value: "2", icon: Tv },
            ].map(({ label, value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setFilterType(value as "ALL" | "1" | "2")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all min-h-[40px] ${
                  filterType === value
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "glass-card border border-white/10 text-white/60 hover:text-white hover:border-white/20"
                }`}
              >
                {Icon && <Icon size={14} />}
                {label}
              </button>
            ))}
          </div>

          {/* Rating filter */}
          <RatingFilter value={minRating} onChange={setMinRating} counts={ratingCounts} />

          {/* Language filter */}
          <LanguageFilter value={language} onChange={setLanguage} />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <SkeletonCard key={i} size="md" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 animate-fade-in">
            {filtered.map((movie, i) => (
              <div key={movie.subjectId} className="relative">
                {i < 3 && minRating === 0 && filterType === "ALL" && (
                  <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-black text-white shadow-lg shadow-primary/40">
                    {i + 1}
                  </div>
                )}
                <MovieCard movie={movie} size="md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 flex flex-col items-center gap-3">
            <p className="text-white/40">No content matches the current filters.</p>
            <button
              onClick={() => { setMinRating(0); setFilterType("ALL"); setLanguage(""); }}
              className="text-sm text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
