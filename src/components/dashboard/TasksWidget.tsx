import { useState } from "react";
import { Plus, Check, Circle, Clock, Flag, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  project?: string;
}

const initialTasks: Task[] = [
  { id: "1", title: "Finalize brand guidelines for Flux Labs", completed: false, priority: "high", dueDate: "2026-02-23", project: "Brand Identity" },
  { id: "2", title: "Review wireframes with client", completed: false, priority: "high", dueDate: "2026-02-24", project: "Website V2" },
  { id: "3", title: "Export icon set for mobile app", completed: true, priority: "medium", dueDate: "2026-02-21", project: "Mobile App UI" },
  { id: "4", title: "Update portfolio with recent work", completed: false, priority: "low", dueDate: "2026-02-28" },
  { id: "5", title: "Send revised invoice to Nextwave", completed: false, priority: "medium", dueDate: "2026-02-25" },
  { id: "6", title: "Set up staging environment", completed: true, priority: "medium", dueDate: "2026-02-20", project: "Website V2" },
];

const priorityConfig = {
  high: { label: "High", className: "text-destructive", color: "hsl(var(--destructive))" },
  medium: { label: "Med", className: "text-warning", color: "hsl(var(--warning))" },
  low: { label: "Low", className: "text-muted-foreground", color: "hsl(var(--muted-foreground))" },
};

/** Compact preview */
export const TasksPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const h = pixelSize?.height ?? 140;
  const w = pixelSize?.width ?? 300;
  const pending = initialTasks.filter(t => !t.completed);
  const completed = initialTasks.filter(t => t.completed);

  const titleSize = h > 300 ? "text-4xl" : h > 200 ? "text-3xl" : "text-2xl";
  const labelSize = h > 300 ? "text-sm" : h > 200 ? "text-xs" : "text-[11px]";
  const itemSize = w > 400 ? "text-sm" : h > 240 ? "text-xs" : "text-[11px]";
  const subSize = w > 400 ? "text-xs" : "text-[10px]";

  const showList = h > 180;
  const showProject = w > 300;
  const showDue = h > 280;
  const itemCount = h > 400 ? pending.length : h > 320 ? 4 : h > 240 ? 3 : 2;

  if (!showList) {
    return (
      <div>
        <p className={`${titleSize} font-bold tracking-tight`}>{pending.length}</p>
        <p className={`${labelSize} text-muted-foreground mt-1`}>Pending tasks</p>
        {h > 160 && (
          <p className={`${subSize} opacity-40 mt-1`}>{completed.length} completed</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className={`${labelSize} text-muted-foreground font-medium`}>{pending.length} Pending</p>
        <p className={`${subSize} opacity-40`}>{completed.length} done</p>
      </div>
      {pending.slice(0, itemCount).map((task) => (
        <div key={task.id} className="flex items-center gap-2 py-0.5">
          <Flag className={cn("w-3 h-3 shrink-0", priorityConfig[task.priority].className)} />
          <span className={`${itemSize} font-medium truncate flex-1`}>{task.title}</span>
          {showProject && task.project && (
            <span className={`${subSize} opacity-40 shrink-0`}>{task.project}</span>
          )}
          {showDue && task.dueDate && (
            <span className={`${subSize} opacity-40 shrink-0`}>
              {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

/** Full expanded view */
export const TasksExpanded = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("medium");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Task deleted");
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: String(Date.now()),
      title: newTitle.trim(),
      completed: false,
      priority: newPriority,
    };
    setTasks((prev) => [task, ...prev]);
    setNewTitle("");
    toast.success("Task added");
  };

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a new task…"
          className="rounded-xl flex-1"
        />
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as Task["priority"])}
          className="rounded-xl border border-input bg-background px-3 text-xs"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <Button onClick={addTask} size="sm" className="rounded-xl gap-1">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      <div className="flex gap-2">
        {(["all", "pending", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium transition-colors capitalize",
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            )}
          >
            {f} {f === "all" ? `(${tasks.length})` : f === "pending" ? `(${tasks.filter((t) => !t.completed).length})` : `(${tasks.filter((t) => t.completed).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-colors",
              task.completed ? "bg-secondary/20 opacity-60" : "bg-secondary/30 hover:bg-secondary/50"
            )}
          >
            <button onClick={() => toggleTask(task.id)} className="shrink-0">
              {task.completed ? (
                <Check className="w-5 h-5 text-success" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium", task.completed && "line-through text-muted-foreground")}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {task.project && (
                  <span className="text-[10px] text-muted-foreground">{task.project}</span>
                )}
                {task.dueDate && (
                  <span className={cn(
                    "text-[10px]",
                    !task.completed && new Date(task.dueDate) < new Date() ? "text-destructive" : "text-muted-foreground"
                  )}>
                    <Clock className="w-3 h-3 inline mr-0.5" />
                    {task.dueDate}
                  </span>
                )}
              </div>
            </div>
            <Flag className={cn("w-3.5 h-3.5 shrink-0", priorityConfig[task.priority].className)} />
            <button onClick={() => deleteTask(task.id)} className="rounded-lg p-1.5 hover:bg-secondary transition-colors shrink-0">
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
