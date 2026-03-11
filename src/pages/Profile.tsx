// ============================================================
// ChefZone — Profile Page (SINCRONIZADO)
// ============================================================
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import UserAvatar from "@/components/UserAvatar";
import RecipeCard from "@/components/RecipeCard";
import RecipeCardSkeleton from "@/components/RecipeCardSkeleton";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { obtenerRecetasDeUsuario } from "@/services/recipes";
import { uploadProfilePhoto, deleteProfilePhoto } from "@/services/users";
import { toast } from "sonner";
import { Edit2, X, Plus, BookOpen, Heart, Loader2, Upload } from "lucide-react";
import type { RecetaResumen } from "@/types";
import { cn } from "@/lib/utils";

type Tab = "recetas" | "favoritos";

const getFullImageUrl = (path?: string) => {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `https://chefzonebackend.onrender.com${path.startsWith('/') ? '' : '/'}${path}`;
};

const Profile: React.FC = () => {
  const { usuario, actualizarUsuario } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("recetas");
  const [myRecipes, setMyRecipes] = useState<RecetaResumen[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // 1. CARGA INICIAL DE RECETAS
  useEffect(() => {
    if (!usuario) return;
    const fetchMyRecipes = async () => {
      setLoadingRecipes(true);
      try {
        const data = await obtenerRecetasDeUsuario(usuario.id);
        setMyRecipes(data || []);
      } catch (error) {
        toast.error("No se pudieron cargar tus recetas");
      } finally {
        setLoadingRecipes(false);
      }
    };
    fetchMyRecipes();
  }, [usuario?.id]); // Usamos id para evitar loops si el objeto usuario cambia

  // 2. FUNCIÓN PARA ACTUALIZAR EL ESTADO LOCAL CUANDO DAS LIKE
  // Esto asegura que si das like en una tarjeta, el contador del perfil reaccione
  const handleLikeUpdate = (id: number, cantidadLikes: number, liked: boolean) => {
    setMyRecipes(prev => prev.map(r => 
      r.id === id ? { ...r, cantidadLikes, likedByCurrentUser: liked } : r
    ));
  };

  // 3. CÁLCULO DINÁMICO DE LIKES TOTALES
  // Sumamos los likes de todas las recetas cargadas actualmente
  const totalLikes = useMemo(() => {
    return myRecipes.reduce((acc, curr) => acc + (curr.cantidadLikes || 0), 0);
  }, [myRecipes]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !usuario) return;

    setSubiendoFoto(true);
    try {
      // 1. Subimos la foto al servidor
      const res = await uploadProfilePhoto(usuario.id, file);

      // 2. Extraemos la ruta (ajustado a lo que devuelve tu backend)
      // Agregamos un timestamp (?t=...) para forzar al navegador a descargar la imagen nueva
      // y evitar que nos muestre la versión vieja guardada en el caché.
      const nuevaRuta = res.profilePicture || res.foto?.ruta ;
      const urlConTimestamp = `${nuevaRuta}?t=${new Date().getTime()}`;

      // 3. Actualizamos el contexto global de autenticación
      actualizarUsuario({
        ...usuario,
        profilePicture: urlConTimestamp,
        foto: { ...usuario.foto, ruta: urlConTimestamp } // Sincronizamos ambas posibles propiedades
      });

      toast.success("¡Foto actualizada con éxito!");
    } catch (error) {
      console.error("Error subiendo foto:", error);
      toast.error("No se pudo actualizar la foto");
    } finally {
      setSubiendoFoto(false);
      // Limpiamos el input para que permita subir la misma foto si se desea
      e.target.value = "";
    }
  };

  const handleDeletePhoto = async () => {
    if (!usuario) return;
    if (!confirm("¿Eliminar foto de perfil?")) return;
    try {
      await deleteProfilePhoto(usuario.id);
      actualizarUsuario({ ...usuario, foto: undefined, profilePicture: undefined });
      toast.success("Foto eliminada");
    } catch (error) {
      toast.error("Error al eliminar foto");
    }
  };

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 max-w-5xl">
        <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-8 border border-border">
          <div className="h-32 gradient-hero" />

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="relative group">
                <UserAvatar
                  src={getFullImageUrl(usuario?.profilePicture || usuario?.foto?.ruta)}
                  name={`${usuario?.nombre} ${usuario?.apellido}`}
                  size="xl"
                  className="ring-4 ring-card"
                />

                {editMode && (
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                    <label className="p-1.5 bg-white rounded-full cursor-pointer hover:bg-gray-100">
                      <Upload className="w-4 h-4 text-gray-700" />
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={subiendoFoto} />
                    </label>
                    {(usuario.foto?.ruta || usuario.profilePicture) && (
                      <button onClick={handleDeletePhoto} className="p-1.5 bg-white rounded-full hover:bg-gray-100">
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                )}

                {subiendoFoto && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center z-20">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
                >
                  {editMode ? <><X className="w-4 h-4" /> Terminar</> : <><Edit2 className="w-4 h-4" /> Editar perfil</>}
                </button>
              </div>
            </div>

            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {usuario.nombre} {usuario.apellido}
              </h1>
              <p className="text-muted-foreground text-sm mb-1">@{usuario.usuario}</p>
              
              <div className="flex gap-6 mt-5">
                {/* Contador de Recetas */}
                <div className="flex flex-col items-center bg-muted/50 px-5 py-2.5 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2 mb-0.5">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <p className="font-display text-xl font-bold text-foreground leading-none">
                      {myRecipes.length}
                    </p>
                  </div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Recetas</p>
                </div>

                {/* Contador de Likes TOTALES (Calculado dinámicamente) */}
                <div className="flex flex-col items-center bg-muted/50 px-5 py-2.5 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <p className="font-display text-xl font-bold text-foreground leading-none">
                      {totalLikes}
                    </p>
                  </div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Likes Totales</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de pestañas y grid */}
        <div className="flex justify-end mb-4">
          <button onClick={() => navigate("/recetas/crear")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Nueva Receta
          </button>
        </div>

        <div className="flex gap-1 border-b border-border mb-6">
           <button onClick={() => setTab("recetas")} className={cn("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors", tab === "recetas" ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>
             <BookOpen className="w-4 h-4" /> Mis Recetas
           </button>
           <button onClick={() => setTab("favoritos")} className={cn("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors", tab === "favoritos" ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>
             <Heart className="w-4 h-4" /> Favoritas
           </button>
        </div>

        {tab === "recetas" && (
          loadingRecipes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
            </div>
          ) : myRecipes.length === 0 ? (
            <EmptyState icon="📝" title="Aún no tienes recetas" description="Comparte tu primera creación." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myRecipes.map(r => (
                <RecipeCard 
                  key={r.id} 
                  recipe={r} 
                  onLikeUpdate={handleLikeUpdate} // ✅ IMPORTANTE: Pasamos la función de actualización
                />
              ))}
            </div>
          )
        )}

        {tab === "favoritos" && (
           <EmptyState icon="❤️" title="No tienes favoritas" description="Pronto podrás guardar recetas." />
        )}
      </div>
    </div>
  );
};

export default Profile;