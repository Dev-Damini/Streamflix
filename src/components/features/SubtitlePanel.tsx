import { Download, Subtitles, Globe } from "lucide-react";

interface SubtitleTrack {
  url: string;
  lang: string;
  label: string;
}

interface SubtitlePanelProps {
  /** Structured subtitle tracks from media API */
  tracks?: SubtitleTrack[];
  /** Comma-separated subtitle language names from movie metadata (fallback display) */
  subtitleString?: string;
}

// Map common language names / ISO codes → flag emoji
const LANG_FLAGS: Record<string, string> = {
  english: "🇬🇧",
  en: "🇬🇧",
  spanish: "🇪🇸",
  es: "🇪🇸",
  french: "🇫🇷",
  français: "🇫🇷",
  fr: "🇫🇷",
  portuguese: "🇵🇹",
  português: "🇵🇹",
  pt: "🇵🇹",
  german: "🇩🇪",
  de: "🇩🇪",
  italian: "🇮🇹",
  it: "🇮🇹",
  japanese: "🇯🇵",
  ja: "🇯🇵",
  korean: "🇰🇷",
  ko: "🇰🇷",
  chinese: "🇨🇳",
  "中文": "🇨🇳",
  zh: "🇨🇳",
  arabic: "🇸🇦",
  "اَلْعَرَبِيَّةُ": "🇸🇦",
  ar: "🇸🇦",
  russian: "🇷🇺",
  "русский": "🇷🇺",
  ru: "🇷🇺",
  hindi: "🇮🇳",
  hi: "🇮🇳",
  bengali: "🇧🇩",
  "বাংলা": "🇧🇩",
  bn: "🇧🇩",
  urdu: "🇵🇰",
  "اُردُو": "🇵🇰",
  ur: "🇵🇰",
  punjabi: "🇮🇳",
  "ਪੰਜਾਬੀ": "🇮🇳",
  indonesian: "🇮🇩",
  id: "🇮🇩",
  malay: "🇲🇾",
  ms: "🇲🇾",
  filipino: "🇵🇭",
  tl: "🇵🇭",
  thai: "🇹🇭",
  th: "🇹🇭",
  vietnamese: "🇻🇳",
  vi: "🇻🇳",
  turkish: "🇹🇷",
  tr: "🇹🇷",
  kiswahili: "🇰🇪",
  sw: "🇰🇪",
  khmer: "🇰🇭",
  "ខេមរភាសា": "🇰🇭",
  km: "🇰🇭",
};

function getFlag(lang: string): string {
  const key = lang.toLowerCase().trim();
  return LANG_FLAGS[key] ?? "🌐";
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function SubtitlePanel({ tracks, subtitleString }: SubtitlePanelProps) {
  const hasTracks = tracks && tracks.length > 0;

  // Build display-only language list from the subtitle string (comma-separated)
  const fallbackLangs = subtitleString
    ? subtitleString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  if (!hasTracks && fallbackLangs.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
          <Subtitles size={14} className="text-blue-400" />
        </div>
        <h3 className="text-sm font-bold text-white">Subtitles</h3>
        <span className="text-xs bg-blue-500/15 text-blue-400 border border-blue-500/25 rounded-full px-2 py-0.5 font-semibold">
          {hasTracks ? tracks!.length : fallbackLangs.length} languages
        </span>
      </div>

      {hasTracks ? (
        /* Downloadable subtitle tracks from API */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {tracks!.map((track, i) => (
            <a
              key={track.url || i}
              href={track.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/8 bg-white/3 hover:border-blue-500/40 hover:bg-blue-500/8 transition-all"
            >
              {/* Flag */}
              <span className="text-lg leading-none shrink-0">{getFlag(track.lang || track.label)}</span>

              {/* Label */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors truncate">
                  {track.label || capitalize(track.lang)}
                </p>
                {track.url && (
                  <p className="text-[10px] text-white/25 truncate">
                    {track.url.split(".").pop()?.toUpperCase() ?? "SUB"}
                  </p>
                )}
              </div>

              {/* Download icon */}
              <Download
                size={13}
                className="text-white/20 group-hover:text-blue-400 transition-colors shrink-0"
              />
            </a>
          ))}
        </div>
      ) : (
        /* Fallback: display-only language badges (no URL available from API) */
        <div>
          <p className="text-xs text-white/35 mb-3 flex items-center gap-1.5">
            <Globe size={11} />
            Available subtitle languages for this title. Download links load when you start watching.
          </p>
          <div className="flex flex-wrap gap-2">
            {fallbackLangs.map((lang, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/4 border border-white/8 text-xs text-white/60"
              >
                <span className="text-base leading-none">{getFlag(lang)}</span>
                <span className="font-medium">{lang}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
