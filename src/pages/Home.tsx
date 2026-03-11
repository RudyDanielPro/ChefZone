// ============================================================
// ChefZone — Home Page (ESPAÑOL - CON GUARDAS)
// ============================================================
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import RecipeCardSkeleton from "@/components/RecipeCardSkeleton";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import EmptyState from "@/components/EmptyState";
import { obtenerRecetas } from "@/services/recipes"; 
import { obtenerCategorias } from "@/services/categories"; 
import type { RecetaResumen, Categoria } from "@/types"; 
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const RECETAS_POR_PAGINA = 12;

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { autenticado } = useAuth();

  const [recetas, setRecetas] = useState<RecetaResumen[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargandoRecetas, setCargandoRecetas] = useState(true);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [hayMas, setHayMas] = useState(true);
  const [total, setTotal] = useState(0);

  const busqueda = searchParams.get("busqueda") || "";
  const categoriaId = searchParams.get("categoria") || "";

  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await obtenerCategorias();
        setCategorias(cats || []); // ✅ asegurar array
      } catch {
        setCategorias([]); // ✅ asegurar array aunque falle
      } finally {
        setCargandoCategorias(false);
      }
    };
    fetchCats();
  }, []);

  const fetchRecetas = useCallback(async (reset = true) => {
    const paginaTarget = reset ? 1 : pagina + 1;
    
    if (reset) {
      setCargandoRecetas(true);
      setPagina(1);
    } else {
      setCargandoMas(true);
    }

    try {
      // 1. Obtenemos la respuesta
      const res = await obtenerRecetas({
        busqueda: busqueda || undefined,
        categoriaId: categoriaId ? parseInt(categoriaId) : undefined,
        pagina: paginaTarget,
        porPagina: RECETAS_POR_PAGINA,
      });

      // 2. CORRECCIÓN AQUÍ: 
      // Si 'res' es un Array directamente (como muestra tu log), lo usamos.
      // Si es un objeto con .data, usamos .data.
      const nuevasRecetas = Array.isArray(res) ? res : (res.data || []);

      if (reset) {
        setRecetas(nuevasRecetas);
      } else {
        setRecetas(prev => [...(prev || []), ...nuevasRecetas]);
        setPagina(paginaTarget);
      }

      // 3. Ajuste de paginación manual (ya que el JSON no trae totalPages)
      setTotal(nuevasRecetas.length);
      setHayMas(nuevasRecetas.length === RECETAS_POR_PAGINA);

    } catch (error) {
      console.error("Error cargando recetas:", error);
      toast.error("No se pudieron cargar las recetas.");
      if (reset) setRecetas([]);
    } finally {
      setCargandoRecetas(false);
      setCargandoMas(false);
    }
  }, [busqueda, categoriaId, pagina]);

  useEffect(() => {
    fetchRecetas(true);
  }, [busqueda, categoriaId]);

  useEffect(() => {
    if (!loaderRef.current || !hayMas) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !cargandoMas && !cargandoRecetas) {
          fetchRecetas(false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hayMas, cargandoMas, cargandoRecetas, fetchRecetas]);

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("busqueda", value);
    else params.delete("busqueda");
    setSearchParams(params);
  };

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("busqueda", value);
    else params.delete("busqueda");
    setSearchParams(params);
  };

  const handleCategorySelect = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (id) params.set("categoria", id);
    else params.delete("categoria");
    setSearchParams(params);
  };

  const handleLikeUpdate = (id: number, cantidadLikes: number, liked: boolean) => {
    setRecetas(prev =>
      (prev || []).map(r => r.id === id ? { ...r, cantidadLikes, isLiked: liked } : r)
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

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

          <div className="max-w-2xl mx-auto">
            <SearchBar
              value={busqueda}
              onChange={handleSearchChange}
              onSubmit={handleSearch}
              placeholder="Buscar por ingrediente o nombre de receta..."
              className="bg-card/95 backdrop-blur-sm text-foreground"
            />
          </div>
        </div>
      </section>

      <main className="container py-8">
        <div className="mb-6">
          <CategoryFilter
            categorias={categorias || []} // ✅ asegurar array
            seleccionada={categoriaId}
            onSelect={handleCategorySelect}
            cargando={cargandoCategorias}
          />
        </div>

        {!cargandoRecetas && (recetas?.length || 0) > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            {busqueda || categoriaId
              ? `${total || 0} resultado${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`
              : `${total || 0} recetas disponibles`}
          </p>
        )}

        {cargandoRecetas ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        ) : (recetas?.length || 0) === 0 ? (
          <EmptyState
            icon="🔍"
            title="No se encontraron recetas"
            description={
              busqueda || categoriaId
                ? "Intenta con otros términos o categorías."
                : "Aún no hay recetas publicadas."
            }
            action={
              autenticado ? (
                <button
                  onClick={() => navigate("/recetas/crear")}
                  className="px-6 py-2.5 rounded-full gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Publicar primera receta
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(recetas || []).map(receta => (
              <RecipeCard
                key={receta.id}
                recipe={receta}
                onLikeUpdate={handleLikeUpdate}
              />
            ))}
          </div>
        )}

        <div ref={loaderRef} className="flex justify-center py-8">
          {cargandoMas && (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          )}
          {!hayMas && (recetas?.length || 0) > 0 && (
            <p className="text-muted-foreground text-sm">Has visto todas las recetas 🎉</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;