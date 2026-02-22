import { useState } from "react";
import { Plus, Check, Circle, Clock, Flag, X, Trash2, ListTodo, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getSizeTier } from "./WidgetCard";

interface Task {
  id: string; title: string; completed: boolean;
  priority: "high" | "medium" | "low"; dueDate?: string; project?: string;
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
  high: { label: "High", className: "text-foreground", color: "hsl(var(--foreground))" },
  medium: { label: "Med", className: "text-foreground/50", color: "hsl(var(--foreground) / 0.5)" },
  low: { label: "Low", className: "text-muted-foreground", color: "hsl(var(--muted-foreground))" },
};

export const TasksPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const tier = getSizeTier(pixelSize);
  const pending = initialTasks.filter(t => !t.completed);
  const completed = initialTasks.filter(t => t.completed);

  if (tier === "compact") return null;

  if (tier === "standard") {
    return (
      <div className="flex flex-col h-full gap-1.5 mt-1">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4" style={{ color: "#ef4444" }} />
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight leading-none">{pending.length}</p>
            <p className="text-[10px] text-muted-foreground">pending</p>
          </div>
        </div>
        <div className="flex-1 space-y-1 overflow-hidden">
          {pending.slice(0, 3).map((task) => (
            <div key={task.id} className="flex items-center gap-1.5">
              <Circle className="w-2.5 h-2.5 shrink-0" style={{ color: "#ef444480" }} />
              <span className="text-[10px] font-medium truncate">{task.title}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex-1 h-1.5 bg-foreground/8 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.round((completed.length / initialTasks.length) * 100)}%`, background: "#ef4444" }} />
          </div>
          <span className="text-[9px] text-muted-foreground">{completed.length}/{initialTasks.length}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-2 mt-1">
      <div className="flex items-start justify-between">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight leading-none">{pending.length}</p>
          <p className="text-xs text-muted-foreground">pending</p>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">{completed.length} done</span>
      </div>
      <div className="flex-1 space-y-1.5 overflow-hidden">
        {pending.map((task) => (
          <div key={task.id} className="flex items-center gap-2">
            <Circle className="w-3 h-3 shrink-0 text-foreground/20" />
            <span className="text-[10px] font-medium truncate flex-1">{task.title}</span>
            {task.project && <span className="text-[8px] text-muted-foreground shrink-0">{task.project}</span>}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-auto pt-1 border-t border-foreground/8">
        <div className="flex-1 h-1 bg-foreground/8 rounded-full overflow-hidden">
          <div className="h-full bg-foreground/20 rounded-full" style={{ width: `${Math.round((completed.length / initialTasks.length) * 100)}%` }} />
        </div>
        <span className="text-[9px] text-muted-foreground">{completed.length}/{initialTasks.length} complete</span>
      </div>
    </div>
  );
};

export const TasksExpanded = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("medium");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Task deleted");
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    const task: Task = { id: String(Date.now()), title: newTitle.trim(), completed: false, priority: newPriority };
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
        <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} placeholder="Add a new task…" className="rounded-xl flex-1" />
        <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as Task["priority"])} className="rounded-xl border border-input bg-background px-3 text-xs">
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <Button onClick={addTask} size="sm" className="rounded-xl gap-1"><Plus className="w-4 h-4" />Add</Button>
      </div>
      <div className="flex gap-2">
        {(["all", "pending", "completed"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("px-3 py-1.5 rounded-xl text-xs font-medium transition-colors capitalize", filter === f ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:bg-secondary")}>
            {f} {f === "all" ? `(${tasks.length})` : f === "pending" ? `(${tasks.filter((t) => !t.completed).length})` : `(${tasks.filter((t) => t.completed).length})`}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((task) => (
          <div key={task.id} className={cn("flex items-center gap-3 p-3 rounded-xl transition-colors", task.completed ? "bg-secondary/20 opacity-60" : "bg-secondary/30 hover:bg-secondary/50")}>
            <button onClick={() => toggleTask(task.id)} className="shrink-0">
              {task.completed ? <Check className="w-5 h-5 text-foreground/50" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium", task.completed && "line-through text-muted-foreground")}>{task.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {task.project && <span className="text-[10px] text-muted-foreground">{task.project}</span>}
                {task.dueDate && <span className={cn("text-[10px]", !task.completed && new Date(task.dueDate) < new Date() ? "text-foreground font-semibold" : "text-muted-foreground")}><Clock className="w-3 h-3 inline mr-0.5" />{task.dueDate}</span>}
              </div>
            </div>
            <Flag className={cn("w-3.5 h-3.5 shrink-0", priorityConfig[task.priority].className)} />
            <button onClick={() => deleteTask(task.id)} className="rounded-lg p-1.5 hover:bg-secondary transition-colors shrink-0"><Trash2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};
