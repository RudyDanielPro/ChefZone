import React, { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  isLiked: boolean;
  count: number;
  onToggle: (e?: React.MouseEvent) => Promise<void>;
  disabled?: boolean;
  size?: "sm" | "md";
}

const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  count,
  onToggle,
  disabled = false,
  size = "md",
}) => {
  const [isPending, setIsPending] = useState(false);
  const RED_COLOR = "#dc2626";

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (disabled || isPending) return;

    setIsPending(true);
    try {
      await onToggle(e); // Espera a que la tarjeta o el detalle hagan la llamada al backend
    } catch (error) {
      console.error("Error en like:", error);
    } finally {
      setIsPending(false); // Ahora sí se ejecutará porque el componente no fue destruido
    }
  };

  return (
    <button
      // ❌ ELIMINADO: key={isLiked ? "liked" : "unliked"}
      type="button"
      onClick={handleLike}
      disabled={disabled || isPending}
      className={cn(
        "group flex items-center justify-center gap-2 rounded-full transition-all duration-300 border shadow-sm active:scale-95",
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm",
        isLiked 
          ? "bg-red-50 border-red-200" 
          : "bg-secondary/40 border-transparent hover:bg-red-50",
        isPending && "opacity-80 cursor-wait"
      )}
      style={{ color: isLiked ? RED_COLOR : undefined }}
    >
      <div className="relative flex items-center justify-center">
        {isPending ? (
          <Loader2 className={cn("animate-spin text-muted-foreground", size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />
        ) : (
          <Heart
            className={cn(
              "transition-all duration-300",
              size === "sm" ? "w-4 h-4" : "w-5 h-5",
              isLiked ? "scale-110" : ""
            )}
            fill={isLiked ? RED_COLOR : "none"}
            stroke={isLiked ? RED_COLOR : "currentColor"}
            strokeWidth={isLiked ? 2.5 : 2}
          />
        )}
      </div>
      
      <span 
        className="font-bold tabular-nums tracking-tight transition-colors duration-300"
        style={{ color: isLiked ? RED_COLOR : "inherit" }}
      >
        {count}
      </span>
    </button>
  );
};

export default LikeButton;