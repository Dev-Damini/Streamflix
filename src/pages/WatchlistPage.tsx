import { Bookmark, Trash2, Film } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import MovieCard from "@/components/features/MovieCard";
import { useWatchlist } from "@/hooks/useWatchlist";

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useWatchlist();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
              <Bookmark size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">My Watchlist</h1>
              <p className="text-sm text-white/40">
                {watchlist.length} {watchlist.length === 1 ? "title" : "titles"} saved
              </p>
            </div>
          </div>
          {watchlist.length > 0 && (
            <span className="text-xs text-white/30 hidden sm:block">
              Click the bookmark icon on any card to remove
            </span>
          )}
        </div>

        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center mb-6">
              <Bookmark size={40} className="text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Your watchlist is empty</h3>
            <p className="text-sm text-white/40 max-w-sm mb-8">
              Browse movies and series and click the bookmark icon to save them here.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30"
            >
              <Film size={18} />
              Browse Content
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-6 animate-fade-in">
            {watchlist.map((movie) => (
              <div key={movie.subjectId} className="relative group/wrap">
                <MovieCard movie={movie} size="md" />
                <button
                  onClick={() => removeFromWatchlist(movie.subjectId)}
                  className="absolute -top-2 -left-2 z-20 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover/wrap:opacity-100 transition-all duration-200 hover:bg-red-500 shadow-lg"
                  title="Remove from watchlist"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
