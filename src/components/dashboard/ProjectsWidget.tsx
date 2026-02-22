import { useState, useMemo } from "react";
import {
  Plus, Search, Filter, LayoutGrid, List, Calendar, MoreHorizontal,
  ChevronDown, ChevronRight, Clock, Users, CheckCircle2, Circle,
  AlertCircle, ArrowUpRight, Trash2, Edit3, X, GripVertical,
  Target, Flag, Tag, Paperclip, MessageSquare, FolderKanban,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { getSizeTier } from "./WidgetCard";

type Priority = "low" | "medium" | "high" | "urgent";
type TaskStatus = "todo" | "in_progress" | "review" | "done";
type ProjectStatus = "planning" | "active" | "on_hold" | "completed";

interface Task {
  id: string; title: string; description: string; status: TaskStatus;
  priority: Priority; assignee: string; dueDate: string; tags: string[];
  comments: number; attachments: number;
}

interface Milestone { id: string; title: string; dueDate: string; completed: boolean; }

interface Project {
  id: string; name: string; client: string; status: ProjectStatus;
  progress: number; deadline: string; description: string; team: string[];
  tasks: Task[]; milestones: Milestone[]; color: string; budget: number; spent: number;
}

const TEAM = ["Alex M.", "Sarah K.", "James L.", "Nina P.", "Tom R.", "Yuki H."];
const COLORS = [
  "hsl(220 10% 30%)", "hsl(220 10% 45%)", "hsl(220 10% 55%)",
  "hsl(220 10% 65%)", "hsl(220 10% 40%)", "hsl(220 10% 50%)",
];
const TAG_POOL = ["design", "dev", "branding", "ui", "ux", "print", "web", "mobile", "strategy", "research"];

const makeTasks = (seeds: Partial<Task>[]): Task[] =>
  seeds.map((s, i) => ({
    id: `t-${Date.now()}-${i}`, title: s.title || "Untitled", description: s.description || "",
    status: s.status || "todo", priority: s.priority || "medium",
    assignee: s.assignee || TEAM[i % TEAM.length], dueDate: s.dueDate || "Mar 20",
    tags: s.tags || [], comments: s.comments ?? Math.floor(Math.random() * 5),
    attachments: s.attachments ?? Math.floor(Math.random() * 3),
  }));

const INITIAL_PROJECTS: Project[] = [
  {
    id: "p1", name: "Brand Identity — Flux", client: "Flux Labs", status: "active",
    progress: 72, deadline: "Mar 15", description: "Complete brand identity system.",
    team: ["Alex M.", "Sarah K.", "Nina P."], color: COLORS[0], budget: 12000, spent: 8640,
    tasks: makeTasks([
      { title: "Logo concepts v3", status: "done", priority: "high", tags: ["design", "branding"] },
      { title: "Typography system", status: "in_progress", priority: "high", tags: ["design"] },
      { title: "Color palette refinement", status: "in_progress", priority: "medium", tags: ["design", "branding"] },
      { title: "Brand guidelines doc", status: "todo", priority: "medium", tags: ["strategy"] },
      { title: "Social media templates", status: "todo", priority: "low", tags: ["design", "web"] },
      { title: "Stationery design", status: "review", priority: "medium", tags: ["print"] },
    ]),
    milestones: [
      { id: "m1", title: "Logo approval", dueDate: "Feb 28", completed: true },
      { id: "m2", title: "Brand book draft", dueDate: "Mar 10", completed: false },
      { id: "m3", title: "Final delivery", dueDate: "Mar 15", completed: false },
    ],
  },
  {
    id: "p2", name: "Website Redesign", client: "Mono Studio", status: "active",
    progress: 15, deadline: "Apr 2", description: "Full website redesign.",
    team: ["James L.", "Tom R."], color: COLORS[1], budget: 18000, spent: 2700,
    tasks: makeTasks([
      { title: "Competitor analysis", status: "done", priority: "medium", tags: ["research"] },
      { title: "Wireframes — homepage", status: "in_progress", priority: "high", tags: ["ux", "web"] },
      { title: "Wireframes — inner pages", status: "todo", priority: "high", tags: ["ux", "web"] },
      { title: "Visual design system", status: "todo", priority: "high", tags: ["ui", "design"] },
    ]),
    milestones: [
      { id: "m4", title: "Research complete", dueDate: "Mar 5", completed: true },
      { id: "m5", title: "Design approval", dueDate: "Mar 20", completed: false },
    ],
  },
  {
    id: "p3", name: "Mobile App UI", client: "Nextwave", status: "active",
    progress: 48, deadline: "Mar 28", description: "Design a mobile application.",
    team: ["Yuki H.", "Alex M.", "Sarah K.", "Tom R."], color: COLORS[2], budget: 22000, spent: 10560,
    tasks: makeTasks([
      { title: "User flow mapping", status: "done", priority: "high", tags: ["ux", "mobile"] },
      { title: "Onboarding screens", status: "done", priority: "high", tags: ["ui", "mobile"] },
      { title: "Dashboard design", status: "in_progress", priority: "high", tags: ["ui", "mobile"] },
      { title: "Settings & profile", status: "in_progress", priority: "medium", tags: ["ui"] },
    ]),
    milestones: [
      { id: "m7", title: "Core screens done", dueDate: "Mar 15", completed: false },
    ],
  },
  {
    id: "p4", name: "Packaging Design", client: "Verdant Co", status: "completed",
    progress: 100, deadline: "Feb 10", description: "Eco-friendly packaging design.",
    team: ["Nina P.", "James L."], color: COLORS[3], budget: 8000, spent: 7800,
    tasks: makeTasks([
      { title: "Concept sketches", status: "done", priority: "high", tags: ["design", "print"] },
      { title: "Print-ready files", status: "done", priority: "high", tags: ["print"] },
    ]),
    milestones: [
      { id: "m9", title: "Concept approval", dueDate: "Jan 20", completed: true },
      { id: "m10", title: "Final delivery", dueDate: "Feb 10", completed: true },
    ],
  },
];

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const STATUS_CONFIG: Record<ProjectStatus, { label: string; style: string; icon: React.ReactNode }> = {
  planning: { label: "Planning", style: "bg-muted text-muted-foreground", icon: <Circle className="w-3 h-3" /> },
  active: { label: "Active", style: "bg-foreground/10 text-foreground", icon: <Clock className="w-3 h-3" /> },
  on_hold: { label: "On Hold", style: "bg-foreground/5 text-muted-foreground", icon: <AlertCircle className="w-3 h-3" /> },
  completed: { label: "Completed", style: "bg-foreground/10 text-foreground/70", icon: <CheckCircle2 className="w-3 h-3" /> },
};

const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; style: string }> = {
  todo: { label: "To Do", style: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", style: "bg-foreground/10 text-foreground" },
  review: { label: "Review", style: "bg-foreground/5 text-muted-foreground" },
  done: { label: "Done", style: "bg-foreground/10 text-foreground/70" },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; style: string }> = {
  low: { label: "Low", style: "text-muted-foreground" },
  medium: { label: "Medium", style: "text-foreground/60" },
  high: { label: "High", style: "text-foreground" },
  urgent: { label: "Urgent", style: "text-foreground" },
};

const previewProjects = INITIAL_PROJECTS.slice(0, 4);

export const ProjectsPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const tier = getSizeTier(pixelSize);
  const active = previewProjects.filter(p => p.status === "active").length;
  const totalTasks = previewProjects.reduce((s, p) => s + p.tasks.length, 0);
  const doneTasks = previewProjects.reduce((s, p) => s + p.tasks.filter(t => t.status === "done").length, 0);

  if (tier === "compact") return null;

  if (tier === "standard") {
    return (
      <div className="flex flex-col h-full gap-2 mt-1">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-4 h-4" style={{ color: "#6366f1" }} />
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight leading-none">{active}</p>
            <p className="text-[10px] text-muted-foreground">active</p>
          </div>
        </div>
        <div className="flex-1 space-y-1.5 overflow-hidden">
          {previewProjects.filter(p => p.status === "active").slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#6366f180" }} />
              <span className="text-[10px] font-medium truncate flex-1">{p.name}</span>
              <span className="text-[9px] text-muted-foreground">{p.progress}%</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex-1 h-1.5 bg-foreground/8 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.round((doneTasks / totalTasks) * 100)}%`, background: "#6366f1" }} />
          </div>
          <span className="text-[9px] text-muted-foreground">{doneTasks}/{totalTasks}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-2 mt-1">
      <div className="flex items-start justify-between">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight leading-none">{active}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">{doneTasks} done</span>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        {previewProjects.map((p) => {
          const cfg = STATUS_CONFIG[p.status];
          return (
            <div key={p.id} className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-foreground/25 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium truncate">{p.name}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${cfg.style}`}>{cfg.label}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1 bg-foreground/8 rounded-full overflow-hidden">
                    <div className="h-full bg-foreground/20 rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{p.progress}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-auto pt-1 border-t border-foreground/8">
        <span>{previewProjects.length} projects</span>
        <div className="flex -space-x-1">
          {TEAM.slice(0, 4).map((t, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-foreground/10 border border-background flex items-center justify-center text-[6px] font-bold">{t.charAt(0)}</div>
          ))}
        </div>
        <span>{totalTasks} tasks</span>
      </div>
    </div>
  );
};

const TaskCard = ({
  task,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}) => {
  const pri = PRIORITY_CONFIG[task.priority];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group bg-background/60 backdrop-blur-sm border border-border/40 rounded-xl p-3.5 hover:border-border/70 hover:shadow-sm transition-all cursor-default"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Flag className={`w-3 h-3 shrink-0 ${pri.style}`} />
            <p className="text-sm font-medium truncate">{task.title}</p>
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {task.tags.map(tag => (
              <span key={tag} className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-md">{tag}</span>
            ))}
          </div>
        </div>
        <button onClick={() => onDelete(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/10">
          <Trash2 className="w-3.5 h-3.5 text-destructive/60" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold">
            {task.assignee.charAt(0)}
          </div>
          <span className="text-[10px] text-muted-foreground">{task.dueDate}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {task.comments > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <MessageSquare className="w-3 h-3" />{task.comments}
            </span>
          )}
          {task.attachments > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <Paperclip className="w-3 h-3" />{task.attachments}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const KanbanColumn = ({
  status,
  tasks,
  onStatusChange,
  onDeleteTask,
}: {
  status: TaskStatus;
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDeleteTask: (id: string) => void;
}) => {
  const cfg = TASK_STATUS_CONFIG[status];
  return (
    <div className="flex-1 min-w-[260px] max-w-[340px]">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${cfg.style}`}>{cfg.label}</span>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="space-y-2.5 min-h-[100px]">
        <AnimatePresence>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} onDelete={onDeleteTask} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ProjectDetail = ({
  project,
  onBack,
  onUpdate,
}: {
  project: Project;
  onBack: () => void;
  onUpdate: (p: Project) => void;
}) => {
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" as Priority });

  const addTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = {
      id: uid(), title: newTask.title, description: newTask.description,
      status: "todo", priority: newTask.priority, assignee: TEAM[0],
      dueDate: "Mar 25", tags: [], comments: 0, attachments: 0,
    };
    onUpdate({ ...project, tasks: [task, ...project.tasks] });
    setNewTask({ title: "", description: "", priority: "medium" });
    setShowAddTask(false);
  };

  const filteredTasks = project.tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  const changeStatus = (id: string, status: TaskStatus) => {
    onUpdate({ ...project, tasks: project.tasks.map(t => t.id === id ? { ...t, status } : t) });
  };

  const deleteTask = (id: string) => {
    onUpdate({ ...project, tasks: project.tasks.filter(t => t.id !== id) });
  };

  const doneCount = project.tasks.filter(t => t.status === "done").length;
  const cfg = STATUS_CONFIG[project.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-xl hover:bg-secondary transition-colors">
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{project.name}</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.style}`}>{cfg.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{project.client} · {project.deadline}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Progress", value: `${project.progress}%` },
          { label: "Tasks", value: `${doneCount}/${project.tasks.length}` },
          { label: "Team", value: `${project.team.length}` },
          { label: "Budget", value: `$${(project.budget / 1000).toFixed(0)}k` },
        ].map(s => (
          <div key={s.label} className="bg-secondary/30 rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks…" className="pl-9 rounded-xl" />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[130px] rounded-xl"><Filter className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex rounded-xl border border-border overflow-hidden">
          <button onClick={() => setView("board")} className={`p-2 ${view === "board" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
        <Button size="sm" className="rounded-xl gap-1" onClick={() => setShowAddTask(true)}>
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </div>

      {view === "board" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {(["todo", "in_progress", "review", "done"] as TaskStatus[]).map(status => (
            <KanbanColumn key={status} status={status} tasks={filteredTasks.filter(t => t.status === status)} onStatusChange={changeStatus} onDeleteTask={deleteTask} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} onStatusChange={changeStatus} onDelete={deleteTask} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Task title" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} className="rounded-xl" />
            <Textarea placeholder="Description (optional)" value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} className="rounded-xl" />
            <Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v as Priority }))}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter><Button onClick={addTask} className="rounded-xl">Add Task</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const ProjectsExpanded = () => {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const selectedProject = projects.find(p => p.id === selectedId);

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => setSelectedId(null)}
        onUpdate={(updated) => setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))}
      />
    );
  }

  const filtered = projects.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.client.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects…" className="pl-9 rounded-xl" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] rounded-xl"><Filter className="w-3 h-3 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(p => {
          const cfg = STATUS_CONFIG[p.status];
          const done = p.tasks.filter(t => t.status === "done").length;
          return (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background/60 backdrop-blur-sm border border-border/40 rounded-xl p-4 hover:border-border/70 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => setSelectedId(p.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold">{p.name}</h3>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${cfg.style}`}>{cfg.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.client} · Due {p.deadline}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1.5 bg-foreground/8 rounded-full overflow-hidden">
                  <div className="h-full bg-foreground/20 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                </div>
                <span className="text-xs font-medium">{p.progress}%</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{done}/{p.tasks.length} tasks</span>
                <div className="flex -space-x-1.5">
                  {p.team.slice(0, 3).map((m, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-foreground/10 border border-background flex items-center justify-center text-[8px] font-bold">{m.charAt(0)}</div>
                  ))}
                  {p.team.length > 3 && <div className="w-5 h-5 rounded-full bg-foreground/10 border border-background flex items-center justify-center text-[8px]">+{p.team.length - 3}</div>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
