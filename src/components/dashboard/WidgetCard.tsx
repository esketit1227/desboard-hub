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
  { gradient: "linear-gradient(135deg, hsl(220 85% 62%), hsl(240 75% 58%))", light: "hsl(220 85% 62% / 0.15)" },
  { gradient: "linear-gradient(135deg, hsl(340 75% 58%), hsl(320 70% 52%))", light: "hsl(340 75% 58% / 0.15)" },
  { gradient: "linear-gradient(135deg, hsl(152 55% 48%), hsl(170 60% 42%))", light: "hsl(152 55% 48% / 0.15)" },
  { gradient: "linear-gradient(135deg, hsl(28 85% 58%), hsl(15 80% 52%))", light: "hsl(28 85% 58% / 0.15)" },
  { gradient: "linear-gradient(135deg, hsl(260 70% 62%), hsl(280 65% 55%))", light: "hsl(260 70% 62% / 0.15)" },
  { gradient: "linear-gradient(135deg, hsl(195 80% 50%), hsl(210 75% 48%))", light: "hsl(195 80% 50% / 0.15)" },
  { gradient: "linear-gradient(135deg, hsl(45 85% 55%), hsl(35 80% 50%))", light: "hsl(45 85% 55% / 0.15)" },
  { gradient: "linear-gradient(135deg, hsl(0 70% 58%), hsl(350 65% 50%))", light: "hsl(0 70% 58% / 0.15)" },
  { gradient: "linear-gradient(135deg, hsl(180 50% 48%), hsl(165 55% 42%))", light: "hsl(180 50% 48% / 0.15)" },
  { gradient: "linear-gradient(135deg, hsl(290 60% 55%), hsl(310 55% 50%))", light: "hsl(290 60% 55% / 0.15)" },
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

  const wrapperStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
    ...(pixelSize ? { width: pixelSize.width, height: pixelSize.height } : {}),
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      style={wrapperStyle}
      className={cn(
        "relative group transition-all duration-200",
        !pixelSize && "h-[140px]",
        isDragging && "shadow-lg",
        isResizing && "ring-2 ring-primary/30"
      )}
    >
      {/* Back tab — the colored "folder back" with a tab bump */}
      {tint && (
        <div
          className="absolute inset-0 rounded-2xl overflow-visible"
          style={{ background: tint.gradient }}
        >
          {/* Tab bump */}
          <div
            className="absolute -top-3 left-4 w-16 h-5 rounded-t-xl"
            style={{ background: tint.gradient }}
          />
        </div>
      )}

      {/* Front panel — frosted glass overlay */}
      <div
        className={cn(
          "absolute inset-0 top-1 rounded-2xl flex flex-col overflow-hidden",
          "backdrop-blur-2xl border border-white/30"
        )}
        style={{
          background: tint
            ? `linear-gradient(180deg, hsl(0 0% 100% / 0.65), hsl(0 0% 100% / 0.35))`
            : `hsl(var(--glass-bg))`,
          boxShadow: "0 4px 24px -4px hsl(228 12% 30% / 0.08), inset 0 1px 0 hsl(0 0% 100% / 0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-1">
          <div className="flex items-center gap-2.5">
            <button
              {...attributes}
              {...listeners}
              className="rounded-lg p-1 transition-colors cursor-grab active:cursor-grabbing touch-none hover:bg-foreground/5 opacity-0 group-hover:opacity-100"
            >
              <GripVertical className="w-3.5 h-3.5 text-foreground/40" />
            </button>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={onExpand}
              className="rounded-lg w-7 h-7 flex items-center justify-center hover:bg-foreground/5 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-foreground/50" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden px-4 pb-4 text-foreground">{children}</div>
      </div>

      {/* Corner resize handle */}
      {onPixelResize && (
        <div
          onMouseDown={handleResizeStart}
          onDoubleClick={(e) => { e.stopPropagation(); onResetSize?.(); }}
          className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
