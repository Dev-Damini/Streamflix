import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Search, Film, X, Menu, Bookmark, Grid3x3, Flame, TrendingUp } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { watchlist } = useWatchlist();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Movies", path: "/search?q=movie&type=1" },
    { label: "Series", path: "/search?q=series&type=2" },
    { label: "Trending", path: "/trending" },
    { label: "Hot", path: "/hot" },
    { label: "Genres", path: "/genres" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || searchOpen
          ? "bg-black/95 backdrop-blur-md shadow-lg shadow-black/50"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Film size={18} className="text-white" />
            </div>
            <span className="text-xl font-display tracking-widest text-gradient-red hidden sm:block">
              NICKFLIX
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  location.pathname === link.path.split("?")[0]
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar - Expanded */}
          {searchOpen ? (
            <form
              onSubmit={handleSearch}
              className="flex-1 flex items-center gap-2 animate-fade-in"
            >
              <div className="flex-1 flex items-center glass-dark rounded-lg px-3 py-2 border border-white/10">
                <Search size={16} className="text-white/50 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search movies, shows, actors..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/40 ml-2"
                />
              </div>
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setQuery(""); }}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Hot shortcut */}
              <Link
                to="/hot"
                className="hidden md:flex items-center gap-1 p-2 rounded-lg text-orange-400/70 hover:text-orange-400 hover:bg-orange-500/10 transition-colors min-h-[40px] min-w-[40px] text-xs font-semibold"
                aria-label="Hot"
              >
                <Flame size={16} />
              </Link>

              {/* Trending shortcut */}
              <Link
                to="/trending"
                className="hidden md:flex p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors min-h-[40px] min-w-[40px] items-center justify-center"
                aria-label="Trending"
              >
                <TrendingUp size={18} />
              </Link>

              {/* Genres shortcut */}
              <Link
                to="/genres"
                className="hidden md:flex p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors min-h-[40px] min-w-[40px] items-center justify-center"
                aria-label="Genres"
              >
                <Grid3x3 size={18} />
              </Link>

              {/* Watchlist */}
              <Link
                to="/watchlist"
                className="relative p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Watchlist"
              >
                <Bookmark size={20} />
                {watchlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                    {watchlist.length > 9 ? "9+" : watchlist.length}
                  </span>
                )}
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in border-t border-white/5 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/watchlist"
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Bookmark size={14} />
              My Watchlist
              {watchlist.length > 0 && (
                <span className="ml-auto text-xs bg-primary text-white rounded-full px-2 py-0.5">
                  {watchlist.length}
                </span>
              )}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
