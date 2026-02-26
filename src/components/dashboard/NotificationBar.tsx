import { useState } from "react";
import { CalendarDays, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { INITIAL_EVENTS } from "@/components/dashboard/CalendarWidget";

function getDateStr(day: number) {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

const NotificationBar = () => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const todayStr = getDateStr(new Date().getDate());
  const todayEvents = INITIAL_EVENTS.filter((e) => e.date === todayStr);

  if (todayEvents.length === 0 || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="w-full flex justify-center mb-3"
      >
        <div
          className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-border/30 cursor-pointer group"
          style={{
            background: "hsl(var(--card))",
            boxShadow:
              "0 1px 4px hsl(var(--foreground) / 0.05), 0 4px 12px hsl(var(--foreground) / 0.03)",
          }}
          onClick={() => navigate("/widget/calendar")}
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-foreground">
              {todayEvents.length} event{todayEvents.length > 1 ? "s" : ""} today
            </span>
          </div>

          <div className="w-px h-4 bg-border/40" />

          <div className="flex items-center gap-2 overflow-hidden">
            {todayEvents.slice(0, 3).map((evt) => (
              <div key={evt.id} className="flex items-center gap-1.5 shrink-0">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: evt.color }}
                />
                <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[120px]">
                  {evt.title}
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  {formatTime(evt.time)}
                </span>
              </div>
            ))}
          </div>

          <ChevronRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-foreground/60 transition-colors shrink-0" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            className="rounded p-0.5 hover:bg-muted/50 transition-colors shrink-0"
          >
            <X className="w-3 h-3 text-muted-foreground/50" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationBar;
