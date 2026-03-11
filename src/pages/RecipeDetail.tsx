// ============================================================
// ChefZone — Recipe Detail Page (CORREGIDO)
// ============================================================
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import UserAvatar from "@/components/UserAvatar";
import LikeButton from "@/components/LikeButton";
import RecipeCard from "@/components/RecipeCard";
import RecipeCardSkeleton from "@/components/RecipeCardSkeleton";
import { obtenerRecetaPorId, obtenerRecetasRelacionadas, darLike } from "@/services/recipes";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Clock, Users, Calendar, Edit, Loader2 } from "lucide-react";
import type { Receta, RecetaResumen } from "@/types";

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { autenticado, usuario } = useAuth();

  const [recipe, setRecipe] = useState<Receta | null>(null);
  const [related, setRelated] = useState<RecetaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Traemos la respuesta (la tratamos como 'any' para extraer campos planos)
        const data = await obtenerRecetaPorId(parseInt(id)) as any;

        // 2. Construimos el objeto Receta cumpliendo con todas las interfaces
        const recipeData: Receta = {
          ...data, // Esto ya trae cantidadLikes y likedByCurrentUser del JSON
          foto: {
            ruta: data.imagenUrl || '/placeholder.jpg'
          },
          // Solo rellenas lo que el DTO plano no trae (objetos anidados)
          usuario: {
            ...usuario, // si tienes los datos del autor completos
            nombre: data.autorNombre,
            id: data.autorId
          },
          categoria: {
            id: data.categoriaId,
            nombre: data.categoriaNombre
          }
        };

        let relatedData: RecetaResumen[] = [];
        try {
          relatedData = await obtenerRecetasRelacionadas(parseInt(id));
        } catch {
          // Ignorar error de relacionados
        }

        setRecipe(recipeData);
        setRelated(relatedData);
      } catch (err) {
        console.error("Error cargando receta:", err);
        setError("No se pudo cargar la receta.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleLike = async () => {
    if (!recipe || !autenticado) {
      if (!autenticado) {
        toast.info("Debes iniciar sesión para dar like", {
          action: { label: "Ir al Login", onClick: () => navigate("/login") }
        });
      }
      return;
    }

    setLikeLoading(true);

    // Snapshot para revertir si el servidor falla
    const prevLiked = recipe.likedByCurrentUser || false;
    const prevCount = recipe.cantidadLikes || 0;

    // 1. UPDATE OPTIMISTA: Cambia en la pantalla YA
    setRecipe(r => r ? {
      ...r,
      likedByCurrentUser: !prevLiked,
      cantidadLikes: prevLiked ? prevCount - 1 : prevCount + 1
    } : r);

    try {
      // 2. PETICIÓN REAL
      const res = await darLike(recipe.id);

      // 3. SINCRONIZACIÓN: Ajustamos con los datos exactos del DB
      setRecipe(r => r ? {
        ...r,
        likedByCurrentUser: res.liked,
        cantidadLikes: res.cantidadLikes
      } : r);

    } catch (error) {
      // 4. REVERSIÓN: Si falla el internet o el server, volvemos al estado anterior
      setRecipe(r => r ? {
        ...r,
        likedByCurrentUser: prevLiked,
        cantidadLikes: prevCount
      } : r);
      toast.error("No se pudo guardar tu like");
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

  const isOwner = usuario?.id === recipe.usuario.id;


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <article className="container py-8 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver
        </button>

        <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 bg-muted mb-8 shadow-md">
          <img
            src={recipe.foto?.ruta || '/placeholder.jpg'}
            alt={recipe.titulo}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-card-overlay opacity-60" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-card/90 text-primary backdrop-blur-sm">
              {recipe.categoria?.nombre}
            </span>
            <LikeButton
              isLiked={recipe.likedByCurrentUser ?? false} // Asegura que no sea undefined
              count={recipe.cantidadLikes || 0}
              onToggle={handleLike} // Se conecta a la función que actualiza el estado
              disabled={likeLoading}
              size="md"
            />
          </div>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            {recipe.titulo}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <Link
              to={`/usuarios/${recipe.usuario.id}`}
              className="flex items-center gap-2 hover:text-primary transition-colors group"
            >
              <UserAvatar
                src={recipe.usuario.foto?.ruta}
                name={`${recipe.usuario.nombre} ${recipe.usuario.apellido}`}
                size="sm"
              />
              <span className="font-medium group-hover:underline">
                {recipe.usuario.nombre} {recipe.usuario.apellido}
              </span>
            </Link>

            {recipe.tiempoPreparacion && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {recipe.tiempoPreparacion} minutos
              </div>
            )}

            {recipe.porciones && (
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {recipe.porciones} porciones
              </div>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="mb-6">
            <button
              onClick={() => navigate(`/recetas/${recipe.id}/editar`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar receta
            </button>
          </div>
        )}

        {recipe.descripcion && (
          <p className="text-muted-foreground leading-relaxed mb-8 text-base">
            {recipe.descripcion}
          </p>
        )}

        <div className="grid md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="bg-card rounded-2xl p-6 shadow-card sticky top-24">
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                🛒 Ingredientes
              </h2>
              <p className="text-foreground whitespace-pre-line">
                {recipe.ingredientes}
              </p>
            </div>
          </div>

          <div className="md:col-span-3">
            <h2 className="font-display text-xl font-bold text-foreground mb-5 flex items-center gap-2">
              👨‍🍳 Preparación
            </h2>
            <div className="text-foreground whitespace-pre-line">
              {recipe.instrucciones}
            </div>
          </div>
        </div>

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