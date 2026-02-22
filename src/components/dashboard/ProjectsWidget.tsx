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

// ── Widget Preview ──

const previewProjects = INITIAL_PROJECTS.slice(0, 4);

export const ProjectsPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const tier = getSizeTier(pixelSize);
  const active = previewProjects.filter(p => p.status === "active").length;
  const totalTasks = previewProjects.reduce((s, p) => s + p.tasks.length, 0);
  const doneTasks = previewProjects.reduce((s, p) => s + p.tasks.filter(t => t.status === "done").length, 0);

  if (tier === "compact") {
    return (
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl font-bold tracking-tight leading-none">{active}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Active</p>
          </div>
          <FolderKanban className="w-5 h-5 text-muted-foreground/40" />
        </div>
        <div className="flex items-center gap-3 mt-auto">
          <div className="flex -space-x-1.5">
            {previewProjects.slice(0, 3).map((p, i) => (
              <div key={i} className="w-4 h-4 rounded-full border-2 border-background" style={{ backgroundColor: p.color }} />
            ))}
          </div>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-foreground/25 rounded-full" style={{ width: `${Math.round((doneTasks / totalTasks) * 100)}%` }} />
          </div>
          <span className="text-[9px] text-muted-foreground font-medium">{doneTasks}/{totalTasks}</span>
        </div>
      </div>
    );
  }

  if (tier === "standard") {
    return (
      <div className="flex flex-col h-full gap-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight leading-none">{active}</p>
            <p className="text-[10px] text-muted-foreground">Active Projects</p>
          </div>
          <FolderKanban className="w-5 h-5 text-muted-foreground/40" />
        </div>
        <div className="flex-1 space-y-1.5 mt-1 overflow-hidden">
          {previewProjects.filter(p => p.status === "active").slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-[10px] font-medium truncate flex-1">{p.name}</span>
              <span className="text-[9px] text-muted-foreground">{p.progress}%</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-foreground/25 rounded-full" style={{ width: `${Math.round((doneTasks / totalTasks) * 100)}%` }} />
          </div>
          <span className="text-[9px] text-muted-foreground font-medium">{doneTasks}/{totalTasks} tasks</span>
        </div>
      </div>
    );
  }

  // expanded
  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold tracking-tight leading-none">{active} <span className="text-sm font-normal text-muted-foreground">Active</span></p>
        </div>
        <div className="flex items-center gap-1 text-success">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="text-[10px] font-semibold">{doneTasks} done</span>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden mt-1">
        {previewProjects.map((p) => {
          const cfg = STATUS_CONFIG[p.status];
          return (
            <div key={p.id} className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium truncate">{p.name}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${cfg.style}`}>{cfg.label}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-foreground/20 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{p.progress}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-auto pt-1 border-t border-border/30">
        <span>{previewProjects.length} projects</span>
        <div className="flex -space-x-1">
          {TEAM.slice(0, 4).map((t, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-muted border border-background flex items-center justify-center text-[6px] font-bold">{t.charAt(0)}</div>
          ))}
        </div>
        <span>{totalTasks} tasks</span>
      </div>
    </div>
  );
};

// ── Task Card Component ──

const TaskCard = ({
  task,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}) => {
  const [showActions, setShowActions] = useState(false);
  const handleMouseEnter = () => setShowActions(true);
  const handleMouseLeave = () => setShowActions(false);

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

// ── Project Detail View ──

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

  const statCounts = useMemo(() => ({
    total: project.tasks.length,
    done: project.tasks.filter(t => t.status === "done").length,
    inProgress: project.tasks.filter(t => t.status === "in_progress").length,
    todo: project.tasks.filter(t => t.status === "todo").length,
    review: project.tasks.filter(t => t.status === "review").length,
  }), [project.tasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1">
            ← All Projects
          </button>
          <h2 className="text-xl font-bold">{project.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{project.client} · Due {project.deadline}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[project.status].style}`}>
            {STATUS_CONFIG[project.status].icon}
            {STATUS_CONFIG[project.status].label}
          </span>
        </div>
      </div>

      {/* Progress + Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-2 p-4 rounded-xl bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-sm font-bold">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{project.description}</p>
        </div>
        {[
          { label: "Total", value: statCounts.total, icon: <Target className="w-3.5 h-3.5" /> },
          { label: "Done", value: statCounts.done, icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> },
          { label: "In Progress", value: statCounts.inProgress, icon: <Clock className="w-3.5 h-3.5 text-primary" /> },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl bg-muted/30 flex flex-col items-center justify-center text-center">
            {s.icon}
            <p className="text-lg font-bold mt-1">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Team + Budget */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold">Team</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.team.map(name => (
              <div key={name} className="flex items-center gap-1.5 bg-secondary/50 rounded-lg px-2 py-1">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold">{name.charAt(0)}</div>
                <span className="text-xs">{name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold">Budget</span>
            <span className="text-xs text-muted-foreground">${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
          </div>
          <Progress value={(project.spent / project.budget) * 100} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
            <span>Remaining: ${(project.budget - project.spent).toLocaleString()}</span>
            <span>{Math.round((project.spent / project.budget) * 100)}% used</span>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="p-4 rounded-xl bg-muted/30">
        <h4 className="text-xs font-semibold mb-3">Milestones</h4>
        <div className="space-y-2">
          {project.milestones.map(m => (
            <div key={m.id} className="flex items-center gap-2">
              {m.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />}
              <span className={`text-sm flex-1 ${m.completed ? "line-through text-muted-foreground" : ""}`}>{m.title}</span>
              <span className="text-xs text-muted-foreground">{m.dueDate}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Task toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" className="pl-9 rounded-xl" />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[120px] rounded-xl">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <button onClick={() => setView("board")} className={`p-2 rounded-xl transition-colors ${view === "board" ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"}`}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setView("list")} className={`p-2 rounded-xl transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"}`}><List className="w-4 h-4" /></button>
        </div>
        <Button onClick={() => setNewTaskOpen(true)} size="sm" className="rounded-xl gap-1"><Plus className="w-4 h-4" />Add Task</Button>
      </div>

      {/* Board / List */}
      {view === "board" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {(["todo", "in_progress", "review", "done"] as TaskStatus[]).map(status => (
            <KanbanColumn key={status} status={status} tasks={tasksByStatus[status]} onStatusChange={handleStatusChange} onDeleteTask={handleDeleteTask} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} />
          ))}
        </div>
      )}

      {/* New Task Dialog */}
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} placeholder="Task title" className="rounded-xl" />
            <Textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)" className="rounded-xl" rows={2} />
            <div className="grid grid-cols-3 gap-2">
              <Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v as Priority }))}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newTask.assignee} onValueChange={v => setNewTask(p => ({ ...p, assignee: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{project.team.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}</SelectContent>
              </Select>
              <Input value={newTask.tags} onChange={e => setNewTask(p => ({ ...p, tags: e.target.value }))} placeholder="Tags (comma)" className="rounded-xl" />
            </div>
          </div>
          <DialogFooter><Button onClick={handleAddTask} className="rounded-xl">Create Task</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Main Expanded View ──

export const ProjectsExpanded = () => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return projects;
    return projects.filter(p => p.status === statusFilter);
  }, [projects, statusFilter]);

  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedProject(updated);
  };

  if (selectedProject) {
    return <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} onUpdate={handleUpdateProject} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "active", "planning", "on_hold", "completed"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors capitalize ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
            {s === "all" ? `All (${projects.length})` : `${s.replace("_", " ")} (${projects.filter(p => p.status === s).length})`}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(project => {
          const cfg = STATUS_CONFIG[project.status];
          const doneTasks = project.tasks.filter(t => t.status === "done").length;
          return (
            <button key={project.id} onClick={() => setSelectedProject(project)} className="text-left p-5 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-all group border border-border/20 hover:border-border/40">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                  <div>
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.client}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.style}`}>
                  {cfg.icon}{cfg.label}
                </span>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span><span className="font-semibold text-foreground">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="text-[10px]">{doneTasks}/{project.tasks.length} tasks</span>
                  <span className="text-[10px]">Due {project.deadline}</span>
                </div>
                <div className="flex -space-x-1.5">
                  {project.team.slice(0, 3).map((name, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-semibold">{name.charAt(0)}</div>
                  ))}
                  {project.team.length > 3 && <div className="w-5 h-5 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-semibold">+{project.team.length - 3}</div>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
