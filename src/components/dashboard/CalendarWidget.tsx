import { ChevronLeft, ChevronRight } from "lucide-react";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

  return { cells, currentDay };
};

const CalendarWidget = () => {
  const { cells, currentDay } = generateDays();
  const monthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const eventDays = events.map((e) => e.day);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{monthName}</span>
        <div className="flex gap-1">
          <button className="rounded-lg p-1 hover:bg-secondary transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="rounded-lg p-1 hover:bg-secondary transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {dayLabels.map((d) => (
          <span key={d} className="text-[10px] text-muted-foreground font-medium py-1">
            {d}
          </span>
        ))}
        {cells.map((day, i) => (
          <div key={i} className="relative flex items-center justify-center">
            {day !== null && (
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-colors ${
                  day === currentDay
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-secondary"
                }`}
              >
                {day}
                {eventDays.includes(day) && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-accent" />
                )}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-2 border-t border-border/50">
        {events.map((event) => (
          <div key={event.title} className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${event.color} shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{event.title}</p>
              <p className="text-[10px] text-muted-foreground">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;
