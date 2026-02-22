import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSizeTier } from "./WidgetCard";

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

const events = [
  { day: 18, title: "Client Review — Flux", time: "10:00 AM", color: "bg-primary" },
  { day: 20, title: "Design Sprint", time: "2:00 PM", color: "bg-accent" },
  { day: 22, title: "Hand-off Deadline", time: "5:00 PM", color: "bg-warning" },
];

const generateDays = () => {
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  return { cells, currentDay, daysInMonth };
};

export const CalendarPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const tier = getSizeTier(pixelSize);
  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const dayNum = today.getDate();
  const month = today.toLocaleDateString("en-US", { month: "short" });

  if (tier === "compact") {
    return (
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-medium">{dayName}</p>
            <p className="text-4xl font-bold tracking-tighter leading-none mt-0.5" style={{ color: "hsl(var(--destructive))" }}>{dayNum}</p>
          </div>
          <CalendarDays className="w-4.5 h-4.5 text-muted-foreground/40" />
        </div>
        <div className="space-y-1 mt-auto">
          {events.slice(0, 2).map((event) => (
            <div key={event.title} className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${event.color} shrink-0`} />
              <span className="text-[10px] font-medium truncate">{event.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tier === "standard") {
    const { cells, currentDay } = generateDays();
    const eventDays = events.map(e => e.day);
    // Show a mini week view around today
    const weekStart = dayNum - today.getDay() + 1;
    const weekDays = Array.from({ length: 7 }, (_, i) => weekStart + i).filter(d => d > 0 && d <= 31);

    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-medium">{dayName}</p>
            <p className="text-3xl font-bold tracking-tighter leading-none mt-0.5" style={{ color: "hsl(var(--destructive))" }}>{dayNum}</p>
            <p className="text-[10px] text-muted-foreground">{month}</p>
          </div>
          <CalendarDays className="w-4 h-4 text-muted-foreground/40" />
        </div>
        <div className="flex gap-1 mt-1">
          {weekDays.map(d => (
            <div key={d} className={cn(
              "flex-1 h-6 rounded-md flex items-center justify-center text-[9px] font-medium",
              d === dayNum ? "bg-primary text-primary-foreground" : eventDays.includes(d) ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}>{d}</div>
          ))}
        </div>
        <div className="space-y-1 mt-auto">
          {events.map((event) => (
            <div key={event.title} className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${event.color} shrink-0`} />
              <span className="text-[9px] font-medium truncate flex-1">{event.title}</span>
              <span className="text-[8px] text-muted-foreground">{event.time}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // expanded
  const { cells, currentDay } = generateDays();
  const eventDays = events.map(e => e.day);

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold" style={{ color: "hsl(var(--destructive))" }}>{dayNum}</p>
          <div>
            <p className="text-[10px] font-semibold">{dayName}</p>
            <p className="text-[9px] text-muted-foreground">{today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {dayLabels.map((d, i) => (
          <span key={`${d}-${i}`} className="text-[8px] text-muted-foreground font-medium py-0.5">{d}</span>
        ))}
        {cells.slice(0, 35).map((day, i) => (
          <div key={i} className="flex items-center justify-center">
            {day !== null && (
              <span className={cn(
                "w-5 h-5 flex items-center justify-center rounded-md text-[8px] font-medium",
                day === currentDay ? "bg-primary text-primary-foreground font-bold" : eventDays.includes(day) ? "bg-primary/10 text-primary" : "text-muted-foreground"
              )}>{day}</span>
            )}
          </div>
        ))}
      </div>
      <div className="space-y-1 mt-auto pt-1 border-t border-border/30">
        {events.map((event) => (
          <div key={event.title} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${event.color} shrink-0`} />
            <span className="text-[9px] font-medium truncate flex-1">{event.title}</span>
            <span className="text-[8px] text-muted-foreground">{event.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Full expanded view */
export const CalendarExpanded = () => {
  const { cells, currentDay } = generateDays();
  const monthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const eventDays = events.map((e) => e.day);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">{monthName}</span>
        <div className="flex gap-1">
          <button className="rounded-xl p-2 hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="rounded-xl p-2 hover:bg-secondary transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {dayLabels.map((d, i) => (
          <span key={`${d}-${i}`} className="text-xs text-muted-foreground font-medium py-2">{d}</span>
        ))}
        {cells.map((day, i) => {
          const hasEvent = day !== null && eventDays.includes(day);
          return (
            <div key={i} className="relative flex items-center justify-center">
              {day !== null && (
                <span className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                  day === currentDay ? "bg-primary text-primary-foreground font-bold" : hasEvent ? "bg-primary/15 text-primary font-semibold" : "hover:bg-secondary"
                }`}>{day}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-3 pt-4 border-t border-border/50">
        <h4 className="text-sm font-semibold">Upcoming Events</h4>
        {events.map((event) => (
          <div key={event.title} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
            <span className={`w-3 h-3 rounded-full ${event.color} shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};