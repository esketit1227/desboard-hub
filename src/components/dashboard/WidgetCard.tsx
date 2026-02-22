import { useRef, useCallback, useState } from "react";
import { ArrowUpRight, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type WidgetSize = { colSpan: number; rowSpan: number };

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

const ROW_HEIGHT = 200; // px per row unit
const MIN_COL = 1;
const MAX_COL = 3;
const MIN_ROW = 1;
const MAX_ROW = 3;

const WidgetCard = ({ id, title, icon, size = { colSpan: 1, rowSpan: 1 }, onExpand, onResize, children }: WidgetCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const cardRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (!onResize || !cardRef.current) return;
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = cardRef.current.offsetWidth;
      const startHeight = cardRef.current.offsetHeight;
      const startCol = size.colSpan;
      const startRow = size.rowSpan;

      // Estimate single col width from current size
      const colWidth = startWidth / startCol;

      setIsResizing(true);

      const onMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        const newCols = Math.max(MIN_COL, Math.min(MAX_COL, Math.round((startWidth + dx) / colWidth)));
        const newRows = Math.max(MIN_ROW, Math.min(MAX_ROW, Math.round((startHeight + dy) / ROW_HEIGHT)));

        if (newCols !== size.colSpan || newRows !== size.rowSpan) {
          onResize({ colSpan: newCols, rowSpan: newRows });
        }
      };

      const onMouseUp = () => {
        setIsResizing(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [onResize, size]
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isResizing ? undefined : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (cardRef as any).current = node;
      }}
      style={style}
      className={cn(
        "bg-card border border-border rounded-2xl p-5 transition-all duration-200 group relative overflow-hidden flex flex-col h-full",
        isDragging && "shadow-lg",
        isResizing && "select-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            {...attributes}
            {...listeners}
            className="rounded-lg p-1 transition-colors cursor-grab active:cursor-grabbing touch-none hover:bg-muted/50 opacity-0 group-hover:opacity-100"
          >
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
        </div>
        <button
          onClick={onExpand}
          className="rounded-lg w-7 h-7 flex items-center justify-center hover:bg-muted/50 transition-colors opacity-0 group-hover:opacity-100"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Content — fills remaining space, hidden overflow */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>

      {/* Resize handle — bottom right corner */}
      {onResize && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <svg
            className="w-full h-full text-muted-foreground/50"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <circle cx="14" cy="14" r="1.5" />
            <circle cx="14" cy="8" r="1.5" />
            <circle cx="8" cy="14" r="1.5" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default WidgetCard;