
import React, { useState } from "react";
import { ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "recipe";
}

/**
 * Input field for image URLs with live preview.
 */
const ImagePreview: React.FC<ImagePreviewProps> = ({
  value,
  onChange,
  label = "URL de imagen",
  placeholder = "https://ejemplo.com/imagen.jpg",
  className,
  aspectRatio = "recipe",
}) => {
  const [hasError, setHasError] = useState(false);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    recipe: "aspect-[4/3]",
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}

      <input
        type="url"
        value={value}
        onChange={e => {
          setHasError(false);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm",
          "placeholder:text-muted-foreground focus:outline-none",
          "focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
        )}
      />

      {/* Preview */}
      <div
        className={cn(
          "relative rounded-xl overflow-hidden border border-border bg-muted",
          aspectClasses[aspectRatio]
        )}
      >
        {value && !hasError ? (
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            {hasError ? (
              <>
                <AlertCircle className="w-8 h-8 text-destructive/60" />
                <span className="text-xs text-destructive/70">No se pudo cargar la imagen</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-8 h-8" />
                <span className="text-xs">La previsualización aparecerá aquí</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
