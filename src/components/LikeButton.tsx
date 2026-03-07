// ============================================================
// ChefZone — LikeButton Component
// Heart button that toggles liked state with animation
// ============================================================
import React, { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  isLiked?: boolean;
  count: number;
  onToggle: () => void;
  disabled?: boolean;
  showCount?: boolean;
  size?: "sm" | "md";
}

/**
 * Animated heart button with like count.
 * When clicked triggers onToggle callback.
 */
const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked = false,
  count,
  onToggle,
  disabled = false,
  showCount = true,
  size = "md",
}) => {
  const [animating, setAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (disabled) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 350);
    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-label={isLiked ? "Quitar like" : "Dar like"}
      className={cn(
        "flex items-center gap-1.5 rounded-full transition-all duration-200 font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heart/50",
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
        isLiked
          ? "bg-heart/10 text-heart"
          : "bg-muted text-muted-foreground hover:bg-heart/10 hover:text-heart",
        disabled && "cursor-default opacity-70"
      )}
    >
      <Heart
        className={cn(
          "transition-all duration-200",
          size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
          isLiked && "fill-current",
          animating && "animate-pulse-heart"
        )}
      />
      {showCount && <span>{count}</span>}
    </button>
  );
};

export default LikeButton;
