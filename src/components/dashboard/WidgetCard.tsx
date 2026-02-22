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

const WidgetCard = ({ id, title, icon, size = "small", onExpand, onResize, children }: WidgetCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "glass-strong rounded-3xl p-5 transition-all duration-300 group relative overflow-hidden",
        isDragging && "shadow-[0_24px_64px_-16px_hsl(0_0%_0%/0.15)]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <button
            {...attributes}
            {...listeners}
            className="rounded-xl p-1 transition-colors cursor-grab active:cursor-grabbing touch-none hover:bg-muted/50 opacity-0 group-hover:opacity-100"
          >
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <h3 className="text-sm font-medium text-foreground tracking-tight">{title}</h3>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onResize && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full w-7 h-7 flex items-center justify-center hover:bg-muted/60 transition-colors">
                  <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px] rounded-2xl glass-strong border-0">
                <DropdownMenuItem
                  onClick={() => onResize("small")}
                  className={cn("gap-2 rounded-xl", size === "small" && "bg-muted/50")}
                >
                  <Square className="w-3.5 h-3.5" /> Small
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onResize("medium")}
                  className={cn("gap-2 rounded-xl", size === "medium" && "bg-muted/50")}
                >
                  <RectangleHorizontal className="w-3.5 h-3.5" /> Medium
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onResize("large")}
                  className={cn("gap-2 rounded-xl", size === "large" && "bg-muted/50")}
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Large
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <button
            onClick={onExpand}
            className="rounded-full w-7 h-7 flex items-center justify-center hover:bg-muted/60 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

export default WidgetCard;
