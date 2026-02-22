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

/** Returns a size tier based on pixel dimensions */
export function getSizeTier(pixelSize?: { width: number; height: number }): "compact" | "standard" | "expanded" {
  if (!pixelSize) return "compact";
  const area = pixelSize.width * pixelSize.height;
  if (area >= 120000 || (pixelSize.width >= 340 && pixelSize.height >= 280)) return "expanded";
  if (area >= 45000 || pixelSize.height >= 200 || pixelSize.width >= 280) return "standard";
  return "compact";
}

const WidgetCard = ({ id, title, icon, size = "small", tintIndex, bgColor, textColor, onExpand, onResize, pixelSize, onPixelResize, onResetSize, children }: WidgetCardProps) => {
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
  const tier = getSizeTier(pixelSize);

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

    // Find the scrollable container to clamp within
    const container = cardRef.current.closest("main") || document.documentElement;
    const containerRect = container.getBoundingClientRect();

    const onMouseMove = (moveEvent: MouseEvent) => {
      const maxWidth = containerRect.right - rect.left - 16;
      const maxHeight = containerRect.bottom - rect.top - 16;
      const newWidth = Math.min(maxWidth, Math.max(140, startWidth + (moveEvent.clientX - startX)));
      const newHeight = Math.min(maxHeight, Math.max(100, startHeight + (moveEvent.clientY - startY)));
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
        isResizing && "ring-2 ring-foreground/10"
      )}
    >
      {/* Back tab — uses card color */}
      <div
        className="absolute inset-0 rounded-2xl overflow-visible"
        style={{ background: bgColor || "hsl(var(--foreground) / 0.7)" }}
      />

      {/* Front panel — solid color, no transparency */}
      <div
        className={cn(
          "absolute inset-0 top-1 rounded-2xl flex flex-col overflow-hidden",
          textColor && "widget-force-color"
        )}
        style={{
          background: bgColor || "hsl(var(--card))",
          color: textColor || "inherit",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-end px-3.5 pt-2.5 pb-0">
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              {...attributes}
              {...listeners}
              className="rounded-md p-1 transition-colors cursor-grab active:cursor-grabbing touch-none"
              style={{ color: textColor ? `${textColor}80` : undefined }}
            >
              <GripVertical className="w-3 h-3" />
            </button>
            <button
              onClick={onExpand}
              className="rounded-md w-6 h-6 flex items-center justify-center transition-colors"
              style={{ color: textColor ? `${textColor}80` : undefined }}
            >
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content — hidden at compact, visible at standard+ */}
        <div className={cn(
          "flex-1 overflow-hidden px-3.5 pb-3 transition-opacity duration-300",
          tier === "compact" ? "opacity-0" : "opacity-100"
        )}>
          {tier !== "compact" && children}
        </div>
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
