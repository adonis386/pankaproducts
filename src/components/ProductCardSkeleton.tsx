"use client";

interface ProductCardSkeletonProps {
  compact?: boolean;
}

export default function ProductCardSkeleton({ compact }: ProductCardSkeletonProps) {
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-[var(--shadow-editorial)] ${
        compact ? "min-w-[220px] max-w-[220px]" : ""
      }`}
    >
      <div className={`relative w-full animate-pulse bg-grey-5 ${compact ? "h-44" : "aspect-[4/3]"}`}>
        <div className="absolute left-4 top-4 h-6 w-16 rounded-lg bg-grey-10/70" />
        <div className="absolute bottom-4 right-4 h-10 w-10 rounded-xl bg-grey-10/70" />
      </div>

      <div className={`flex flex-1 flex-col ${compact ? "px-4 pb-4 pt-3" : "px-6 pb-6 pt-5"}`}>
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="h-6 w-[55%] rounded bg-grey-5 animate-pulse" />
          <div className="h-6 w-16 rounded bg-grey-5 animate-pulse" />
        </div>
        {!compact && <div className="mb-5 h-10 w-full rounded bg-grey-5 animate-pulse" />}
        {!compact && <div className="mt-auto h-11 w-full rounded-xl bg-grey-5 animate-pulse" />}
      </div>
    </article>
  );
}
