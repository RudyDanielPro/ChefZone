// ============================================================
// ChefZone — RecipeCard Component
// Card showing recipe thumbnail, category, author, and likes
// ============================================================
import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ChefHat } from "lucide-react";
import UserAvatar from "./UserAvatar";
import LikeButton from "./LikeButton";
import { useAuth } from "@/contexts/AuthContext";
import { toggleLike } from "@/services/recipes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { RecipeCardData } from "@/types";

interface RecipeCardProps {
  recipe: RecipeCardData;
  onLikeUpdate?: (id: string, likesCount: number, isLiked: boolean) => void;
  className?: string;
}

/**
 * Recipe card with image overlay, category badge, author info, and like button.
 */
const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onLikeUpdate, className }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [likeState, setLikeState] = React.useState({
    isLiked: recipe.isLiked ?? false,
    count: recipe.likesCount,
    loading: false,
  });

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.info("Debes iniciar sesión para dar like", {
        action: { label: "Iniciar sesión", onClick: () => navigate("/login") },
      });
      return;
    }

    const prev = likeState;
    const next = {
      isLiked: !prev.isLiked,
      count: prev.isLiked ? prev.count - 1 : prev.count + 1,
    };
    setLikeState(s => ({ ...s, ...next }));

    try {
      const res = await toggleLike(recipe.id);
      setLikeState(s => ({ ...s, isLiked: res.isLiked, count: res.likesCount }));
      onLikeUpdate?.(recipe.id, res.likesCount, res.isLiked);
    } catch {
      setLikeState(prev);
      toast.error("No se pudo actualizar el like");
    }
  };

  const handleCardClick = () => {
    navigate(`/recipes/${recipe.id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && handleCardClick()}
      className={cn(
        "bg-card rounded-2xl overflow-hidden shadow-card cursor-pointer group",
        "hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1",
        "animate-fade-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
    >
      {/* Image area */}
      <div className="relative h-52 overflow-hidden bg-muted">
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-card-overlay opacity-70" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-card/90 text-primary backdrop-blur-sm">
            {recipe.category?.name}
          </span>
        </div>

        {/* Cooking time */}
        {recipe.cookingTime && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-foreground/60 text-primary-foreground backdrop-blur-sm">
              <Clock className="w-3 h-3" />
              {recipe.cookingTime}m
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground line-clamp-2 text-base leading-snug mb-3 group-hover:text-primary transition-colors">
          {recipe.title}
        </h3>

        {/* Author row + like */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <UserAvatar
              src={recipe.author?.profilePicture}
              name={`${recipe.author?.firstName} ${recipe.author?.lastName}`}
              size="xs"
            />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {recipe.author?.firstName} {recipe.author?.lastName}
              </p>
            </div>
          </div>

          <LikeButton
            isLiked={likeState.isLiked}
            count={likeState.count}
            onToggle={handleLike}
            size="sm"
          />
        </div>
      </div>
    </article>
  );
};

export default RecipeCard;
