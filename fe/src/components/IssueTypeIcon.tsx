import { IssueType } from "@/types/Issue";
import { Circle, Bug, CheckSquare, Star } from "lucide-react";

type Props = {
  type: IssueType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
};

export default function IssueTypeIcon({
  type,
  size = "md",
  showLabel = false,
  className = "",
}: Props) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const iconConfig = {
    STORY: {
      icon: <Circle className={sizeClasses[size]} />,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      label: "Story",
    },
    BUG: {
      icon: <Bug className={sizeClasses[size]} />,
      color: "text-red-600 bg-red-50 border-red-200",
      label: "Bug",
    },
    TASK: {
      icon: <CheckSquare className={sizeClasses[size]} />,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      label: "Task",
    },
    EPIC: {
      icon: <Star className={sizeClasses[size]} />,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      label: "Epic",
    },
  };

  const config = iconConfig[type];
  if (!config) return null;

  if (showLabel) {
    return (
      <div
        className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-md border
        ${config.color} transition-colors duration-150
        ${className}
      `}
      >
        {config.icon}
        <span className="text-xs font-medium">{config.label}</span>
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center justify-center p-1 rounded-md border
        ${config.color} transition-colors duration-150
        ${className}
      `}
      title={config.label}
      aria-label={`${config.label} issue type`}
    >
      {config.icon}
    </div>
  );
}
