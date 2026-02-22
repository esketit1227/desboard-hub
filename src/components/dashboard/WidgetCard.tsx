import { X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface WidgetCardProps {
  id: string;
  title: string;
  cols?: number;
  onRemove: () => void;
  children: React.ReactNode;
}

const WidgetCard = ({ id, title, cols = 1, onRemove, children }: WidgetCardProps) => {
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
        "glass rounded-2xl p-5 min-h-[200px] transition-shadow",
        cols === 2 && "md:col-span-2",
        isDragging && "shadow-[0_24px_64px_-16px_hsl(228_25%_8%/0.18)]"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="rounded-lg p-1 hover:bg-secondary transition-colors cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <h3 className="text-[11px] font-medium text-muted-foreground tracking-widest uppercase">
            {title}
          </h3>
        </div>
        <button
          onClick={onRemove}
          className="rounded-lg p-1 hover:bg-secondary transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      {children}
    </div>
  );
};

export default WidgetCard;
