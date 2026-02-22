import { useState, useMemo } from "react";
import {
  Plus, Search, Filter, LayoutGrid, List, Calendar, MoreHorizontal,
  ChevronDown, ChevronRight, Clock, Users, CheckCircle2, Circle,
  AlertCircle, ArrowUpRight, Trash2, Edit3, X, GripVertical,
  Target, Flag, Tag, Paperclip, MessageSquare,
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

// ── Types ──

type Priority = "low" | "medium" | "high" | "urgent";
type TaskStatus = "todo" | "in_progress" | "review" | "done";
type ProjectStatus = "planning" | "active" | "on_hold" | "completed";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  dueDate: string;
  tags: string[];
  comments: number;
  attachments: number;
}

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  deadline: string;
  description: string;
  team: string[];
  tasks: Task[];
  milestones: Milestone[];
  color: string;
  budget: number;
  spent: number;
}

// ── Seed data ──

const TEAM = ["Alex M.", "Sarah K.", "James L.", "Nina P.", "Tom R.", "Yuki H."];
const COLORS = [
  "hsl(220 70% 55%)", "hsl(150 60% 45%)", "hsl(340 70% 55%)",
  "hsl(30 80% 55%)", "hsl(270 60% 55%)", "hsl(180 50% 45%)",
];
const TAG_POOL = ["design", "dev", "branding", "ui", "ux", "print", "web", "mobile", "strategy", "research"];

const makeTasks = (seeds: Partial<Task>[]): Task[] =>
  seeds.map((s, i) => ({
    id: `t-${Date.now()}-${i}`,
    title: s.title || "Untitled",
    description: s.description || "",
    status: s.status || "todo",
    priority: s.priority || "medium",
    assignee: s.assignee || TEAM[i % TEAM.length],
    dueDate: s.dueDate || "Mar 20",
    tags: s.tags || [],
    comments: s.comments ?? Math.floor(Math.random() * 5),
    attachments: s.attachments ?? Math.floor(Math.random() * 3),
  }));

const INITIAL_PROJECTS: Project[] = [
  {
    id: "p1", name: "Brand Identity — Flux", client: "Flux Labs", status: "active",
    progress: 72, deadline: "Mar 15", description: "Complete brand identity system including logo, typography, color palette, and brand guidelines.",
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
    progress: 15, deadline: "Apr 2", description: "Full website redesign with modern aesthetics, improved UX, and responsive design.",
    team: ["James L.", "Tom R."], color: COLORS[1], budget: 18000, spent: 2700,
    tasks: makeTasks([
      { title: "Competitor analysis", status: "done", priority: "medium", tags: ["research"] },
      { title: "Wireframes — homepage", status: "in_progress", priority: "high", tags: ["ux", "web"] },
      { title: "Wireframes — inner pages", status: "todo", priority: "high", tags: ["ux", "web"] },
      { title: "Visual design system", status: "todo", priority: "high", tags: ["ui", "design"] },
      { title: "Responsive prototypes", status: "todo", priority: "medium", tags: ["dev", "web"] },
      { title: "CMS integration", status: "todo", priority: "low", tags: ["dev"] },
      { title: "SEO audit", status: "todo", priority: "low", tags: ["strategy", "web"] },
    ]),
    milestones: [
      { id: "m4", title: "Research complete", dueDate: "Mar 5", completed: true },
      { id: "m5", title: "Design approval", dueDate: "Mar 20", completed: false },
      { id: "m6", title: "Development done", dueDate: "Mar 30", completed: false },
    ],
  },
  {
    id: "p3", name: "Mobile App UI", client: "Nextwave", status: "active",
    progress: 48, deadline: "Mar 28", description: "Design a sleek mobile application for iOS and Android platforms.",
    team: ["Yuki H.", "Alex M.", "Sarah K.", "Tom R."], color: COLORS[2], budget: 22000, spent: 10560,
    tasks: makeTasks([
      { title: "User flow mapping", status: "done", priority: "high", tags: ["ux", "mobile"] },
      { title: "Onboarding screens", status: "done", priority: "high", tags: ["ui", "mobile"] },
      { title: "Dashboard design", status: "in_progress", priority: "high", tags: ["ui", "mobile"] },
      { title: "Settings & profile", status: "in_progress", priority: "medium", tags: ["ui"] },
      { title: "Notification system", status: "todo", priority: "medium", tags: ["ux", "mobile"] },
      { title: "Dark mode variants", status: "todo", priority: "low", tags: ["ui", "design"] },
      { title: "Prototype & testing", status: "todo", priority: "high", tags: ["ux"] },
      { title: "Dev handoff assets", status: "todo", priority: "medium", tags: ["design", "dev"] },
    ]),
    milestones: [
      { id: "m7", title: "Core screens done", dueDate: "Mar 15", completed: false },
      { id: "m8", title: "Client review", dueDate: "Mar 22", completed: false },
    ],
  },
  {
    id: "p4", name: "Packaging Design", client: "Verdant Co", status: "completed",
    progress: 100, deadline: "Feb 10", description: "Eco-friendly packaging design for new product line.",
    team: ["Nina P.", "James L."], color: COLORS[3], budget: 8000, spent: 7800,
    tasks: makeTasks([
      { title: "Concept sketches", status: "done", priority: "high", tags: ["design", "print"] },
      { title: "Material research", status: "done", priority: "medium", tags: ["research"] },
      { title: "3D mockups", status: "done", priority: "high", tags: ["design"] },
      { title: "Print-ready files", status: "done", priority: "high", tags: ["print"] },
    ]),
    milestones: [
      { id: "m9", title: "Concept approval", dueDate: "Jan 20", completed: true },
      { id: "m10", title: "Final delivery", dueDate: "Feb 10", completed: true },
    ],
  },
];

// ── Helpers ──

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const STATUS_CONFIG: Record<ProjectStatus, { label: string; style: string; icon: React.ReactNode }> = {
  planning: { label: "Planning", style: "bg-muted text-muted-foreground", icon: <Circle className="w-3 h-3" /> },
  active: { label: "Active", style: "bg-primary/10 text-primary", icon: <Clock className="w-3 h-3" /> },
  on_hold: { label: "On Hold", style: "bg-warning/10 text-warning", icon: <AlertCircle className="w-3 h-3" /> },
  completed: { label: "Completed", style: "bg-emerald-500/10 text-emerald-600", icon: <CheckCircle2 className="w-3 h-3" /> },
};

const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; style: string }> = {
  todo: { label: "To Do", style: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", style: "bg-primary/10 text-primary" },
  review: { label: "Review", style: "bg-amber-500/10 text-amber-600" },
  done: { label: "Done", style: "bg-emerald-500/10 text-emerald-600" },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; style: string }> = {
  low: { label: "Low", style: "text-muted-foreground" },
  medium: { label: "Medium", style: "text-primary" },
  high: { label: "High", style: "text-amber-500" },
  urgent: { label: "Urgent", style: "text-destructive" },
};

// ── Widget Preview (unchanged logic) ──

const previewProjects = INITIAL_PROJECTS.slice(0, 4);
const statusStyles: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  completed: "bg-emerald-500/10 text-emerald-600",
  planning: "bg-muted text-muted-foreground",
  on_hold: "bg-warning/10 text-warning",
};
const statusLabels: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  planning: "Planning",
  on_hold: "On Hold",
};

export const ProjectsPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const h = pixelSize?.height ?? 140;
  const w = pixelSize?.width ?? 300;
  const titleSize = h > 300 ? "text-4xl" : h > 200 ? "text-3xl" : "text-2xl";
  const labelSize = h > 300 ? "text-sm" : h > 200 ? "text-xs" : "text-[11px]";
  const itemNameSize = w > 400 ? "text-sm" : h > 240 ? "text-xs" : "text-[11px]";
  const subSize = w > 400 ? "text-xs" : "text-[10px]";
  const badgeSize = w > 400 ? "text-[11px]" : "text-[9px]";
  const showList = h > 180;
  const showProgress = h > 260;
  const showDeadline = w > 350;
  const itemCount = h > 400 ? previewProjects.length : h > 300 ? 4 : h > 240 ? 3 : 2;

  if (!showList) {
    const active = previewProjects.filter(p => p.status === "active").length;
    const completed = previewProjects.filter(p => p.status === "completed").length;
    return (
      <div>
        <p className={`${titleSize} font-bold tracking-tight`}>{previewProjects.length}</p>
        <p className={`${labelSize} opacity-60 mt-1`}>Active Projects</p>
        {h > 160 && (
          <div className={`flex gap-3 mt-2 ${subSize} opacity-50`}>
            <span>{active} active</span>
            <span>{completed} done</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className={`${labelSize} opacity-60 font-medium`}>{previewProjects.length} Projects</p>
      {previewProjects.slice(0, itemCount).map((project) => (
        <div key={project.name} className="flex items-center gap-2 py-1">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
          <div className="flex-1 min-w-0">
            <p className={`${itemNameSize} font-medium truncate`}>{project.name}</p>
            <p className={`${subSize} opacity-50`}>{project.client}</p>
          </div>
          {showDeadline && <span className={`${subSize} opacity-40 shrink-0`}>{project.deadline}</span>}
          {showProgress ? (
            <div className="w-16 shrink-0">
              <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${project.progress}%`, backgroundColor: project.color, opacity: 0.6 }} />
              </div>
              <p className="text-[9px] opacity-50 mt-0.5 text-right">{project.progress}%</p>
            </div>
          ) : (
            <span className={`${badgeSize} font-medium px-1.5 py-0.5 rounded-full ${statusStyles[project.status]}`}>
              {statusLabels[project.status]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// ── Task Card Component ──

const TaskCard = ({ task, onStatusChange, onDelete }: {
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

// ── Kanban Column ──

const KanbanColumn = ({ status, tasks, onStatusChange, onDeleteTask }: {
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

// ── Project Detail View ──

const ProjectDetail = ({ project, onBack, onUpdate }: {
  project: Project;
  onBack: () => void;
  onUpdate: (p: Project) => void;
}) => {
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" as Priority, assignee: project.team[0] || TEAM[0], tags: "" });

  const filteredTasks = useMemo(() => {
    return project.tasks.filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      return true;
    });
  }, [project.tasks, search, filterPriority]);

  const tasksByStatus = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], review: [], done: [] };
    filteredTasks.forEach(t => groups[t.status].push(t));
    return groups;
  }, [filteredTasks]);

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const updatedTasks = project.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    const done = updatedTasks.filter(t => t.status === "done").length;
    const progress = Math.round((done / updatedTasks.length) * 100);
    onUpdate({ ...project, tasks: updatedTasks, progress });
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = project.tasks.filter(t => t.id !== taskId);
    const done = updatedTasks.filter(t => t.status === "done").length;
    const progress = updatedTasks.length > 0 ? Math.round((done / updatedTasks.length) * 100) : 0;
    onUpdate({ ...project, tasks: updatedTasks, progress });
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = {
      id: `t-${uid()}`,
      title: newTask.title,
      description: newTask.description,
      status: "todo",
      priority: newTask.priority,
      assignee: newTask.assignee,
      dueDate: project.deadline,
      tags: newTask.tags.split(",").map(s => s.trim()).filter(Boolean),
      comments: 0,
      attachments: 0,
    };
    const updatedTasks = [...project.tasks, task];
    const done = updatedTasks.filter(t => t.status === "done").length;
    const progress = Math.round((done / updatedTasks.length) * 100);
    onUpdate({ ...project, tasks: updatedTasks, progress });
    setNewTask({ title: "", description: "", priority: "medium", assignee: project.team[0] || TEAM[0], tags: "" });
    setNewTaskOpen(false);
  };

  const stat = STATUS_CONFIG[project.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={onBack} className="mt-1 p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
            <h2 className="text-xl font-bold truncate">{project.name}</h2>
            <Badge variant="secondary" className={`${stat.style} text-[11px] shrink-0`}>
              {stat.icon}
              <span className="ml-1">{stat.label}</span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground ml-6">{project.client} · Due {project.deadline}</p>
          <p className="text-xs text-muted-foreground mt-2 ml-6 max-w-2xl">{project.description}</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ml-6">
        <div className="bg-background/50 border border-border/30 rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Progress</p>
          <p className="text-lg font-bold mt-0.5">{project.progress}%</p>
          <Progress value={project.progress} className="h-1.5 mt-1.5" />
        </div>
        <div className="bg-background/50 border border-border/30 rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tasks</p>
          <p className="text-lg font-bold mt-0.5">{project.tasks.length}</p>
          <p className="text-[10px] text-muted-foreground">{project.tasks.filter(t => t.status === "done").length} completed</p>
        </div>
        <div className="bg-background/50 border border-border/30 rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Budget</p>
          <p className="text-lg font-bold mt-0.5">${project.spent.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">of ${project.budget.toLocaleString()}</p>
        </div>
        <div className="bg-background/50 border border-border/30 rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Team</p>
          <div className="flex -space-x-1.5 mt-1.5">
            {project.team.slice(0, 4).map(m => (
              <div key={m} className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] font-semibold">{m.charAt(0)}</div>
            ))}
            {project.team.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px]">+{project.team.length - 4}</div>
            )}
          </div>
        </div>
      </div>

      {/* Milestones */}
      {project.milestones.length > 0 && (
        <div className="ml-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Milestones</p>
          <div className="flex flex-wrap gap-2">
            {project.milestones.map(ms => (
              <div key={ms.id} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${ms.completed ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600" : "bg-background/50 border-border/30 text-muted-foreground"}`}>
                {ms.completed ? <CheckCircle2 className="w-3 h-3" /> : <Target className="w-3 h-3" />}
                <span className="font-medium">{ms.title}</span>
                <span className="opacity-60">· {ms.dueDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task toolbar */}
      <div className="flex items-center gap-2 ml-6 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-background/50 border-border/40"
          />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="h-8 w-[120px] text-xs bg-background/50 border-border/40">
            <Filter className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center border border-border/40 rounded-lg overflow-hidden">
          <button onClick={() => setView("board")} className={`px-2.5 py-1.5 text-xs ${view === "board" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/30"}`}>
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setView("list")} className={`px-2.5 py-1.5 text-xs ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/30"}`}>
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setNewTaskOpen(true)}>
          <Plus className="w-3 h-3" /> Add Task
        </Button>
      </div>

      {/* Board / List view */}
      <div className="ml-6">
        {view === "board" ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {(["todo", "in_progress", "review", "done"] as TaskStatus[]).map(status => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                onStatusChange={handleStatusChange}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredTasks.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No tasks match your filters.</p>}
            {filteredTasks.map(task => {
              const tCfg = TASK_STATUS_CONFIG[task.status];
              const pri = PRIORITY_CONFIG[task.priority];
              return (
                <div key={task.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-background/50 border border-transparent hover:border-border/30 transition-all">
                  <Flag className={`w-3.5 h-3.5 shrink-0 ${pri.style}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-md">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold shrink-0">{task.assignee.charAt(0)}</div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{task.dueDate}</span>
                  <Select value={task.status} onValueChange={(v) => handleStatusChange(task.id, v as TaskStatus)}>
                    <SelectTrigger className="h-6 w-[100px] text-[10px] border-none bg-transparent p-0 px-1.5">
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium ${tCfg.style}`}>{tCfg.label}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {(["todo", "in_progress", "review", "done"] as TaskStatus[]).map(s => (
                        <SelectItem key={s} value={s}>{TASK_STATUS_CONFIG[s].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5 text-destructive/60" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Task Dialog */}
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Task title" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} />
            <Textarea placeholder="Description (optional)" value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} className="min-h-[60px]" />
            <div className="grid grid-cols-2 gap-2">
              <Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v as Priority }))}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newTask.assignee} onValueChange={v => setNewTask(p => ({ ...p, assignee: v }))}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {project.team.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Tags (comma separated)" value={newTask.tags} onChange={e => setNewTask(p => ({ ...p, tags: e.target.value }))} className="text-xs" />
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setNewTaskOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Full Expanded View ──

export const ProjectsExpanded = () => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", client: "", description: "", deadline: "", budget: "" });

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.client.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [projects, search, statusFilter]);

  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;
    const project: Project = {
      id: `p-${uid()}`,
      name: newProject.name,
      client: newProject.client,
      status: "planning",
      progress: 0,
      deadline: newProject.deadline || "TBD",
      description: newProject.description,
      team: [TEAM[0]],
      tasks: [],
      milestones: [],
      color: COLORS[projects.length % COLORS.length],
      budget: Number(newProject.budget) || 0,
      spent: 0,
    };
    setProjects(prev => [project, ...prev]);
    setNewProject({ name: "", client: "", description: "", deadline: "", budget: "" });
    setNewProjectOpen(false);
    setSelectedProject(project.id);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProject === id) setSelectedProject(null);
  };

  const active = selectedProject ? projects.find(p => p.id === selectedProject) : null;

  if (active) {
    return <ProjectDetail project={active} onBack={() => setSelectedProject(null)} onUpdate={handleUpdateProject} />;
  }

  // Summary stats
  const totalTasks = projects.reduce((a, p) => a + p.tasks.length, 0);
  const doneTasks = projects.reduce((a, p) => a + p.tasks.filter(t => t.status === "done").length, 0);
  const activeCount = projects.filter(p => p.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-background/50 border border-border/30 rounded-xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Projects</p>
          <p className="text-2xl font-bold mt-1">{projects.length}</p>
        </div>
        <div className="bg-background/50 border border-border/30 rounded-xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold mt-1">{activeCount}</p>
        </div>
        <div className="bg-background/50 border border-border/30 rounded-xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Tasks</p>
          <p className="text-2xl font-bold mt-1">{totalTasks}</p>
        </div>
        <div className="bg-background/50 border border-border/30 rounded-xl p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed Tasks</p>
          <p className="text-2xl font-bold mt-1">{doneTasks}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm bg-background/50 border-border/40"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[130px] text-xs bg-background/50 border-border/40">
            <Filter className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="h-9 text-xs gap-1" onClick={() => setNewProjectOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> New Project
        </Button>
      </div>

      {/* Project cards */}
      <div className="grid gap-3 md:grid-cols-2">
        <AnimatePresence>
          {filteredProjects.map(project => {
            const stat = STATUS_CONFIG[project.status];
            const tasksDone = project.tasks.filter(t => t.status === "done").length;
            return (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group bg-background/50 border border-border/30 rounded-2xl p-4 hover:border-border/60 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => setSelectedProject(project.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: project.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold truncate">{project.name}</h3>
                      <Badge variant="secondary" className={`${stat.style} text-[10px] shrink-0`}>
                        {stat.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{project.client}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{project.description}</p>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">{project.progress}% complete</span>
                          <span className="text-[10px] text-muted-foreground">{tasksDone}/{project.tasks.length} tasks</span>
                        </div>
                        <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${project.progress}%`, backgroundColor: project.color }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex -space-x-1.5">
                        {project.team.slice(0, 3).map(m => (
                          <div key={m} className="w-5 h-5 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-semibold">{m.charAt(0)}</div>
                        ))}
                        {project.team.length > 3 && (
                          <div className="w-5 h-5 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px]">+{project.team.length - 3}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>Due {project.deadline}</span>
                        <span>${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive/60" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No projects match your search.</p>
        </div>
      )}

      {/* New Project Dialog */}
      <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Project name" value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} />
            <Input placeholder="Client name" value={newProject.client} onChange={e => setNewProject(p => ({ ...p, client: e.target.value }))} />
            <Textarea placeholder="Description" value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} className="min-h-[60px]" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Deadline (e.g. Apr 15)" value={newProject.deadline} onChange={e => setNewProject(p => ({ ...p, deadline: e.target.value }))} />
              <Input placeholder="Budget ($)" type="number" value={newProject.budget} onChange={e => setNewProject(p => ({ ...p, budget: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setNewProjectOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreateProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
