import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  suggestions?: string[];
  className?: string;
}

export default function SearchBar({
  defaultValue = "",
  placeholder = "Search movies, series, actors...",
  onSearch,
  suggestions = [],
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (onSearch) {
      onSearch(query.trim());
    } else {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestion = (term: string) => {
    setQuery(term);
    if (onSearch) {
      onSearch(term);
    } else {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center glass-card rounded-xl border border-white/10 focus-within:border-primary/50 transition-colors overflow-hidden">
          <Search size={18} className="ml-4 text-white/40 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent py-3 px-3 text-white placeholder:text-white/30 outline-none text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-2 mr-1 text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-3 transition-colors min-h-[44px]"
          >
            Search
          </button>
        </div>
      </form>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-white/30 self-center">Popular:</span>
          {suggestions.slice(0, 8).map((s, i) => (
            <button
              key={i}
              onClick={() => handleSuggestion(s)}
              className="text-xs px-3 py-1 glass-card rounded-full border border-white/10 text-white/60 hover:text-white hover:border-primary/40 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
