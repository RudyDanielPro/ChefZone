// ============================================================
// ChefZone — RecipeCard Component (FINAL - BLINDADO)
// ============================================================
import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import UserAvatar from "./UserAvatar";
import LikeButton from "./LikeButton";
import { useAuth } from "@/contexts/AuthContext";
import { darLike } from "@/services/recipes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { RecetaResumen } from "@/types";

interface RecipeCardProps {
  recipe: RecetaResumen;
  onLikeUpdate?: (id: number, cantidadLikes: number, liked: boolean) => void;
  className?: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onLikeUpdate, className }) => {
  const navigate = useNavigate();
  const { autenticado } = useAuth();

  // Estado interno sincronizado con los nombres del Backend
  const [likeState, setLikeState] = React.useState({
    liked: recipe.likedByCurrentUser ?? false,
    count: recipe.cantidadLikes || 0,
  });

  // EFECTO BLINDADO: Solo observamos el ID de la receta.
  // Esto evita que si el padre renderiza con datos viejos, nos borre el estado local del like.
  React.useEffect(() => {
    setLikeState({
      liked: recipe.likedByCurrentUser ?? false,
      count: recipe.cantidadLikes || 0,
    });
  }, [recipe.id]);

  /**
   * Manejador de Like con Actualización Optimista
   */
  const handleLike = async (e?: React.MouseEvent) => {
    if (e?.stopPropagation) e.stopPropagation();
    if (e?.preventDefault) e.preventDefault();

    if (!autenticado) {
      toast.info("Inicia sesión para dar like");
      return;
    }

    // 1. ACTUALIZACIÓN OPTIMISTA: Cambia en la pantalla INMEDIATAMENTE
    const prevLiked = likeState.liked;
    const prevCount = likeState.count;

    setLikeState({
      liked: !prevLiked,
      count: prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1
    });

    try {
      // 2. PETICIÓN REAL AL BACKEND
      const res = await darLike(recipe.id); 
    
      // 3. SINCRONIZACIÓN: Confirmamos con los datos exactos que devolvió el servidor
      const isLikedNow = res.liked !== undefined ? res.liked : !prevLiked;
      const newCount = res.cantidadLikes !== undefined ? res.cantidadLikes : (prevLiked ? prevCount - 1 : prevCount + 1);

      setLikeState({
        liked: isLikedNow,
        count: newCount
      });

      // Le avisamos al componente padre por si necesita actualizar su estado
      onLikeUpdate?.(recipe.id, newCount, isLikedNow);
    
    } catch (error) {
      // 4. REVERSIÓN: Si falla el servidor, devolvemos el botón a como estaba
      setLikeState({ liked: prevLiked, count: prevCount });
      toast.error("No se pudo registrar el like. Intenta de nuevo.");
      throw error; 
    }
  };

  const handleCardClick = () => {
    navigate(`/recetas/${recipe.id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
      className={cn(
        "bg-card rounded-2xl overflow-hidden shadow-card cursor-pointer group",
        "hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1",
        "animate-fade-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
    >
      {/* Contenedor de Imagen */}
      <div className="relative h-52 overflow-hidden bg-muted">
        <img
          src={recipe.imagenUrl || '/placeholder.jpg'}
          alt={recipe.titulo}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-card-overlay opacity-70" />

        {/* Badge de Categoría */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-card/90 text-primary backdrop-blur-sm">
            {recipe.categoriaNombre}
          </span>
        </div>

        {/* Badge de Tiempo */}
        {recipe.tiempoPreparacion && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-foreground/60 text-primary-foreground backdrop-blur-sm">
              <Clock className="w-3 h-3" />
              {recipe.tiempoPreparacion}m
            </span>
          </div>
        )}
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground line-clamp-2 text-base leading-snug mb-3 group-hover:text-primary transition-colors">
          {recipe.titulo}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <UserAvatar
              src={recipe.autorFoto} 
              name={recipe.autorNombre}
              size="xs"
            />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate font-medium">
                {recipe.autorNombre}
              </p>
            </div>
          </div>

          <LikeButton
            isLiked={likeState.liked}
            count={likeState.count}
            onToggle={(e) => handleLike(e)}
            size="sm"
          />
        </div>
      </div>
    </article>
  );
};

export default RecipeCard;