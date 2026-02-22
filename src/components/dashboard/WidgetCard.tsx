import { ArrowUpRight, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface WidgetCardProps {
  id: string;
  title: string;
  cols?: number;
  icon?: React.ReactNode;
  accent?: boolean;
  onExpand: () => void;
  children: React.ReactNode;
}

const WidgetCard = ({ id, title, cols = 1, icon, accent, onExpand, children }: WidgetCardProps) => {
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
        "rounded-2xl p-5 transition-all duration-200 group relative overflow-hidden",
        accent ? "bg-primary text-primary-foreground" : "glass",
        cols === 2 && "md:col-span-2",
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
              accent ? "hover:bg-primary-foreground/10" : "hover:bg-secondary"
            )}
          >
            <GripVertical className="w-3.5 h-3.5 opacity-40" />
          </button>
          {icon && <span className="text-sm">{icon}</span>}
          <h3 className={cn(
            "text-sm font-semibold",
            !accent && "text-foreground"
          )}>
            {title}
          </h3>
        </div>
        <button
          onClick={onExpand}
          className={cn(
            "rounded-full w-7 h-7 flex items-center justify-center transition-all duration-200",
            accent
              ? "bg-primary-foreground/15 hover:bg-primary-foreground/25"
              : "bg-secondary hover:bg-secondary/80 hover:scale-105"
          )}
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content preview */}
      {children}
    </div>
  );
};

export default WidgetCard;
