import { useEffect, useRef, useState } from "react";
import { X, Play, ExternalLink, Youtube, Loader2, AlertCircle } from "lucide-react";

interface TrailerModalProps {
  title: string;
  trailerUrl?: string; // YouTube URL from API, e.g. https://m.youtube.com/watch?v=XXXX
  onClose: () => void;
}

function extractYoutubeId(url?: string): string | null {
  if (!url) return null;
  // Handles: youtube.com/watch?v=ID, youtu.be/ID, m.youtube.com/watch?v=ID
  const patterns = [
    /[?&]v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /embed\/([^?&#]+)/,
    /shorts\/([^?&#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}

export default function TrailerModal({ title, trailerUrl, onClose }: TrailerModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  const videoId = extractYoutubeId(trailerUrl);
  const embedSrc = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " official trailer")}`;
  const youtubeWatchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : youtubeSearchUrl;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/92 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-3xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Play size={14} className="text-primary" fill="currentColor" />
            <span className="text-sm font-bold text-white truncate max-w-[250px] sm:max-w-md">
              {title} — Trailer
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={youtubeWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors px-3 py-1.5 rounded-lg glass-card border border-white/10"
            >
              <ExternalLink size={12} />
              Open
            </a>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Player */}
        {embedSrc && !iframeError ? (
          <div className="rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl shadow-black/80">
            {/* 16:9 */}
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              {iframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-primary animate-spin" />
                    <p className="text-white/40 text-sm">Loading trailer...</p>
                  </div>
                </div>
              )}
              <iframe
                key={embedSrc}
                src={embedSrc}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                onLoad={() => setIframeLoading(false)}
                onError={() => { setIframeLoading(false); setIframeError(true); }}
                title={`${title} trailer`}
              />
            </div>

            {/* Footer bar */}
            <div className="bg-[#0a0a0a] px-4 py-2.5 flex items-center justify-between border-t border-white/5">
              <div className="flex items-center gap-2">
                <Youtube size={14} className="text-red-500" />
                <span className="text-xs text-white/40">Official Trailer</span>
              </div>
              <a
                href={youtubeWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
              >
                <ExternalLink size={11} />
                YouTube
              </a>
            </div>
          </div>
        ) : (
          /* Fallback — no video ID or iframe error */
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-5">
              {iframeError ? (
                <AlertCircle size={36} className="text-primary/70" />
              ) : (
                <Youtube size={36} className="text-primary/70" />
              )}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {iframeError ? "Couldn't Load Trailer" : "Watch Trailer"}
            </h3>
            <p className="text-sm text-white/50 mb-6">
              {iframeError
                ? "YouTube blocked the embed. Open it directly instead."
                : `Find the official trailer for "${title}" on YouTube.`}
            </p>
            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-colors"
            >
              <Youtube size={18} />
              Search on YouTube
              <ExternalLink size={13} className="opacity-70" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
