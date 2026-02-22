import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSizeTier } from "./WidgetCard";

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

const events = [
  { day: 18, title: "Client Review — Flux", time: "10:00 AM" },
  { day: 20, title: "Design Sprint", time: "2:00 PM" },
  { day: 22, title: "Hand-off Deadline", time: "5:00 PM" },
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

  if (tier === "compact") return null;

  if (tier === "standard") {
    return (
      <div className="flex flex-col h-full gap-1.5 mt-1">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight leading-none">{dayNum}</p>
          <p className="text-[10px] text-muted-foreground">{dayName}</p>
        </div>
        <div className="flex-1 space-y-1 overflow-hidden">
          {events.slice(0, 3).map((event) => (
            <div key={event.title} className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-foreground/30 shrink-0" />
              <span className="text-[10px] font-medium truncate flex-1">{event.title}</span>
              <span className="text-[8px] text-muted-foreground shrink-0">{event.time}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // expanded — mini calendar + events
  const { cells, currentDay } = generateDays();
  const eventDays = events.map(e => e.day);

  return (
    <div className="flex flex-col h-full gap-2 mt-1">
      <div className="flex items-start justify-between">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight leading-none">{dayNum}</p>
          <p className="text-xs text-muted-foreground">{month} · {dayName}</p>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {dayLabels.map((d, i) => (
          <span key={i} className="text-[7px] text-muted-foreground font-medium">{d}</span>
        ))}
        {cells.slice(0, 35).map((day, i) => (
          <div key={i} className={cn(
            "text-[8px] w-4 h-4 flex items-center justify-center rounded-full mx-auto",
            day === currentDay && "bg-foreground text-primary-foreground font-bold",
            day && eventDays.includes(day) && day !== currentDay && "ring-1 ring-foreground/30",
          )}>
            {day || ""}
          </div>
        ))}
      </div>
      <div className="space-y-1 mt-auto pt-1 border-t border-foreground/8">
        {events.map((event) => (
          <div key={event.title} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground/25 shrink-0" />
            <span className="text-[10px] font-medium truncate flex-1">{event.title}</span>
            <span className="text-[8px] text-muted-foreground">{event.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CalendarExpanded = () => {
  const { cells, currentDay } = generateDays();
  const today = new Date();
  const monthName = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const eventDays = events.map(e => e.day);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{monthName}</h3>
        <div className="flex gap-1">
          <button className="p-1.5 rounded-xl hover:bg-secondary"><ChevronLeft className="w-4 h-4" /></button>
          <button className="p-1.5 rounded-xl hover:bg-secondary"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dayLabels.map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className={cn(
            "aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-colors relative",
            day === currentDay && "bg-foreground text-primary-foreground font-bold",
            day && day !== currentDay && "hover:bg-secondary cursor-pointer",
            !day && "invisible"
          )}>
            {day}
            {day && eventDays.includes(day) && (
              <div className={cn("w-1 h-1 rounded-full mt-0.5", day === currentDay ? "bg-primary-foreground" : "bg-foreground/40")} />
            )}
          </div>
        ))}
      </div>
      <div className="space-y-2 pt-2 border-t border-foreground/8">
        <h4 className="text-sm font-medium text-muted-foreground">Upcoming</h4>
        {events.map((event) => (
          <div key={event.title} className="flex items-center gap-3 p-2 rounded-xl bg-secondary/30">
            <div className="w-2 h-2 rounded-full bg-foreground/25 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.time} · Feb {event.day}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
