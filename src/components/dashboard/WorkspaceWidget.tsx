import { useState } from "react";
import {
  Users, Briefcase, FolderKanban, ListTodo, FileText, Clock,
  AlertTriangle, MessageSquare, CheckCircle2, Upload, Eye,
  HardDrive, Shield, LayoutTemplate, Settings, ChevronRight,
  Circle, ArrowUpRight, CalendarDays, UserPlus, Bell,
  TrendingUp, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getSizeTier } from "./WidgetCard";

// ── Mock data ──────────────────────────────────────────────

const activeProjects = [
  { id: "1", name: "Flux Labs Rebrand", client: "Flux Labs", progress: 72, status: "active", deadline: "Mar 5" },
  { id: "2", name: "Mono Website Redesign", client: "Mono Studio", progress: 45, status: "active", deadline: "Mar 12" },
  { id: "3", name: "Nextwave App", client: "Nextwave", progress: 88, status: "review", deadline: "Feb 28" },
  { id: "4", name: "Aura Brand System", client: "Aura Inc", progress: 30, status: "active", deadline: "Mar 20" },
];

const awaitingFeedback = [
  { id: "1", project: "Flux Labs Rebrand", deliverable: "Logo Concepts v3", sentAt: "2 days ago", client: "Jamie Flux" },
  { id: "2", project: "Mono Website", deliverable: "Homepage Mockup", sentAt: "5 days ago", client: "Alex Mono" },
];

const overdueItems = [
  { id: "1", task: "Final icon set delivery", project: "Nextwave App", dueDate: "Feb 24", daysOverdue: 2 },
  { id: "2", task: "Brand guidelines PDF", project: "Aura Brand System", dueDate: "Feb 22", daysOverdue: 4 },
];

const upcomingDeadlines = [
  { id: "1", task: "Motion prototype review", project: "Flux Labs", date: "Feb 28", priority: "high" },
  { id: "2", task: "Client presentation", project: "Mono Website", date: "Mar 1", priority: "high" },
  { id: "3", task: "Asset handoff", project: "Nextwave App", date: "Mar 3", priority: "medium" },
];

const recentUploads = [
  { id: "1", name: "hero-final-v2.fig", project: "Mono Website", time: "2h ago", size: "14.2 MB" },
  { id: "2", name: "logo-concepts.pdf", project: "Flux Labs", time: "5h ago", size: "3.8 MB" },
  { id: "3", name: "icons-set.svg", project: "Nextwave App", time: "1d ago", size: "1.2 MB" },
];

const unreadComments = [
  { id: "1", author: "Jamie Flux", message: "Love the direction on option B, can we explore more?", project: "Flux Labs", time: "1h ago" },
  { id: "2", author: "Alex Mono", message: "The nav feels off on mobile — can we revisit?", project: "Mono Website", time: "3h ago" },
  { id: "3", author: "Sam Next", message: "Approved! Let's move to development.", project: "Nextwave App", time: "6h ago" },
];

const pendingApprovals = [
  { id: "1", item: "Homepage Design v2", project: "Mono Website", requestedBy: "Alex Mono", status: "pending" },
  { id: "2", item: "Logo Final Selection", project: "Flux Labs", requestedBy: "Jamie Flux", status: "pending" },
];

const teamMembers = [
  { id: "1", name: "John Doe", role: "Lead Designer", avatar: "JD", load: 85, projects: 3, status: "active" },
  { id: "2", name: "Ava Chen", role: "UI Designer", avatar: "AC", load: 60, projects: 2, status: "active" },
  { id: "3", name: "Marcus Bell", role: "Motion Designer", avatar: "MB", load: 90, projects: 2, status: "busy" },
  { id: "4", name: "Lina Park", role: "Brand Strategist", avatar: "LP", load: 40, projects: 1, status: "active" },
  { id: "5", name: "Sara Kim", role: "Copywriter", avatar: "SK", load: 70, projects: 2, status: "active" },
];

const clients = [
  { id: "1", name: "Flux Labs", contact: "Jamie Flux", email: "jamie@flux.co", projects: 1, status: "active", lastActivity: "1h ago" },
  { id: "2", name: "Mono Studio", contact: "Alex Mono", email: "alex@mono.io", projects: 1, status: "active", lastActivity: "3h ago" },
  { id: "3", name: "Nextwave", contact: "Sam Next", email: "sam@nextwave.com", projects: 1, status: "active", lastActivity: "6h ago" },
  { id: "4", name: "Aura Inc", contact: "Dana Aura", email: "dana@aura.co", projects: 1, status: "onboarding", lastActivity: "2d ago" },
];

const tasks = [
  { id: "1", title: "Finalize color palette", project: "Flux Labs", assignee: "JD", priority: "high", status: "in-progress" },
  { id: "2", title: "Design system documentation", project: "Mono Website", assignee: "AC", priority: "medium", status: "todo" },
  { id: "3", title: "Animate hero section", project: "Flux Labs", assignee: "MB", priority: "high", status: "in-progress" },
  { id: "4", title: "Write case study copy", project: "Nextwave App", assignee: "SK", priority: "low", status: "done" },
  { id: "5", title: "Prepare brand deck", project: "Aura Brand", assignee: "LP", priority: "medium", status: "todo" },
];

const deliverables = [
  { id: "1", name: "Brand Guidelines PDF", project: "Flux Labs", status: "in-review", dueDate: "Mar 5" },
  { id: "2", name: "Website Prototype", project: "Mono Website", status: "in-progress", dueDate: "Mar 10" },
  { id: "3", name: "App UI Kit", project: "Nextwave App", status: "approved", dueDate: "Feb 28" },
  { id: "4", name: "Logo Package", project: "Aura Brand", status: "draft", dueDate: "Mar 15" },
];

const templates = [
  { id: "1", name: "Brand Identity Project", category: "Branding", uses: 12 },
  { id: "2", name: "Website Redesign", category: "Web", uses: 8 },
  { id: "3", name: "Mobile App Design", category: "Product", uses: 5 },
  { id: "4", name: "Social Media Kit", category: "Marketing", uses: 15 },
];

const storageUsage = { used: 24.7, total: 50, unit: "GB" };

// ── Status helpers ──────────────────────────────────────────

const priorityDot: Record<string, string> = {
  high: "bg-destructive",
  medium: "bg-chart-2",
  low: "bg-muted-foreground/30",
};

const statusBadge: Record<string, string> = {
  active: "bg-chart-1/15 text-chart-1",
  review: "bg-chart-2/15 text-chart-2",
  "in-progress": "bg-chart-1/15 text-chart-1",
  "in-review": "bg-chart-2/15 text-chart-2",
  approved: "bg-success/15 text-success",
  todo: "bg-muted/60 text-muted-foreground",
  done: "bg-success/15 text-success",
  draft: "bg-muted/60 text-muted-foreground",
  pending: "bg-chart-2/15 text-chart-2",
  onboarding: "bg-chart-4/15 text-chart-4",
  busy: "bg-destructive/15 text-destructive",
};

// ── Preview (dashboard card) ────────────────────────────────

export const WorkspacePreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const tier = getSizeTier(pixelSize);
  const overdueCount = overdueItems.length;
  const feedbackCount = awaitingFeedback.length;
  const commentCount = unreadComments.length;
  const approvalCount = pendingApprovals.length;

  if (tier === "compact") return null;

  if (tier === "standard") {
    return (
      <div className="flex flex-col h-full gap-1.5 mt-1">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight leading-none">{activeProjects.length}</p>
            <p className="text-[10px] text-muted-foreground">active projects</p>
          </div>
        </div>
        <div className="flex-1 space-y-1 overflow-hidden">
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-destructive shrink-0" />
              <span className="text-[10px] font-medium text-destructive">{overdueCount} overdue</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-muted-foreground/60 shrink-0" />
            <span className="text-[10px] text-muted-foreground">{feedbackCount} awaiting feedback</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3 h-3 text-muted-foreground/60 shrink-0" />
            <span className="text-[10px] text-muted-foreground">{commentCount} unread</span>
          </div>
        </div>
        <span className="text-[9px] text-muted-foreground mt-auto">{approvalCount} pending approvals</span>
      </div>
    );
  }

  // Expanded tier
  return (
    <div className="flex flex-col h-full gap-2 mt-1">
      <div className="flex items-start justify-between">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight leading-none">{activeProjects.length}</p>
          <p className="text-xs text-muted-foreground">active projects</p>
        </div>
        {overdueCount > 0 && (
          <span className="text-[10px] text-destructive font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {overdueCount} overdue
          </span>
        )}
      </div>
      <div className="flex-1 space-y-1.5 overflow-hidden">
        {activeProjects.slice(0, 4).map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
            <span className="text-[10px] font-medium truncate flex-1">{p.name}</span>
            <span className="text-[9px] text-muted-foreground">{p.progress}%</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-auto pt-1 border-t border-foreground/8">
        <span>{commentCount} comments · {feedbackCount} feedback</span>
        <span>{teamMembers.length} team</span>
      </div>
    </div>
  );
};

// ── Section component for expanded view ─────────────────────

const Section = ({ title, icon: Icon, count, children }: { title: string; icon: React.ElementType; count?: number; children: React.ReactNode }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {count !== undefined && (
        <span className="text-[10px] font-semibold bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-md">{count}</span>
      )}
    </div>
    {children}
  </div>
);

// ── Expanded view (full page) ───────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "clients", label: "Clients", icon: Users },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "deliverables", label: "Deliverables", icon: FileText },
  { id: "files", label: "Files", icon: HardDrive },
  { id: "team", label: "Team", icon: Users },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "settings", label: "Settings", icon: Settings },
];

export const WorkspaceExpanded = () => {
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Overview tab — Command Center */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Active Projects", value: activeProjects.length, icon: FolderKanban, color: "text-chart-1" },
              { label: "Overdue Items", value: overdueItems.length, icon: AlertTriangle, color: "text-destructive" },
              { label: "Pending Approvals", value: pendingApprovals.length, icon: CheckCircle2, color: "text-chart-2" },
              { label: "Unread Comments", value: unreadComments.length, icon: MessageSquare, color: "text-chart-4" },
            ].map((kpi) => (
              <div key={kpi.label} className="p-4 rounded-2xl bg-card border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{kpi.label}</span>
                </div>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Active projects */}
          <Section title="Active Projects" icon={FolderKanban} count={activeProjects.length}>
            <div className="space-y-2">
              {activeProjects.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-secondary/15 border border-border/20">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-semibold">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">{p.client}</span>
                    </div>
                    <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium capitalize", statusBadge[p.status])}>{p.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={p.progress} className="flex-1 h-1.5" />
                    <span className="text-[10px] font-medium text-muted-foreground w-8 text-right">{p.progress}%</span>
                    <span className="text-[10px] text-muted-foreground">Due {p.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Two-column layout for alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Awaiting Feedback */}
            <Section title="Awaiting Client Feedback" icon={Clock} count={awaitingFeedback.length}>
              <div className="space-y-2">
                {awaitingFeedback.map((f) => (
                  <div key={f.id} className="p-3 rounded-xl bg-secondary/15 border border-border/20">
                    <p className="text-sm font-medium">{f.deliverable}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">{f.project} · {f.client}</span>
                      <span className="text-[10px] text-muted-foreground">{f.sentAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Overdue */}
            <Section title="Overdue Deliverables" icon={AlertTriangle} count={overdueItems.length}>
              <div className="space-y-2">
                {overdueItems.map((o) => (
                  <div key={o.id} className="p-3 rounded-xl bg-destructive/5 border border-destructive/15">
                    <p className="text-sm font-medium">{o.task}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">{o.project}</span>
                      <span className="text-[10px] text-destructive font-semibold">{o.daysOverdue}d overdue</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Deadlines */}
            <Section title="Upcoming Deadlines" icon={CalendarDays} count={upcomingDeadlines.length}>
              <div className="space-y-2">
                {upcomingDeadlines.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/15 border border-border/20">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", priorityDot[d.priority])} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{d.task}</p>
                      <p className="text-[10px] text-muted-foreground">{d.project}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground shrink-0">{d.date}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Pending Approvals */}
            <Section title="Pending Approvals" icon={CheckCircle2} count={pendingApprovals.length}>
              <div className="space-y-2">
                {pendingApprovals.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/15 border border-border/20">
                    <Shield className="w-4 h-4 text-chart-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.item}</p>
                      <p className="text-[10px] text-muted-foreground">{a.project} · {a.requestedBy}</p>
                    </div>
                    <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium capitalize", statusBadge[a.status])}>{a.status}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unread Comments */}
            <Section title="Unread Comments" icon={MessageSquare} count={unreadComments.length}>
              <div className="space-y-2">
                {unreadComments.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-secondary/15 border border-border/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">{c.author}</span>
                      <span className="text-[10px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{c.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{c.project}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Recent Uploads */}
            <Section title="Recent Uploads" icon={Upload} count={recentUploads.length}>
              <div className="space-y-2">
                {recentUploads.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/15 border border-border/20">
                    <FileText className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground">{u.project} · {u.size}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{u.time}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Workload */}
            <Section title="Team Workload" icon={Users} count={teamMembers.length}>
              <div className="space-y-2">
                {teamMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/15 border border-border/20">
                    <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-[10px] font-bold shrink-0">{m.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Progress value={m.load} className="flex-1 h-1" />
                        <span className="text-[10px] text-muted-foreground w-7 text-right">{m.load}%</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{m.projects} proj</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Storage Usage */}
            <Section title="Storage Usage" icon={HardDrive}>
              <div className="p-4 rounded-xl bg-secondary/15 border border-border/20">
                <div className="flex items-baseline justify-between mb-3">
                  <p className="text-2xl font-bold">{storageUsage.used} <span className="text-sm font-normal text-muted-foreground">{storageUsage.unit}</span></p>
                  <span className="text-[10px] text-muted-foreground">of {storageUsage.total} {storageUsage.unit}</span>
                </div>
                <Progress value={(storageUsage.used / storageUsage.total) * 100} className="h-2" />
                <p className="text-[10px] text-muted-foreground mt-2">{((storageUsage.used / storageUsage.total) * 100).toFixed(0)}% used</p>
              </div>
            </Section>
          </div>

          {/* Recent Client Activity */}
          <Section title="Recent Client Activity" icon={Eye}>
            <div className="space-y-2">
              {clients.slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/15 border border-border/20">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">{c.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.contact}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{c.lastActivity}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* Clients tab */}
      {tab === "clients" && (
        <div className="space-y-3">
          {clients.map((c) => (
            <div key={c.id} className="p-4 rounded-xl bg-secondary/15 border border-border/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{c.name.charAt(0)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{c.name}</span>
                    <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium capitalize", statusBadge[c.status])}>{c.status}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{c.contact} · {c.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">{c.projects} project{c.projects > 1 ? "s" : ""}</p>
                  <p className="text-[10px] text-muted-foreground">{c.lastActivity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects tab */}
      {tab === "projects" && (
        <div className="space-y-3">
          {activeProjects.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-secondary/15 border border-border/20">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-semibold">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">{p.client}</span>
                </div>
                <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium capitalize", statusBadge[p.status])}>{p.status}</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={p.progress} className="flex-1 h-1.5" />
                <span className="text-[10px] font-medium w-8 text-right">{p.progress}%</span>
                <span className="text-[10px] text-muted-foreground">Due {p.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tasks tab */}
      {tab === "tasks" && (
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/15 border border-border/20">
              <div className={cn("w-2 h-2 rounded-full shrink-0", priorityDot[t.priority])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.title}</p>
                <p className="text-[10px] text-muted-foreground">{t.project}</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center text-[8px] font-bold shrink-0">{t.assignee}</div>
              <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium capitalize", statusBadge[t.status])}>{t.status.replace("-", " ")}</span>
            </div>
          ))}
        </div>
      )}

      {/* Deliverables tab */}
      {tab === "deliverables" && (
        <div className="space-y-3">
          {deliverables.map((d) => (
            <div key={d.id} className="p-4 rounded-xl bg-secondary/15 border border-border/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">{d.project} · Due {d.dueDate}</p>
                </div>
                <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium capitalize", statusBadge[d.status])}>{d.status.replace("-", " ")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Files tab */}
      {tab === "files" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-secondary/15 border border-border/20">
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-lg font-bold">{storageUsage.used} <span className="text-sm font-normal text-muted-foreground">{storageUsage.unit}</span></p>
              <span className="text-xs text-muted-foreground">of {storageUsage.total} {storageUsage.unit}</span>
            </div>
            <Progress value={(storageUsage.used / storageUsage.total) * 100} className="h-2" />
          </div>
          <div className="space-y-2">
            {recentUploads.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/15 border border-border/20">
                <FileText className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name}</p>
                  <p className="text-[10px] text-muted-foreground">{u.project} · {u.size}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{u.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team tab */}
      {tab === "team" && (
        <div className="space-y-3">
          {teamMembers.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-secondary/15 border border-border/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-xs font-bold">{m.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{m.name}</span>
                    <span className={cn("text-[9px] px-2 py-0.5 rounded-full font-medium capitalize", statusBadge[m.status])}>{m.status}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{m.role} · {m.projects} projects</p>
                </div>
                <div className="w-20">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[10px] font-medium">{m.load}%</span>
                    <span className="text-[9px] text-muted-foreground">load</span>
                  </div>
                  <Progress value={m.load} className="h-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates tab */}
      {tab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((t) => (
            <div key={t.id} className="p-4 rounded-xl bg-secondary/15 border border-border/20">
              <div className="flex items-center gap-3">
                <LayoutTemplate className="w-5 h-5 text-muted-foreground/50" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.category} · Used {t.uses} times</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings tab */}
      {tab === "settings" && (
        <div className="space-y-3">
          {[
            { label: "Workspace Name", value: "Desboard Studio", icon: Briefcase },
            { label: "Brand Settings", value: "Colors, fonts, logos", icon: Eye },
            { label: "Permission Rules", value: "3 roles configured", icon: Shield },
            { label: "Automation Rules", value: "5 active automations", icon: TrendingUp },
            { label: "Internal Documents", value: "12 documents", icon: FileText },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/15 border border-border/20 cursor-pointer hover:bg-secondary/25 transition-colors">
              <s.icon className="w-5 h-5 text-muted-foreground/50" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="text-[10px] text-muted-foreground">{s.value}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
