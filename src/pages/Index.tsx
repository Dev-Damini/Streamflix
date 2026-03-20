import { useQuery } from "@tanstack/react-query";
import { Film, TrendingUp, Flame, Clock, BookmarkCheck, Grid3x3 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/features/HeroSection";
import MovieRow from "@/components/features/MovieRow";
import SkeletonCard from "@/components/features/SkeletonCard";
import SearchBar from "@/components/features/SearchBar";
import MovieCard from "@/components/features/MovieCard";
import { fetchTrending, fetchHotMovies, fetchPopularSearches } from "@/lib/movieApi";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import { useWatchlist } from "@/hooks/useWatchlist";

export default function Index() {
  const {
    data: trendingData,
    isLoading: trendingLoading,
  } = useQuery({
    queryKey: ["trending"],
    queryFn: fetchTrending,
    staleTime: 1000 * 60 * 5,
  });

  const { data: hotMovies, isLoading: hotLoading } = useQuery({
    queryKey: ["hot"],
    queryFn: fetchHotMovies,
    staleTime: 1000 * 60 * 5,
  });

  const { data: popularSearches } = useQuery({
    queryKey: ["popular-searches"],
    queryFn: fetchPopularSearches,
    staleTime: 1000 * 60 * 10,
  });

  const { items: continueWatching } = useContinueWatching();
  const { watchlist } = useWatchlist();

  const trending = trendingData?.subjectList || [];
  const movies = trending.filter((m) => m.subjectType === 1);
  const series = trending.filter((m) => m.subjectType === 2);
  const heroMovies = trending.filter((m) => m.cover?.url);

  const suggestions = Array.isArray(popularSearches)
    ? (popularSearches as string[]).slice(0, 8)
    : [];

  const GENRES_PREVIEW = [
    { slug: "action", label: "Action", color: "from-red-600/40 to-red-900/20", border: "border-red-500/30" },
    { slug: "comedy", label: "Comedy", color: "from-yellow-500/40 to-yellow-900/20", border: "border-yellow-500/30" },
    { slug: "sci-fi", label: "Sci-Fi", color: "from-cyan-600/40 to-cyan-900/20", border: "border-cyan-500/30" },
    { slug: "horror", label: "Horror", color: "from-purple-700/40 to-purple-900/20", border: "border-purple-600/30" },
    { slug: "romance", label: "Romance", color: "from-pink-600/40 to-pink-900/20", border: "border-pink-500/30" },
    { slug: "thriller", label: "Thriller", color: "from-gray-600/40 to-gray-900/20", border: "border-gray-500/30" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      {trendingLoading ? (
        <div className="h-[70vh] min-h-[520px] shimmer" />
      ) : (
        heroMovies.length > 0 && <HeroSection movies={heroMovies} />
      )}

      {/* Search Bar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchBar
          placeholder="Search thousands of movies & shows..."
          suggestions={suggestions}
        />
      </div>

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <section className="mb-2">
          <div className="flex items-center gap-2 mb-1 px-4 sm:px-6 lg:px-8">
            <Clock size={16} className="text-blue-400" />
            <span className="text-xs text-white/40 font-medium uppercase tracking-wider">
              Pick up where you left off
            </span>
          </div>
          <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Continue Watching</h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-2">
            {continueWatching.map((item) => (
              <div key={item.movie.subjectId} className="shrink-0">
                <MovieCard movie={item.movie} size="md" showProgress />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My Watchlist Peek */}
      {watchlist.length > 0 && (
        <section className="mb-2">
          <div className="flex items-center gap-2 mb-1 px-4 sm:px-6 lg:px-8">
            <BookmarkCheck size={16} className="text-primary" />
            <span className="text-xs text-white/40 font-medium uppercase tracking-wider">
              Your saved titles
            </span>
          </div>
          <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h2 className="text-lg sm:text-xl font-bold text-white">My Watchlist</h2>
              <span className="text-xs font-semibold bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">
                {watchlist.length}
              </span>
            </div>
            <Link
              to="/watchlist"
              className="text-xs text-white/40 hover:text-primary transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-2">
            {watchlist.slice(0, 8).map((movie) => (
              <div key={movie.subjectId} className="shrink-0">
                <MovieCard movie={movie} size="md" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Genre Quick Browse */}
      <section className="mb-10 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Browse Genres</h2>
            <Grid3x3 size={16} className="text-white/40" />
          </div>
          <Link to="/genres" className="text-xs text-white/40 hover:text-primary transition-colors">
            All genres →
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {GENRES_PREVIEW.map(({ slug, label, color, border }) => (
            <Link
              key={slug}
              to={`/genres/${slug}`}
              className={`bg-gradient-to-br ${color} border ${border} rounded-xl px-3 py-3 text-center text-sm font-semibold text-white hover:scale-105 transition-transform duration-200`}
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section className="mb-2">
        <div className="flex items-center gap-2 mb-4 px-4 sm:px-6 lg:px-8">
          <TrendingUp size={18} className="text-primary" />
          <span className="text-xs text-white/40 font-medium uppercase tracking-wider">
            Updated Daily
          </span>
        </div>
        {trendingLoading ? (
          <div className="flex gap-4 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} size="md" />
            ))}
          </div>
        ) : (
          <MovieRow
            title="Trending Now"
            movies={trending}
            size="md"
            badge={`${trending.length} titles`}
          />
        )}
      </section>

      {/* Hot Movies */}
      {(hotLoading || (hotMovies && hotMovies.length > 0)) && (
        <section className="mb-2">
          <div className="flex items-center gap-2 mb-4 px-4 sm:px-6 lg:px-8">
            <Flame size={18} className="text-orange-400" />
            <span className="text-xs text-white/40 font-medium uppercase tracking-wider">
              Most Watched
            </span>
          </div>
          {hotLoading ? (
            <div className="flex gap-4 px-4 sm:px-6 lg:px-8 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} size="md" />
              ))}
            </div>
          ) : (
            <MovieRow title="Hot & Popular" movies={hotMovies || []} size="md" />
          )}
        </section>
      )}

      {/* Movies Only */}
      {movies.length > 0 && (
        <MovieRow title="Movies" movies={movies} size="md" badge="Films" />
      )}

      {/* Series Only */}
      {series.length > 0 && (
        <MovieRow title="TV Series" movies={series} size="md" badge="Shows" />
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-white/5 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
                <Film size={14} className="text-white" />
              </div>
              <span className="text-lg font-display tracking-widest text-gradient-red">
                STREAMFLIX
              </span>
            </div>
            <p className="text-xs text-white/25 text-center">
              Stream your favorite movies and TV shows in HD. New content added daily.
            </p>
            <p className="text-xs text-white/20">© 2026 Streamflix</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
