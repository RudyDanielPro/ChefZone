// ============================================================
// ChefZone — Profile Page
// User profile: info, avatar update, my recipes, favorites
// ============================================================
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import UserAvatar from "@/components/UserAvatar";
import RecipeCard from "@/components/RecipeCard";
import RecipeCardSkeleton from "@/components/RecipeCardSkeleton";
import ImagePreview from "@/components/ImagePreview";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { getUserRecipes, getFavoriteRecipes } from "@/services/recipes";
import { updateMyProfile } from "@/services/users";
import { toast } from "sonner";
import { Edit2, Save, X, Plus, BookOpen, Heart, Loader2 } from "lucide-react";
import type { RecipeCardData } from "@/types";
import { cn } from "@/lib/utils";

type Tab = "recipes" | "favorites";

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("recipes");
  const [myRecipes, setMyRecipes] = useState<RecipeCardData[]>([]);
  const [favorites, setFavorites] = useState<RecipeCardData[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [loadingFavs, setLoadingFavs] = useState(false);

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    username: user?.username ?? "",
    profilePicture: user?.profilePicture ?? "",
    bio: user?.bio ?? "",
  });

  // Load my recipes on mount
  useEffect(() => {
    if (!user) return;
    const fetchMyRecipes = async () => {
      setLoadingRecipes(true);
      try {
        const data = await getUserRecipes(user.id);
        setMyRecipes(data);
      } catch {
        toast.error("No se pudieron cargar tus recetas");
      } finally {
        setLoadingRecipes(false);
      }
    };
    fetchMyRecipes();
  }, [user]);

  // Load favorites when tab is switched to favorites
  useEffect(() => {
    if (tab !== "favorites") return;
    const fetchFavs = async () => {
      setLoadingFavs(true);
      try {
        const data = await getFavoriteRecipes();
        setFavorites(data);
      } catch {
        toast.error("No se pudieron cargar los favoritos");
      } finally {
        setLoadingFavs(false);
      }
    };
    if (favorites.length === 0) fetchFavs();
  }, [tab]);

  const handleStartEdit = () => {
    setEditForm({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      username: user?.username ?? "",
      profilePicture: user?.profilePicture ?? "",
      bio: user?.bio ?? "",
    });
    setEditing(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await updateMyProfile(editForm);
      updateUser(updated);
      setEditing(false);
      toast.success("Perfil actualizado correctamente");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al actualizar perfil";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all";

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 max-w-5xl">
        {/* Profile card */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-32 gradient-hero" />

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="relative">
                <UserAvatar
                  src={editing ? editForm.profilePicture : user.profilePicture}
                  name={`${user.firstName} ${user.lastName}`}
                  size="xl"
                  className="ring-4 ring-card"
                />
              </div>
              <div className="flex gap-2 mt-4">
                {editing ? (
                  <>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm hover:bg-muted transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar perfil
                  </button>
                )}
              </div>
            </div>

            {editing ? (
              /* Edit form */
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Nombre</label>
                      <input
                        value={editForm.firstName}
                        onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                        className={inputCls}
                        placeholder="Nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Apellidos</label>
                      <input
                        value={editForm.lastName}
                        onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                        className={inputCls}
                        placeholder="Apellidos"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Nombre de usuario</label>
                    <input
                      value={editForm.username}
                      onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                      className={inputCls}
                      placeholder="@usuario"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                      rows={3}
                      className={`${inputCls} resize-none`}
                      placeholder="Cuéntanos sobre ti..."
                    />
                  </div>
                </div>
                <div>
                  <ImagePreview
                    value={editForm.profilePicture}
                    onChange={url => setEditForm(f => ({ ...f, profilePicture: url }))}
                    label="Foto de perfil (URL)"
                    placeholder="https://ejemplo.com/mi-foto.jpg"
                    aspectRatio="square"
                  />
                </div>
              </div>
            ) : (
              /* Display */
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-muted-foreground text-sm mb-1">@{user.username}</p>
                <p className="text-muted-foreground text-xs mb-3">{user.email}</p>
                {user.bio && (
                  <p className="text-foreground text-sm leading-relaxed max-w-xl">{user.bio}</p>
                )}
                <div className="flex gap-4 mt-4 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-foreground">{myRecipes.length}</p>
                    <p className="text-muted-foreground text-xs">Recetas</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground">{favorites.length}</p>
                    <p className="text-muted-foreground text-xs">Favoritas</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New recipe CTA */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/recipes/create")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Receta
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          {[
            { id: "recipes" as Tab, label: "Mis Recetas", icon: BookOpen },
            { id: "favorites" as Tab, label: "Favoritas", icon: Heart },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "recipes" && (
          loadingRecipes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
            </div>
          ) : myRecipes.length === 0 ? (
            <EmptyState
              icon="📝"
              title="Aún no has publicado recetas"
              description="Comparte tu primera creación con la comunidad."
              action={
                <button
                  onClick={() => navigate("/recipes/create")}
                  className="px-6 py-2.5 rounded-full gradient-primary text-primary-foreground font-semibold text-sm"
                >
                  Crear primera receta
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myRecipes.map(r => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          )
        )}

        {tab === "favorites" && (
          loadingFavs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <RecipeCardSkeleton key={i} />)}
            </div>
          ) : favorites.length === 0 ? (
            <EmptyState
              icon="❤️"
              title="No tienes recetas favoritas"
              description="Dale like a recetas para guardarlas aquí."
              action={
                <button onClick={() => navigate("/")} className="px-6 py-2.5 rounded-full gradient-primary text-primary-foreground font-semibold text-sm">
                  Explorar recetas
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {favorites.map(r => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Profile;
