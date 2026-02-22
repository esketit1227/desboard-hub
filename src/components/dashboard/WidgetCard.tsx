import { useState, useCallback, useRef } from "react";
import { ArrowUpRight, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  pixelSize?: { width: number; height: number };
  onPixelResize?: (size: { width: number; height: number }) => void;
  onResetSize?: () => void;
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

const WidgetCard = ({ id, title, icon, size = "small", tintIndex, onExpand, onResize, pixelSize, onPixelResize, onResetSize, children }: WidgetCardProps) => {
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onPixelResize || !cardRef.current) return;

    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = cardRef.current.getBoundingClientRect();
    const startWidth = rect.width;
    const startHeight = rect.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(140, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(100, startHeight + (moveEvent.clientY - startY));
      onPixelResize({ width: Math.round(newWidth), height: Math.round(newHeight) });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "nwse-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [onPixelResize]);

  const cardStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    ...(tint ? { backgroundColor: tint.bg, color: tint.fg } : {}),
    ...(pixelSize ? { width: pixelSize.width, height: pixelSize.height } : {}),
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      style={cardStyle}
      className={cn(
        "rounded-2xl p-5 transition-all duration-200 group relative overflow-hidden flex flex-col",
        !pixelSize && "h-[140px]",
        !hasTint && "bg-card border border-border",
        isDragging && "shadow-lg",
        isResizing && "ring-2 ring-primary/30"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-auto">
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
          <button
            onClick={onExpand}
            className="rounded-lg w-7 h-7 flex items-center justify-center hover:bg-black/5 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-auto">{children}</div>

      {/* Corner resize handle */}
      {onPixelResize && (
        <div
          onMouseDown={handleResizeStart}
          onDoubleClick={(e) => { e.stopPropagation(); onResetSize?.(); }}
          className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity"
          title="Drag to resize · Double-click to reset"
        >
          <svg viewBox="0 0 20 20" className="w-full h-full opacity-30">
            <path d="M14 20L20 14" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M10 20L20 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M6 20L20 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default WidgetCard;
