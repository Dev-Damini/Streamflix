import { Star } from "lucide-react";

interface RatingFilterProps {
  value: number;
  onChange: (val: number) => void;
  counts?: Record<number, number>;
}

const RATINGS = [0, 5, 6, 7, 8, 9];

export default function RatingFilter({ value, onChange, counts }: RatingFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 text-white/40">
        <Star size={14} className="text-yellow-400" />
        <span className="text-xs font-medium">Min Rating:</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {RATINGS.map((rating) => (
          <button
            key={rating}
            onClick={() => onChange(rating)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px] border ${
              value === rating
                ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-sm shadow-yellow-500/20"
                : "glass-card border-white/10 text-white/50 hover:text-white hover:border-white/20"
            }`}
          >
            {rating === 0 ? (
              "All"
            ) : (
              <>
                <Star size={9} fill="currentColor" />
                {rating}+
              </>
            )}
            {counts && counts[rating] !== undefined && (
              <span className="ml-0.5 opacity-60 text-[10px]">({counts[rating]})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
