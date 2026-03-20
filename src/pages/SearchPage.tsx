import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Film, Tv, X, Clock, History } from "lucide-react";
import LanguageFilter, { matchesLanguageFilter } from "@/components/features/LanguageFilter";
import Navbar from "@/components/layout/Navbar";
import MovieCard from "@/components/features/MovieCard";
import SkeletonCard from "@/components/features/SkeletonCard";
import SearchBar from "@/components/features/SearchBar";
import RatingFilter from "@/components/features/RatingFilter";
import { searchMovies, fetchPopularSearches } from "@/lib/movieApi";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import type { Movie } from "@/types/movie";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get("q") || "";
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState<"ALL" | "1" | "2">("ALL");
  const [minRating, setMinRating] = useState(0);
  const [language, setLanguage] = useState("");
  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setActiveQuery(q);
  }, [searchParams]);

  const handleSearch = (query: string) => {
    setActiveQuery(query);
    if (query.trim()) addSearch(query.trim());
    navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
  };

  const { data: searchData, isLoading, isFetching } = useQuery({
    queryKey: ["search", activeQuery],
    queryFn: () => searchMovies(activeQuery),
    enabled: !!activeQuery && activeQuery.length >= 2,
    staleTime: 1000 * 60 * 3,
  });

  const { data: popularSearches } = useQuery({
    queryKey: ["popular-searches"],
    queryFn: fetchPopularSearches,
    staleTime: 1000 * 60 * 10,
  });

  const suggestions = Array.isArray(popularSearches)
    ? (popularSearches as string[]).slice(0, 8)
    : [];

  const allResults: Movie[] = searchData?.items || [];

  // Apply type filter
  const typeFiltered =
    filterType === "ALL"
      ? allResults
      : allResults.filter((m) => String(m.subjectType) === filterType);

  // Apply rating filter
  const ratingFiltered =
    minRating === 0
      ? typeFiltered
      : typeFiltered.filter((m) => parseFloat(m.imdbRatingValue) >= minRating);

  // Apply language filter
  const filteredResults = language
    ? ratingFiltered.filter((m) => matchesLanguageFilter(m, language))
    : ratingFiltered;

  // Counts per rating threshold for the filter pills
  const ratingCounts: Record<number, number> = {};
  [0, 5, 6, 7, 8, 9].forEach((r) => {
    ratingCounts[r] = r === 0 ? typeFiltered.length : typeFiltered.filter((m) => parseFloat(m.imdbRatingValue) >= r).length;
  });

  const totalCount = searchData?.pager?.totalCount || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
            {activeQuery ? (
              <>
                Results for{" "}
                <span className="text-gradient-red">"{activeQuery}"</span>
              </>
            ) : (
              "Discover Content"
            )}
          </h1>
          {totalCount > 0 && (
            <p className="text-sm text-white/40">
              {filteredResults.length} of {totalCount.toLocaleString()} titles shown
            </p>
          )}
        </div>

        {/* Search Bar */}
        <SearchBar
          defaultValue={activeQuery}
          onSearch={handleSearch}
          suggestions={suggestions}
          className="mb-6"
        />

        {/* Search History */}
        {!activeQuery && history.length > 0 && (
          <div className="mb-8 glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-white/50">
                <History size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">Recent Searches</span>
              </div>
              <button
                onClick={clearHistory}
                className="text-xs text-white/30 hover:text-primary transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((q) => (
                <div key={q} className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full pl-3 pr-1 py-1 group">
                  <button
                    onClick={() => handleSearch(q)}
                    className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
                  >
                    <Clock size={10} className="text-white/30" />
                    {q}
                  </button>
                  <button
                    onClick={() => removeSearch(q)}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-colors ml-1"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters row */}
        {allResults.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            {/* Type filter */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-white/40" />
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: "All", value: "ALL", icon: null },
                  { label: "Movies", value: "1", icon: Film },
                  { label: "Series", value: "2", icon: Tv },
                ].map(({ label, value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setFilterType(value as "ALL" | "1" | "2")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
                      filterType === value
                        ? "bg-primary text-white"
                        : "glass-card border border-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    {Icon && <Icon size={12} />}
                    {label}
                    {value !== "ALL" && (
                      <span className="text-[10px] opacity-60">
                        ({allResults.filter((m) => String(m.subjectType) === value).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating filter */}
            <RatingFilter value={minRating} onChange={setMinRating} counts={ratingCounts} />

            {/* Language filter */}
            <LanguageFilter value={language} onChange={setLanguage} />
          </div>
        )}

        {/* Result count after filter */}
        {allResults.length > 0 && (minRating > 0 || filterType !== "ALL") && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-white/40">
              Showing <span className="text-white font-semibold">{filteredResults.length}</span> result{filteredResults.length !== 1 ? "s" : ""}
            </span>
            {(minRating > 0 || filterType !== "ALL") && (
              <button
                onClick={() => { setMinRating(0); setFilterType("ALL"); setLanguage(""); }}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <X size={10} />
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {(isLoading || isFetching) && activeQuery && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} size="md" />
            ))}
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && filteredResults.length > 0 && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6">
              {filteredResults.map((movie) => (
                <MovieCard key={movie.subjectId} movie={movie} size="md" />
              ))}
            </div>
          </div>
        )}

        {/* Empty State - no results after filter */}
        {!isLoading && activeQuery && typeFiltered.length > 0 && filteredResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-white/50 mb-3">No titles with {minRating}+ rating found.</p>
            <button onClick={() => setMinRating(0)} className="text-sm text-primary hover:underline">
              Remove rating filter
            </button>
          </div>
        )}

        {/* Empty State - no results at all */}
        {!isLoading && activeQuery && allResults.length === 0 && !isFetching && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Search size={28} className="text-white/20" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No results found</h3>
            <p className="text-sm text-white/40 max-w-sm">
              We couldn't find anything for "{activeQuery}". Try different keywords.
            </p>
          </div>
        )}

        {/* No Query State */}
        {!activeQuery && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <Search size={32} className="text-primary/60" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Search for anything</h3>
            <p className="text-sm text-white/40 max-w-sm">
              Find movies, TV series, documentaries, and more from thousands of titles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
