import { X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  title: string;
  cols?: number;
  onRemove: () => void;
  children: React.ReactNode;
}

const WidgetCard = ({ title, cols = 1, onRemove, children }: WidgetCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={cn(
        "glass rounded-2xl p-5 min-h-[200px]",
        cols === 2 && "md:col-span-2"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-medium text-muted-foreground tracking-widest uppercase">
          {title}
        </h3>
        <button
          onClick={onRemove}
          className="rounded-lg p-1 hover:bg-secondary transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      {children}
    </motion.div>
  );
};

export default WidgetCard;
