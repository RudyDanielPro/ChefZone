// ============================================================
// ChefZone — CategoryFilter Component (CON GUARDAS)
// ============================================================
import React from "react";
import { cn } from "@/lib/utils";
import type { Categoria } from "@/types";

interface CategoryFilterProps {
  categorias: Categoria[];
  seleccionada: string;
  onSelect: (categoriaId: string) => void;
  cargando?: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categorias = [], // ✅ valor por defecto
  seleccionada,
  onSelect,
  cargando = false,
}) => {
  if (cargando) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-muted animate-pulse flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
      <button
        onClick={() => onSelect("")}
        className={cn(
          "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
          seleccionada === ""
            ? "gradient-primary text-primary-foreground shadow-sm"
            : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
        )}
      >
        🍽️ Todos
      </button>

      {(categorias || []).map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id.toString())}
          className={cn(
            "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium",
            "transition-all duration-200 whitespace-nowrap",
            seleccionada === cat.id.toString()
              ? "gradient-primary text-primary-foreground shadow-sm"
              : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
          )}
        >
          {cat.nombre}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;