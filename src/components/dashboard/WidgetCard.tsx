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
  tintIndex?: number;
  bgColor?: string;
  textColor?: string;
  onExpand: () => void;
  onResize?: (size: WidgetSize) => void;
  children: React.ReactNode;
}

const TINT_COLORS = [
  { bg: "hsl(150 30% 85%)", fg: "hsl(150 25% 20%)" },
  { bg: "hsl(260 30% 85%)", fg: "hsl(260 25% 20%)" },
  { bg: "hsl(340 30% 88%)", fg: "hsl(340 25% 20%)" },
  { bg: "hsl(170 35% 85%)", fg: "hsl(170 30% 18%)" },
  { bg: "hsl(20 40% 88%)", fg: "hsl(20 35% 20%)" },
  { bg: "hsl(200 35% 86%)", fg: "hsl(200 30% 18%)" },
  { bg: "hsl(280 25% 88%)", fg: "hsl(280 25% 18%)" },
  { bg: "hsl(45 35% 88%)", fg: "hsl(45 30% 20%)" },
  { bg: "hsl(350 35% 86%)", fg: "hsl(350 30% 18%)" },
  { bg: "hsl(130 20% 85%)", fg: "hsl(130 20% 18%)" },
];

const WidgetCard = ({ id, title, icon, size = "small", tintIndex, onExpand, onResize, children }: WidgetCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const hasTint = tintIndex !== undefined;
  const tint = hasTint ? TINT_COLORS[tintIndex % TINT_COLORS.length] : null;

  const cardStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    ...(tint ? { backgroundColor: tint.bg, color: tint.fg } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      className={cn(
        "rounded-2xl p-5 transition-all duration-200 group relative overflow-hidden",
        !hasTint && "bg-card border border-border",
        isDragging && "shadow-lg"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <button
            {...attributes}
            {...listeners}
            className="rounded-lg p-1 transition-colors cursor-grab active:cursor-grabbing touch-none hover:bg-black/5 opacity-0 group-hover:opacity-100"
          >
            <GripVertical className="w-3.5 h-3.5 opacity-40" />
          </button>
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onResize && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-lg w-7 h-7 flex items-center justify-center hover:bg-black/5 transition-colors">
                  <Maximize2 className="w-3.5 h-3.5 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px] rounded-xl">
                <DropdownMenuItem
                  onClick={() => onResize("small")}
                  className={cn("gap-2 rounded-lg", size === "small" && "bg-muted/50")}
                >
                  <Square className="w-3.5 h-3.5" /> Small
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onResize("medium")}
                  className={cn("gap-2 rounded-lg", size === "medium" && "bg-muted/50")}
                >
                  <RectangleHorizontal className="w-3.5 h-3.5" /> Medium
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onResize("large")}
                  className={cn("gap-2 rounded-lg", size === "large" && "bg-muted/50")}
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Large
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <button
            onClick={onExpand}
            className="rounded-lg w-7 h-7 flex items-center justify-center hover:bg-black/5 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
          </button>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

export default WidgetCard;
