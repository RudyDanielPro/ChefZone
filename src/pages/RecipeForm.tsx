// ============================================================
// ChefZone — Formulario de Receta (CORREGIDO)
// ============================================================
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ImagePreview from "@/components/ImagePreview";
import { crearReceta, actualizarReceta, obtenerRecetaPorId, subirImagenReceta } from "@/services/recipes";
import { obtenerCategorias } from "@/services/categories";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, Loader2, Upload } from "lucide-react";
import type { Categoria } from "@/types";
import { cn } from "@/lib/utils";

interface FormState {
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  archivoImagen: File | null;
  categoriaId: number | "";
  ingredientes: string;
  instrucciones: string;
  tiempoPreparacion: string;
  porciones: string;
}

const defaultForm: FormState = {
  titulo: "",
  descripcion: "",
  imagenUrl: "",
  archivoImagen: null,
  categoriaId: "",
  ingredientes: "",
  instrucciones: "",
  tiempoPreparacion: "",
  porciones: "",
};

interface RecipeFormPageProps {
  modo: "crear" | "editar";
}

const RecipeFormPage: React.FC<RecipeFormPageProps> = ({ modo }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<FormState>(defaultForm);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(modo === "editar");
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    obtenerCategorias()
      .then(setCategorias)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (modo !== "editar" || !id) return;
    const cargar = async () => {
      try {
        const receta = await obtenerRecetaPorId(parseInt(id));
        setForm({
          titulo: receta.titulo,
          descripcion: receta.descripcion || "",
          imagenUrl: receta.foto?.ruta || "",
          archivoImagen: null,
          categoriaId: receta.categoria.id,
          ingredientes: receta.ingredientes,
          instrucciones: receta.instrucciones,
          tiempoPreparacion: receta.tiempoPreparacion ? String(receta.tiempoPreparacion) : "",
          porciones: receta.porciones ? String(receta.porciones) : "",
        });
      } catch {
        toast.error("No se pudo cargar la receta");
        navigate("/profile");
      } finally {
        setCargandoDatos(false);
      }
    };
    cargar();
  }, [modo, id, navigate]);

  const validar = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.titulo.trim()) errs.titulo = "El título es obligatorio";
    if (!form.imagenUrl.trim() && !form.archivoImagen) errs.imagen = "La imagen es obligatoria";
    if (!form.categoriaId) errs.categoriaId = "Selecciona una categoría";
    if (!form.ingredientes.trim()) errs.ingredientes = "Los ingredientes son obligatorios";
    if (!form.instrucciones.trim()) errs.instrucciones = "Las instrucciones son obligatorias";
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(f => ({ ...f, archivoImagen: file, imagenUrl: URL.createObjectURL(file) }));
      if (errores.imagen) setErrores(er => ({ ...er, imagen: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }
    
    setCargando(true);
    
    try {
      const payload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || undefined,
        instrucciones: form.instrucciones.trim(),
        ingredientes: form.ingredientes.trim(),
        categoriaId: Number(form.categoriaId),
      };

      let recetaGuardada;

      if (modo === "crear") {
        recetaGuardada = await crearReceta(payload);
      } else {
        // ✅ Validar que el ID existe y es número
        if (!id) {
          toast.error("ID de receta no válido");
          return;
        }
        const recipeId = parseInt(id);
        if (isNaN(recipeId)) {
          toast.error("ID de receta inválido");
          return;
        }
        recetaGuardada = await actualizarReceta(recipeId, payload);
      }

      // Subir imagen si existe
      if (form.archivoImagen) {
        setSubiendoImagen(true);
        try {
          recetaGuardada = await subirImagenReceta(recetaGuardada.id, form.archivoImagen);
          toast.success("Imagen subida correctamente");
        } catch (error) {
          toast.error("La receta se guardó pero la imagen no pudo subirse");
        } finally {
          setSubiendoImagen(false);
        }
      }

      toast.success(modo === "crear" ? "Receta publicada 🎉" : "Receta actualizada");
      navigate(`/recetas/${recetaGuardada.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar la receta";
      toast.error(msg);
    } finally {
      setCargando(false);
    }
  };

  const inputCls = (err?: string) => cn(
    "w-full rounded-xl border px-4 py-2.5 text-sm bg-card text-foreground placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all",
    err ? "border-destructive" : "border-input"
  );

  if (cargandoDatos) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">{modo === "crear" ? "Nueva Receta" : "Editar Receta"}</h1>
            <p className="text-muted-foreground text-sm">{modo === "crear" ? "Comparte tu creación con la comunidad" : "Actualiza tu receta"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3 space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Título *</label>
                <input value={form.titulo} onChange={e => { setForm(f => ({ ...f, titulo: e.target.value })); if (errores.titulo) setErrores(er => ({ ...er, titulo: "" })); }} placeholder="Ej: Paella Valenciana tradicional" className={inputCls(errores.titulo)} />
                {errores.titulo && <p className="text-destructive text-xs mt-1">{errores.titulo}</p>}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={3} placeholder="Describe brevemente tu receta..." className={`${inputCls()} resize-none`} />
              </div>

              {/* Categoría + tiempo + porciones */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Categoría *</label>
                  <select value={form.categoriaId} onChange={e => { setForm(f => ({ ...f, categoriaId: e.target.value ? Number(e.target.value) : "" })); if (errores.categoriaId) setErrores(er => ({ ...er, categoriaId: "" })); }} className={inputCls(errores.categoriaId)}>
                    <option value="">Seleccionar</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                  {errores.categoriaId && <p className="text-destructive text-xs mt-1">{errores.categoriaId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Tiempo (min)</label>
                  <input type="number" min={1} value={form.tiempoPreparacion} onChange={e => setForm(f => ({ ...f, tiempoPreparacion: e.target.value }))} placeholder="30" className={inputCls()} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Porciones</label>
                  <input type="number" min={1} value={form.porciones} onChange={e => setForm(f => ({ ...f, porciones: e.target.value }))} placeholder="4" className={inputCls()} />
                </div>
              </div>

              {/* Ingredientes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Ingredientes *</label>
                <textarea value={form.ingredientes} onChange={e => { setForm(f => ({ ...f, ingredientes: e.target.value })); if (errores.ingredientes) setErrores(er => ({ ...er, ingredientes: "" })); }} rows={5} placeholder="Ej: 2 tazas de harina&#10;3 huevos&#10;200g de chocolate" className={`${inputCls(errores.ingredientes)} resize-none font-mono text-sm`} />
                {errores.ingredientes && <p className="text-destructive text-xs mt-1">{errores.ingredientes}</p>}
                <p className="text-xs text-muted-foreground mt-1">Un ingrediente por línea</p>
              </div>

              {/* Instrucciones */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Instrucciones *</label>
                <textarea value={form.instrucciones} onChange={e => { setForm(f => ({ ...f, instrucciones: e.target.value })); if (errores.instrucciones) setErrores(er => ({ ...er, instrucciones: "" })); }} rows={8} placeholder="Paso a paso de la preparación..." className={`${inputCls(errores.instrucciones)} resize-none`} />
                {errores.instrucciones && <p className="text-destructive text-xs mt-1">{errores.instrucciones}</p>}
              </div>
            </div>

            {/* Columna derecha - Imagen */}
            <div className="md:col-span-2">
              <div className="sticky top-24 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Imagen de la receta *</label>
                  <div className="flex items-center gap-2">
                    <label className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-input bg-card text-sm cursor-pointer", "hover:bg-muted transition-colors")}>
                      <Upload className="w-4 h-4" />
                      <span>{form.archivoImagen ? form.archivoImagen.name : "Seleccionar imagen"}</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                  {errores.imagen && <p className="text-destructive text-xs mt-1">{errores.imagen}</p>}
                </div>

                {form.imagenUrl && (
                  <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-[4/3]">
                    <img src={form.imagenUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <button type="submit" disabled={cargando || subiendoImagen} className="w-full mt-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 shadow-md">
                  {(cargando || subiendoImagen) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {cargando ? "Guardando..." : subiendoImagen ? "Subiendo imagen..." : modo === "crear" ? "Publicar Receta 🚀" : "Guardar Cambios"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeFormPage;