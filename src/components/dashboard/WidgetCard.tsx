import { ArrowUpRight, GripVertical, Maximize2, RectangleHorizontal, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type WidgetSize = "small" | "medium" | "large";

interface WidgetCardProps {
  id: string;
  title: string;
  cols?: number;
  icon?: React.ReactNode;
  accent?: boolean;
  size?: WidgetSize;
  bgColor?: string;
  textColor?: string;
  onExpand: () => void;
  onResize?: (size: WidgetSize) => void;
  children: React.ReactNode;
}

const sizeClasses: Record<WidgetSize, string> = {
  small: "",
  medium: "sm:col-span-2",
  large: "sm:col-span-2 lg:col-span-3",
};

const WidgetCard = ({ id, title, icon, accent, size = "small", bgColor, textColor, onExpand, onResize, children }: WidgetCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const hasCustomColor = !!bgColor;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    ...(hasCustomColor ? { backgroundColor: bgColor, color: textColor } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl p-5 transition-all duration-200 group relative overflow-hidden",
        !hasCustomColor && (accent ? "bg-primary text-primary-foreground" : "glass"),
        isDragging && "shadow-[0_24px_64px_-16px_hsl(0_0%_0%/0.2)]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className={cn(
              "rounded-lg p-1 transition-colors cursor-grab active:cursor-grabbing touch-none",
              hasCustomColor ? "hover:bg-black/10" : accent ? "hover:bg-primary-foreground/10" : "hover:bg-secondary"
            )}
          >
            <GripVertical className="w-3.5 h-3.5 opacity-40" />
          </button>
          {icon && <span className="text-sm">{icon}</span>}
          <h3 className={cn(
            "text-sm font-semibold",
            !accent && !hasCustomColor && "text-foreground"
          )}>
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {onResize && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "rounded-full w-7 h-7 flex items-center justify-center transition-all duration-200",
                    hasCustomColor
                      ? "bg-black/10 hover:bg-black/20"
                      : accent
                        ? "bg-primary-foreground/15 hover:bg-primary-foreground/25"
                        : "bg-secondary hover:bg-secondary/80 hover:scale-105"
                  )}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px] rounded-xl">
                <DropdownMenuItem
                  onClick={() => onResize("small")}
                  className={cn("gap-2 rounded-lg", size === "small" && "bg-secondary")}
                >
                  <Square className="w-3.5 h-3.5" />
                  Small
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onResize("medium")}
                  className={cn("gap-2 rounded-lg", size === "medium" && "bg-secondary")}
                >
                  <RectangleHorizontal className="w-3.5 h-3.5" />
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onResize("large")}
                  className={cn("gap-2 rounded-lg", size === "large" && "bg-secondary")}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Large
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <button
            onClick={onExpand}
            className={cn(
              "rounded-full w-7 h-7 flex items-center justify-center transition-all duration-200",
              hasCustomColor
                ? "bg-black/10 hover:bg-black/20"
                : accent
                  ? "bg-primary-foreground/15 hover:bg-primary-foreground/25"
                  : "bg-secondary hover:bg-secondary/80 hover:scale-105"
            )}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content preview */}
      {children}
    </div>
  );
};

export default WidgetCard;
