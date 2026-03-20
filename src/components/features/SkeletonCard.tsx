export default function SkeletonCard({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-[140px]",
    md: "w-[180px]",
    lg: "w-[220px]",
  };

  const imgHeightClasses = {
    sm: "h-[210px]",
    md: "h-[270px]",
    lg: "h-[330px]",
  };

  return (
    <div className={`${sizeClasses[size]} shrink-0`}>
      <div className={`${imgHeightClasses[size]} rounded-xl shimmer`} />
      <div className="mt-2 space-y-1.5">
        <div className="h-3.5 rounded shimmer w-4/5" />
        <div className="h-3 rounded shimmer w-2/5" />
      </div>
    </div>
  );
}
