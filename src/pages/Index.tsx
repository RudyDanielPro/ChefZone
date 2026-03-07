// ============================================================
// ChefZone — Home Page
// Recipe listing with search, category filter, and pagination
// ============================================================
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import RecipeCardSkeleton from "@/components/RecipeCardSkeleton";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import EmptyState from "@/components/EmptyState";
import { getRecipes } from "@/services/recipes";
import { getCategories } from "@/services/categories";
import type { RecipeCardData, Category } from "@/types";
import { toast } from "sonner";
import { Loader2, ChefHat } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const RECIPES_PER_PAGE = 12;

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // State
  const [recipes, setRecipes] = useState<RecipeCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const searchValue = searchParams.get("search") || "";
  const categoryId = searchParams.get("category") || "";

  const loaderRef = useRef<HTMLDivElement>(null);

  // Fetch categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch {
        // Non-critical
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();
  }, []);

  // Fetch recipes when filters change (reset to page 1)
  const fetchRecipes = useCallback(async (reset = true) => {
    const targetPage = reset ? 1 : page + 1;
    if (reset) {
      setLoadingRecipes(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await getRecipes({
        search: searchValue || undefined,
        categoryId: categoryId || undefined,
        page: targetPage,
        perPage: RECIPES_PER_PAGE,
      });
      if (reset) {
        setRecipes(res.data);
      } else {
        setRecipes(prev => [...prev, ...res.data]);
        setPage(targetPage);
      }
      setTotal(res.total);
      setHasMore(targetPage < res.totalPages);
    } catch (error) {
      toast.error("No se pudieron cargar las recetas. Intenta de nuevo.");
    } finally {
      setLoadingRecipes(false);
      setLoadingMore(false);
    }
  }, [searchValue, categoryId, page]);

  useEffect(() => {
    fetchRecipes(true);
  }, [searchValue, categoryId]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loadingMore && !loadingRecipes) {
          fetchRecipes(false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadingRecipes, fetchRecipes]);

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("search", value);
    else params.delete("search");
    setSearchParams(params);
  };

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("search", value);
    else params.delete("search");
    setSearchParams(params);
  };

  const handleCategorySelect = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (id) params.set("category", id);
    else params.delete("category");
    setSearchParams(params);
  };

  const handleLikeUpdate = (id: string, likesCount: number, isLiked: boolean) => {
    setRecipes(prev =>
      prev.map(r => r.id === id ? { ...r, likesCount, isLiked } : r)
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero banner */}
      <section className="gradient-hero py-12 px-4 text-center text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <div className="container relative">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3 drop-shadow-sm">
            Descubre recetas increíbles 🍴
          </h1>
          <p className="text-primary-foreground/90 text-lg max-w-xl mx-auto mb-8">
            Busca por ingredientes, explora categorías y comparte tus creaciones con la comunidad ChefZone.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar
              value={searchValue}
              onChange={handleSearchChange}
              onSubmit={handleSearch}
              placeholder="Buscar por ingrediente o nombre de receta..."
              className="bg-card/95 backdrop-blur-sm text-foreground"
            />
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="container py-8">
        {/* Category filter */}
        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            selected={categoryId}
            onSelect={handleCategorySelect}
            loading={loadingCategories}
          />
        </div>

        {/* Results count */}
        {!loadingRecipes && recipes.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            {searchValue || categoryId
              ? `${total} resultado${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`
              : `${total} recetas disponibles`}
          </p>
        )}

        {/* Recipe grid */}
        {loadingRecipes ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No se encontraron recetas"
            description={
              searchValue || categoryId
                ? "Intenta con otros términos o categorías."
                : "Aún no hay recetas publicadas."
            }
            action={
              isAuthenticated ? (
                <button
                  onClick={() => navigate("/recipes/create")}
                  className="px-6 py-2.5 rounded-full gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Publicar primera receta
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onLikeUpdate={handleLikeUpdate}
              />
            ))}
          </div>
        )}

        {/* Infinite scroll loader */}
        <div ref={loaderRef} className="flex justify-center py-8">
          {loadingMore && (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          )}
          {!hasMore && recipes.length > 0 && (
            <p className="text-muted-foreground text-sm">Has visto todas las recetas 🎉</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
