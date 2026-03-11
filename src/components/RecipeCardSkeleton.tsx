import React from "react";

const RecipeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-card animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-52 bg-muted overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent"
          style={{
            backgroundSize: "200% 100%",
            animation: "shimmer 1.8s linear infinite",
          }}
        />
      </div>

      <div className="p-4 space-y-3">
        {/* Category badge */}
        <div className="h-5 w-20 rounded-full bg-muted" />

        {/* Title */}
        <div className="h-5 w-4/5 rounded bg-muted" />
        <div className="h-4 w-3/5 rounded bg-muted" />

        {/* Author row */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
          <div className="h-7 w-16 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
};

export default RecipeCardSkeleton;
