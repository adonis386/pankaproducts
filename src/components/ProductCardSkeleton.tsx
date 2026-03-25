"use client";

interface ProductCardSkeletonProps {
  compact?: boolean;
}

export default function ProductCardSkeleton({ compact }: ProductCardSkeletonProps) {
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl bg-white ${
        compact ? "min-w-[220px] max-w-[220px]" : ""
      }`}
    >
      <div className={`relative overflow-hidden ${compact ? "h-44" : "h-56"} bg-grey-5 animate-pulse`}>
        <div className="absolute left-3 top-3 h-6 w-16 rounded-lg bg-grey-10/70" />
        <div className="absolute bottom-3 right-3 h-10 w-10 rounded-xl bg-grey-10/70" />
      </div>

      <div className={`flex flex-1 flex-col ${compact ? "p-3.5" : "p-4"}`}>
        <div className="mb-3 h-4 w-[70%] rounded bg-grey-5 animate-pulse" />
        {!compact && <div className="mb-4 h-20 w-full rounded bg-grey-5 animate-pulse" />}
        <div className="mt-auto flex items-center justify-between">
          <div className={`h-5 w-20 rounded bg-grey-5 animate-pulse`} />
          {!compact && <div className="h-10 w-28 rounded bg-grey-5 animate-pulse" />}
        </div>
      </div>
    </article>
  );
}

