// ============================================================
// ChefZone — SearchBar Component
// Text search with debounce for ingredient/recipe searching
// ============================================================
import React, { useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Search input with clear button and keyboard submit.
 */
const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Buscar por ingrediente o receta...",
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit?.(value);
    }
  };

  const handleClear = () => {
    onChange("");
    onSubmit?.("");
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "relative flex items-center rounded-xl border border-border bg-card",
        "shadow-sm focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/50",
        "transition-all duration-200",
        className
      )}
    >
      <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-transparent pl-10 pr-10 py-3 text-sm",
          "placeholder:text-muted-foreground focus:outline-none text-foreground"
        )}
      />
      {value && (
        <button
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
