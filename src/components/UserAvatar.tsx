// ============================================================
// ChefZone — UserAvatar Component
// Circular avatar showing profile picture or initials fallback
// ============================================================
import React from "react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

/**
 * Circular avatar with image or initials fallback.
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = "",
  size = "md",
  className,
}) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center",
        "border-2 border-primary/20",
        "gradient-primary text-primary-foreground font-semibold select-none",
        sizeMap[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={e => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span>{initials || "?"}</span>
      )}
    </div>
  );
};

export default UserAvatar;
