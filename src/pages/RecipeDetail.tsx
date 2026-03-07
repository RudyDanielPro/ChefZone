// ============================================================
// ChefZone — Recipe Detail Page
// Full recipe view with ingredients, steps, likes, and related recipes
// ============================================================
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import UserAvatar from "@/components/UserAvatar";
import LikeButton from "@/components/LikeButton";
import RecipeCard from "@/components/RecipeCard";
import RecipeCardSkeleton from "@/components/RecipeCardSkeleton";
import { getRecipeById, getRelatedRecipes, toggleLike } from "@/services/recipes";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Clock, Users, Calendar, Edit, Loader2 } from "lucide-react";
import type { Recipe, RecipeCardData } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [related, setRelated] = useState<RecipeCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [recipeData, relatedData] = await Promise.all([
          getRecipeById(id),
          getRelatedRecipes(id).catch(() => []),
        ]);
        setRecipe(recipeData);
        setRelated(relatedData);
      } catch {
        setError("No se pudo cargar la receta.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleLike = async () => {
    if (!recipe) return;
    if (!isAuthenticated) {
      toast.info("Debes iniciar sesión para dar like", {
        action: { label: "Iniciar sesión", onClick: () => navigate("/login") },
      });
      return;
    }
    setLikeLoading(true);
    const prev = { likesCount: recipe.likesCount, isLiked: recipe.isLiked ?? false };
    setRecipe(r => r ? { ...r, likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1, isLiked: !prev.isLiked } : r);
    try {
      const res = await toggleLike(recipe.id);
      setRecipe(r => r ? { ...r, likesCount: res.likesCount, isLiked: res.isLiked } : r);
    } catch {
      setRecipe(r => r ? { ...r, ...prev } : r);
      toast.error("No se pudo actualizar el like");
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-24 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Receta no encontrada</h2>
          <p className="text-muted-foreground mb-6">{error || "Esta receta no existe o fue eliminada."}</p>
          <button onClick={() => navigate("/")} className="px-6 py-2.5 rounded-full gradient-primary text-primary-foreground font-semibold text-sm">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === recipe.author.id;
  const publishedDate = (() => {
    try {
      return format(new Date(recipe.publishedAt), "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return recipe.publishedAt;
    }
  })();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <article className="container py-8 max-w-4xl">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver
        </button>

        {/* Header image */}
        <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 bg-muted mb-8 shadow-md">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-card-overlay opacity-60" />
          {/* Category + like overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-card/90 text-primary backdrop-blur-sm">
              {recipe.category?.name}
            </span>
            <LikeButton
              isLiked={recipe.isLiked ?? false}
              count={recipe.likesCount}
              onToggle={handleLike}
              disabled={likeLoading}
              size="md"
            />
          </div>
        </div>

        {/* Title + meta */}
        <div className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            {recipe.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {/* Author */}
            <Link
              to={`/users/${recipe.author.id}`}
              className="flex items-center gap-2 hover:text-primary transition-colors group"
            >
              <UserAvatar
                src={recipe.author.profilePicture}
                name={`${recipe.author.firstName} ${recipe.author.lastName}`}
                size="sm"
              />
              <span className="font-medium group-hover:underline">
                {recipe.author.firstName} {recipe.author.lastName}
              </span>
            </Link>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {publishedDate}
            </div>

            {recipe.cookingTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {recipe.cookingTime} minutos
              </div>
            )}

            {recipe.servings && (
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {recipe.servings} porciones
              </div>
            )}
          </div>
        </div>

        {/* Edit button (owner only) */}
        {isOwner && (
          <div className="mb-6">
            <button
              onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar receta
            </button>
          </div>
        )}

        {/* Description */}
        {recipe.description && (
          <p className="text-muted-foreground leading-relaxed mb-8 text-base">
            {recipe.description}
          </p>
        )}

        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Ingredients */}
          <div className="md:col-span-2">
            <div className="bg-card rounded-2xl p-6 shadow-card sticky top-24">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                🛒 Ingredientes
              </h2>
              <ul className="space-y-2.5">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-foreground">
                      <span className="font-medium text-primary">{ing.quantity}{ing.unit && ` ${ing.unit}`}</span>
                      {" "}{ing.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Steps */}
          <div className="md:col-span-3">
            <h2 className="font-display text-xl font-bold text-foreground mb-5 flex items-center gap-2">
              👨‍🍳 Preparación
            </h2>
            <ol className="space-y-5">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="pt-1">
                    <p className="text-foreground leading-relaxed text-sm">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Related recipes */}
        {related.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-5">
              🍽️ Recetas relacionadas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map(r => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
};

export default RecipeDetail;
