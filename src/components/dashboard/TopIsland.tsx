import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Timer, Clock, Play, Pause, RotateCcw } from "lucide-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

const TopIsland = () => {
  const [now, setNow] = useState(new Date());
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const timerMinutes = Math.floor(timerSeconds / 60);
  const timerSecs = timerSeconds % 60;

  return (
    <div className="w-full flex justify-center mb-6">
      <div
        className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl border border-border/30"
        style={{
          background: "hsl(0 0% 100%)",
          boxShadow:
            "0 2px 8px hsl(var(--foreground) / 0.06), 0 8px 24px hsl(var(--foreground) / 0.04)",
        }}
      >
        {/* Greeting + Date */}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            {getGreeting()} 👋
          </span>
          <span className="text-[11px] text-muted-foreground">{formatDate(now)}</span>
        </div>

        <div className="w-px h-8 bg-border/40" />

        {/* Clock */}
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm font-medium tabular-nums text-foreground">
            {formatTime(now)}
          </span>
        </div>

        <div className="w-px h-8 bg-border/40" />

        {/* Timer */}
        <div className="flex items-center gap-2">
          <Timer className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-sm font-medium tabular-nums text-foreground min-w-[48px]">
            {String(timerMinutes).padStart(2, "0")}:{String(timerSecs).padStart(2, "0")}
          </span>
          <button
            onClick={() => setTimerRunning((r) => !r)}
            className="rounded-lg p-1 hover:bg-muted/50 transition-colors"
          >
            {timerRunning ? (
              <Pause className="w-3 h-3 text-foreground/60" />
            ) : (
              <Play className="w-3 h-3 text-foreground/60" />
            )}
          </button>
          {timerSeconds > 0 && (
            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(0);
              }}
              className="rounded-lg p-1 hover:bg-muted/50 transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-foreground/60" />
            </button>
          )}
        </div>

        <div className="w-px h-8 bg-border/40" />

        {/* Weather (static/decorative) */}
        <div className="flex items-center gap-2">
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-sm font-medium text-foreground">72°F</span>
          <span className="text-[11px] text-muted-foreground">Sunny</span>
        </div>
      </div>
    </div>
  );
};

export default TopIsland;
