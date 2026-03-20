import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Swords, Laugh, Heart, Skull, Ghost, Rocket, Search, Film, Tv,
  Music, BookOpen, Globe, Zap, ChevronLeft, Grid3x3,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import MovieCard from "@/components/features/MovieCard";
import SkeletonCard from "@/components/features/SkeletonCard";
import RatingFilter from "@/components/features/RatingFilter";
import LanguageFilter, { matchesLanguageFilter } from "@/components/features/LanguageFilter";
import { searchMovies } from "@/lib/movieApi";
import type { Movie } from "@/types/movie";

const GENRES = [
  { slug: "action", label: "Action", icon: Swords, color: "from-red-600/30 to-orange-600/20", border: "border-red-500/30", accent: "text-red-400" },
  { slug: "comedy", label: "Comedy", icon: Laugh, color: "from-yellow-500/30 to-amber-600/20", border: "border-yellow-500/30", accent: "text-yellow-400" },
  { slug: "romance", label: "Romance", icon: Heart, color: "from-pink-600/30 to-rose-600/20", border: "border-pink-500/30", accent: "text-pink-400" },
  { slug: "thriller", label: "Thriller", icon: Skull, color: "from-gray-600/30 to-slate-700/20", border: "border-gray-500/30", accent: "text-gray-300" },
  { slug: "horror", label: "Horror", icon: Ghost, color: "from-purple-800/30 to-violet-900/20", border: "border-purple-600/30", accent: "text-purple-400" },
  { slug: "sci-fi", label: "Sci-Fi", icon: Rocket, color: "from-cyan-600/30 to-blue-700/20", border: "border-cyan-500/30", accent: "text-cyan-400" },
  { slug: "drama", label: "Drama", icon: BookOpen, color: "from-indigo-600/30 to-blue-700/20", border: "border-indigo-500/30", accent: "text-indigo-400" },
  { slug: "animation", label: "Animation", icon: Zap, color: "from-green-600/30 to-teal-700/20", border: "border-green-500/30", accent: "text-green-400" },
  { slug: "documentary", label: "Documentary", icon: Globe, color: "from-blue-600/30 to-sky-700/20", border: "border-blue-500/30", accent: "text-blue-400" },
  { slug: "music", label: "Music", icon: Music, color: "from-fuchsia-600/30 to-purple-700/20", border: "border-fuchsia-500/30", accent: "text-fuchsia-400" },
  { slug: "adventure", label: "Adventure", icon: Search, color: "from-orange-600/30 to-amber-700/20", border: "border-orange-500/30", accent: "text-orange-400" },
  { slug: "mystery", label: "Mystery", icon: Search, color: "from-teal-600/30 to-cyan-800/20", border: "border-teal-500/30", accent: "text-teal-400" },
];

function GenreGrid() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Grid3x3 size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Browse by Genre</h1>
            <p className="text-sm text-white/40">Pick a genre to explore</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {GENRES.map(({ slug, label, icon: Icon, color, border, accent }) => (
            <Link
              key={slug}
              to={`/genres/${slug}`}
              className={`relative overflow-hidden rounded-2xl border ${border} bg-gradient-to-br ${color} p-6 flex flex-col gap-3 hover:scale-[1.03] transition-transform duration-200 group min-h-[120px]`}
            >
              <Icon size={28} className={`${accent} group-hover:scale-110 transition-transform duration-200`} />
              <span className="text-lg font-bold text-white">{label}</span>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/3 group-hover:bg-white/5 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function GenreResults({ genre }: { genre: string }) {
  const [filterType, setFilterType] = useState<"ALL" | "1" | "2">("ALL");
  const [minRating, setMinRating] = useState(0);
  const [language, setLanguage] = useState("");

  const genreInfo = GENRES.find((g) => g.slug === genre);
  const label = genreInfo?.label || genre;

  const { data: searchData, isLoading } = useQuery({
    queryKey: ["genre", genre],
    queryFn: () => searchMovies(label),
    staleTime: 1000 * 60 * 5,
  });

  const allResults: Movie[] = searchData?.items || [];

  const typeFiltered =
    filterType === "ALL"
      ? allResults
      : allResults.filter((m) => String(m.subjectType) === filterType);

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

  const Icon = genreInfo?.icon || Film;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/genres"
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Genres
          </Link>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${genreInfo?.color || "from-primary/20 to-primary/10"} border ${genreInfo?.border || "border-primary/30"}`}
            >
              <Icon size={20} className={genreInfo?.accent || "text-primary"} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{label}</h1>
              <p className="text-sm text-white/40">
                {filtered.length > 0 ? `${filtered.length} titles` : allResults.length > 0 ? "Refine filters" : "Browsing..."}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "All", value: "ALL" },
              { label: "Movies", value: "1", icon: Film },
              { label: "Series", value: "2", icon: Tv },
            ].map(({ label: lbl, value, icon: FilterIcon }) => (
              <button
                key={value}
                onClick={() => setFilterType(value as "ALL" | "1" | "2")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all min-h-[40px] ${
                  filterType === value
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "glass-card border border-white/10 text-white/60 hover:text-white"
                }`}
              >
                {FilterIcon && <FilterIcon size={14} />}
                {lbl}
              </button>
            ))}
          </div>
          <RatingFilter value={minRating} onChange={setMinRating} counts={ratingCounts} />
          <LanguageFilter value={language} onChange={setLanguage} />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} size="md" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 animate-fade-in">
            {filtered.map((movie) => (
              <MovieCard key={movie.subjectId} movie={movie} size="md" />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 flex flex-col items-center gap-3">
            <p className="text-white/40">No results match the current filters.</p>
            {(minRating > 0 || language) && (
              <button
                onClick={() => { setMinRating(0); setLanguage(""); }}
                className="text-sm text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GenrePage() {
  const { genre } = useParams<{ genre?: string }>();
  if (genre) return <GenreResults genre={genre} />;
  return <GenreGrid />;
}
