// ============================================================
// ChefZone — CategoryFilter Component
// Horizontal scrollable chip list for category filtering
// ============================================================
import React from "react";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onSelect: (categoryId: string) => void;
  loading?: boolean;
}

const EMOJI_MAP: Record<string, string> = {
  postres: "🍰",
  ensaladas: "🥗",
  carnes: "🥩",
  pollo: "🍗",
  pastas: "🍝",
  sopas: "🍲",
  mariscos: "🦐",
  vegetariano: "🥦",
  vegano: "🌱",
  panaderia: "🍞",
  desayunos: "🍳",
  bebidas: "🥤",
  snacks: "🥨",
  pizzas: "🍕",
};

/**
 * Scrollable chip list of categories.
 * "Todos" option deselects the filter.
 */
const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selected,
  onSelect,
  loading = false,
}) => {
  if (loading) {
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
      {/* "All" chip */}
      <button
        onClick={() => onSelect("")}
        className={cn(
          "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
          selected === ""
            ? "gradient-primary text-primary-foreground shadow-sm"
            : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
        )}
      >
        🍽️ Todos
      </button>

      {categories.map(cat => {
        const emoji = EMOJI_MAP[cat.slug?.toLowerCase()] || "🍴";
        const isActive = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium",
              "transition-all duration-200 whitespace-nowrap",
              isActive
                ? "gradient-primary text-primary-foreground shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
            )}
          >
            <span>{emoji}</span>
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
