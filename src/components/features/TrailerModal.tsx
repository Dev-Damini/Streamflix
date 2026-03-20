import { useEffect, useRef } from "react";
import { X, Play, ExternalLink, Youtube } from "lucide-react";

interface TrailerModalProps {
  title: string;
  onClose: () => void;
}

export default function TrailerModal({ title, onClose }: TrailerModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const searchQuery = `${title} official trailer`;
  const encodedQuery = encodeURIComponent(searchQuery);

  // YouTube search URL (opens in new tab)
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;

  // Use Piped (privacy-friendly YouTube frontend) which allows embedding search results
  const pipedSearchUrl = `https://piped.video/search?q=${encodedQuery}&filter=videos`;

  // Invidious embed search
  const invidiousSrc = `https://invidious.privacydev.net/search?q=${encodedQuery}`;

  const popularInstances = [
    { label: "YouTube", url: youtubeSearchUrl, icon: "▶" },
    { label: "Piped", url: pipedSearchUrl, icon: "🎬" },
    { label: "Invidious", url: invidiousSrc, icon: "🔍" },
  ];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/92 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Play size={16} className="text-primary" fill="currentColor" />
            <span className="text-sm font-bold text-white">Trailer — {title}</span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main card */}
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden p-8 text-center">
          {/* Movie poster placeholder */}
          <div className="w-20 h-20 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-5">
            <Youtube size={36} className="text-primary/70" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">Watch Trailer</h3>
          <p className="text-sm text-white/50 mb-6">
            Search for "{title} official trailer" on your preferred platform.
          </p>

          {/* Platform buttons */}
          <div className="flex flex-col gap-3">
            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-5 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Youtube size={20} />
                <span>Search on YouTube</span>
              </div>
              <ExternalLink size={14} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            </a>

            <a
              href={pipedSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-5 py-3 glass-dark border border-white/10 hover:border-white/20 text-white/70 hover:text-white rounded-xl text-sm font-medium transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">🎬</span>
                <span>Search on Piped (ad-free)</span>
              </div>
              <ExternalLink size={13} className="opacity-40 group-hover:opacity-80 transition-opacity" />
            </a>
          </div>

          <p className="text-xs text-white/25 mt-5">
            Searching: "{searchQuery}"
          </p>
        </div>
      </div>
    </div>
  );
}
