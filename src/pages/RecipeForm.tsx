// ============================================================
// ChefZone — Recipe Form Page (Create & Edit)
// Shared form component for creating/editing recipes
// ============================================================
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ImagePreview from "@/components/ImagePreview";
import { createRecipe, updateRecipe, getRecipeById } from "@/services/recipes";
import { getCategories } from "@/services/categories";
import { toast } from "sonner";
import { Plus, Trash2, ArrowLeft, Loader2, GripVertical } from "lucide-react";
import type { Category, Ingredient, RecipeStep } from "@/types";
import { cn } from "@/lib/utils";

interface RecipeFormState {
  title: string;
  description: string;
  image: string;
  categoryId: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  cookingTime: string;
  servings: string;
}

const defaultForm: RecipeFormState = {
  title: "",
  description: "",
  image: "",
  categoryId: "",
  ingredients: [{ name: "", quantity: "", unit: "" }],
  steps: [{ order: 1, description: "" }],
  cookingTime: "",
  servings: "",
};

interface RecipeFormPageProps {
  mode: "create" | "edit";
}

const RecipeFormPage: React.FC<RecipeFormPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<RecipeFormState>(defaultForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(mode === "edit");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load categories
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Load existing recipe for edit
  useEffect(() => {
    if (mode !== "edit" || !id) return;
    const load = async () => {
      try {
        const recipe = await getRecipeById(id);
        setForm({
          title: recipe.title,
          description: recipe.description ?? "",
          image: recipe.image,
          categoryId: recipe.category.id,
          ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: "", quantity: "", unit: "" }],
          steps: recipe.steps.length > 0 ? recipe.steps : [{ order: 1, description: "" }],
          cookingTime: recipe.cookingTime ? String(recipe.cookingTime) : "",
          servings: recipe.servings ? String(recipe.servings) : "",
        });
      } catch {
        toast.error("No se pudo cargar la receta");
        navigate("/profile");
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [mode, id, navigate]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "El título es obligatorio";
    if (!form.image.trim()) errs.image = "La imagen es obligatoria";
    if (!form.categoryId) errs.categoryId = "Selecciona una categoría";
    if (form.ingredients.every(i => !i.name.trim())) errs.ingredients = "Agrega al menos un ingrediente";
    if (form.steps.every(s => !s.description.trim())) errs.steps = "Agrega al menos un paso";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }
    setLoading(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      image: form.image.trim(),
      categoryId: form.categoryId,
      ingredients: form.ingredients.filter(i => i.name.trim()),
      steps: form.steps.filter(s => s.description.trim()).map((s, i) => ({ ...s, order: i + 1 })),
      cookingTime: form.cookingTime ? Number(form.cookingTime) : undefined,
      servings: form.servings ? Number(form.servings) : undefined,
    };
    try {
      const saved = mode === "create"
        ? await createRecipe(payload)
        : await updateRecipe(id!, payload);
      toast.success(mode === "create" ? "Receta publicada 🎉" : "Receta actualizada");
      navigate(`/recipes/${saved.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar la receta";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Ingredient helpers
  const updateIngredient = (i: number, field: keyof Ingredient, val: string) => {
    setForm(f => {
      const ings = [...f.ingredients];
      ings[i] = { ...ings[i], [field]: val };
      return { ...f, ingredients: ings };
    });
  };
  const addIngredient = () => setForm(f => ({ ...f, ingredients: [...f.ingredients, { name: "", quantity: "", unit: "" }] }));
  const removeIngredient = (i: number) => setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }));

  // Step helpers
  const updateStep = (i: number, val: string) => {
    setForm(f => {
      const steps = [...f.steps];
      steps[i] = { ...steps[i], description: val };
      return { ...f, steps };
    });
  };
  const addStep = () => setForm(f => ({ ...f, steps: [...f.steps, { order: f.steps.length + 1, description: "" }] }));
  const removeStep = (i: number) => setForm(f => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));

  const inputCls = (err?: string) => cn(
    "w-full rounded-xl border px-4 py-2.5 text-sm bg-card text-foreground placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all",
    err ? "border-destructive" : "border-input"
  );

  if (loadingData) {
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {mode === "create" ? "Nueva Receta" : "Editar Receta"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === "create" ? "Comparte tu creación con la comunidad" : "Actualiza tu receta"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid md:grid-cols-5 gap-8">
            {/* Left column */}
            <div className="md:col-span-3 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Título *</label>
                <input
                  value={form.title}
                  onChange={e => { setForm(f => ({ ...f, title: e.target.value })); if (errors.title) setErrors(er => ({ ...er, title: "" })); }}
                  placeholder="Ej: Paella Valenciana tradicional"
                  className={inputCls(errors.title)}
                />
                {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe brevemente tu receta..."
                  className={`${inputCls()} resize-none`}
                />
              </div>

              {/* Category + time + servings */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Categoría *</label>
                  <select
                    value={form.categoryId}
                    onChange={e => { setForm(f => ({ ...f, categoryId: e.target.value })); if (errors.categoryId) setErrors(er => ({ ...er, categoryId: "" })); }}
                    className={inputCls(errors.categoryId)}
                  >
                    <option value="">Seleccionar</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.categoryId && <p className="text-destructive text-xs mt-1">{errors.categoryId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Tiempo (min)</label>
                  <input type="number" min={1} value={form.cookingTime} onChange={e => setForm(f => ({ ...f, cookingTime: e.target.value }))} placeholder="30" className={inputCls()} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Porciones</label>
                  <input type="number" min={1} value={form.servings} onChange={e => setForm(f => ({ ...f, servings: e.target.value }))} placeholder="4" className={inputCls()} />
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground">Ingredientes *</label>
                  <button type="button" onClick={addIngredient} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>
                {errors.ingredients && <p className="text-destructive text-xs mb-2">{errors.ingredients}</p>}
                <div className="space-y-2">
                  {form.ingredients.map((ing, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <input value={ing.quantity} onChange={e => updateIngredient(i, "quantity", e.target.value)} placeholder="Cant." className={`${inputCls()} w-20 flex-shrink-0`} />
                      <input value={ing.unit || ""} onChange={e => updateIngredient(i, "unit", e.target.value)} placeholder="Unidad" className={`${inputCls()} w-24 flex-shrink-0`} />
                      <input value={ing.name} onChange={e => updateIngredient(i, "name", e.target.value)} placeholder="Ingrediente" className={inputCls()} />
                      {form.ingredients.length > 1 && (
                        <button type="button" onClick={() => removeIngredient(i)} className="p-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-foreground">Instrucciones *</label>
                  <button type="button" onClick={addStep} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Agregar paso
                  </button>
                </div>
                {errors.steps && <p className="text-destructive text-xs mb-2">{errors.steps}</p>}
                <div className="space-y-3">
                  {form.steps.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="flex-shrink-0 w-8 h-8 mt-1.5 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <textarea
                        value={step.description}
                        onChange={e => updateStep(i, e.target.value)}
                        rows={2}
                        placeholder={`Paso ${i + 1}...`}
                        className={`${inputCls()} resize-none flex-1`}
                      />
                      {form.steps.length > 1 && (
                        <button type="button" onClick={() => removeStep(i)} className="p-2.5 mt-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — image */}
            <div className="md:col-span-2">
              <div className="sticky top-24">
                <ImagePreview
                  value={form.image}
                  onChange={url => { setForm(f => ({ ...f, image: url })); if (errors.image) setErrors(er => ({ ...er, image: "" })); }}
                  label="Imagen de la receta *"
                  aspectRatio="recipe"
                />
                {errors.image && <p className="text-destructive text-xs mt-1">{errors.image}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Guardando..." : mode === "create" ? "Publicar Receta 🚀" : "Guardar Cambios"}
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
