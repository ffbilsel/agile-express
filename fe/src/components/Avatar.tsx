import { useMemo } from "react";

type AvatarProps = {
  user: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showTooltip?: boolean;
  className?: string;
};

function stringToColor(str: string) {
  if (!str) return "#6b7280"; // neutral gray color

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate more vibrant, professional colors
  const hue = Math.abs(hash) % 360;
  const saturation = 65 + (hash % 15); // 65-80%
  const lightness = 45 + (hash % 10); // 45-55%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function getInitials(name: string) {
  if (!name || !name.trim()) return "??";

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  } else {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
}

export default function Avatar({
  user,
  size = "md",
  showTooltip = true,
  className = "",
}: AvatarProps) {
  const displayName = user?.trim() || "";

  const bgColor = useMemo(() => stringToColor(displayName), [displayName]);
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  const sizeClasses = {
    xs: "w-5 h-5 text-xs",
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
    xl: "w-12 h-12 text-lg",
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full flex items-center justify-center font-semibold text-white 
        shadow-sm hover:shadow-md select-none cursor-default
        ring-2 ring-white ring-opacity-20
        transition-all duration-200 ease-in-out
        ${className}
      `}
      style={{
        backgroundColor: bgColor,
      }}
      {...(showTooltip && {
        title: displayName || "Anonymous user",
        "aria-label": displayName
          ? `Avatar for ${displayName}`
          : "Anonymous user avatar",
      })}
    >
      <span className="font-medium tracking-tight">{initials}</span>
    </div>
  );
}
