import { ChevronLeft, ChevronRight } from "lucide-react";

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

const events = [
  { day: 18, title: "Client Review", time: "10:00 AM", color: "bg-foreground" },
  { day: 20, title: "Design Sprint", time: "2:00 PM", color: "bg-muted-foreground" },
  { day: 22, title: "Deadline", time: "5:00 PM", color: "bg-warning" },
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
  return { cells, currentDay };
};

/** Compact preview */
export const CalendarPreview = () => {
  const today = new Date();
  const dayNum = today.getDate();
  const month = today.toLocaleDateString("en-US", { month: "short" });
  const dayName = today.toLocaleDateString("en-US", { weekday: "short" });

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight">{dayNum}</span>
          <span className="text-sm text-muted-foreground">{month}, {dayName}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">3 events this week</p>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {events.map((e) => (
          <div key={e.title} className="flex items-center gap-1.5 bg-muted/40 rounded-lg px-2 py-1">
            <span className={`w-1.5 h-1.5 rounded-full ${e.color}`} />
            <span className="text-[10px] font-medium truncate">{e.title}</span>
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
          <button className="rounded-xl p-2 hover:bg-secondary transition-colors"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
          <button className="rounded-xl p-2 hover:bg-secondary transition-colors"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
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
                  day === currentDay ? "bg-foreground text-background font-bold"
                    : hasEvent ? "bg-foreground/10 text-foreground font-semibold"
                    : "hover:bg-secondary"
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
