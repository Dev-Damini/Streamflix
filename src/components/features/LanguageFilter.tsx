import { useState } from "react";
import { Globe, ChevronDown, X } from "lucide-react";

interface LanguageFilterProps {
  value: string;
  onChange: (lang: string) => void;
  availableLangs?: string[];
}

// Common streaming languages with flag emojis
const POPULAR_LANGS = [
  { code: "english", label: "English", flag: "🇬🇧" },
  { code: "korean", label: "Korean", flag: "🇰🇷" },
  { code: "chinese", label: "Chinese", flag: "🇨🇳" },
  { code: "japanese", label: "Japanese", flag: "🇯🇵" },
  { code: "spanish", label: "Spanish", flag: "🇪🇸" },
  { code: "french", label: "French", flag: "🇫🇷" },
  { code: "hindi", label: "Hindi", flag: "🇮🇳" },
  { code: "arabic", label: "Arabic", flag: "🇸🇦" },
  { code: "portuguese", label: "Portuguese", flag: "🇵🇹" },
  { code: "thai", label: "Thai", flag: "🇹🇭" },
  { code: "turkish", label: "Turkish", flag: "🇹🇷" },
  { code: "indonesian", label: "Indonesian", flag: "🇮🇩" },
];

// Country → language mapping for filtering
const COUNTRY_LANG_MAP: Record<string, string[]> = {
  "united states": ["english"],
  "united kingdom": ["english"],
  "korea": ["korean"],
  "south korea": ["korean"],
  "china": ["chinese"],
  "japan": ["japanese"],
  "spain": ["spanish"],
  "mexico": ["spanish"],
  "france": ["french"],
  "india": ["hindi"],
  "saudi arabia": ["arabic"],
  "egypt": ["arabic"],
  "brazil": ["portuguese"],
  "portugal": ["portuguese"],
  "thailand": ["thai"],
  "turkey": ["turkish"],
  "indonesia": ["indonesian"],
};

export function matchesLanguageFilter(movie: { countryName?: string; subtitles?: string }, lang: string): boolean {
  if (!lang) return true;
  const countryLower = (movie.countryName || "").toLowerCase();
  const subtitlesLower = (movie.subtitles || "").toLowerCase();

  // Match by country → language
  for (const [country, langs] of Object.entries(COUNTRY_LANG_MAP)) {
    if (countryLower.includes(country) && langs.includes(lang)) return true;
  }

  // Match by subtitle language
  if (subtitlesLower.includes(lang)) return true;

  return false;
}

export default function LanguageFilter({ value, onChange, availableLangs }: LanguageFilterProps) {
  const [open, setOpen] = useState(false);

  const selected = POPULAR_LANGS.find((l) => l.code === value);

  const displayLangs = availableLangs
    ? POPULAR_LANGS.filter((l) => availableLangs.includes(l.code))
    : POPULAR_LANGS;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-white/40">
          <Globe size={14} className="text-blue-400" />
          <span className="text-xs font-medium">Language:</span>
        </div>

        {/* Trigger */}
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] border ${
            value
              ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
              : "glass-card border-white/10 text-white/60 hover:text-white hover:border-white/20"
          }`}
        >
          {selected ? (
            <>
              <span>{selected.flag}</span>
              <span>{selected.label}</span>
            </>
          ) : (
            <>
              <Globe size={11} />
              <span>All Languages</span>
            </>
          )}
          <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {/* Clear */}
        {value && (
          <button
            onClick={() => onChange("")}
            className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors px-2 py-1.5 min-h-[36px]"
          >
            <X size={10} />
            Clear
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-2 z-30 glass-dark border border-white/10 rounded-xl p-2 min-w-[220px] shadow-2xl shadow-black/60 animate-fade-in">
          {/* All option */}
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
              !value ? "bg-primary/20 text-primary" : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe size={14} />
            All Languages
          </button>
          <div className="h-px bg-white/5 my-1.5" />
          <div className="grid grid-cols-2 gap-0.5">
            {displayLangs.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { onChange(lang.code); setOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  value === lang.code
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-base leading-none">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
