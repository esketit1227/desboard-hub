import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MessageSquare, Send, Upload, FileText, CheckCircle2,
  Clock, Eye, PenLine, ThumbsUp, Paperclip, X, ArrowLeft,
  LayoutDashboard, ListChecks, Activity, Receipt, History,
  ChevronRight, Download, Calendar, DollarSign,
  Users, Zap, Search, Filter, Plus, Trash2, ExternalLink, Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getSizeTier } from "./WidgetCard";

/* ─── Types ─── */
interface Message { from: string; text: string; time: string }
interface FileItem { name: string; size: string; type?: string; date?: string }
interface Milestone { label: string; status: "done" | "active" | "upcoming"; date?: string }
interface Deliverable { id: string; label: string; completed: boolean; dueDate?: string }
interface ActivityItem { id: string; type: "message" | "file" | "status" | "rating" | "revision" | "payment"; description: string; time: string; actor: string }
interface VersionItem { id: string; version: string; date: string; notes: string; filesCount: number }
interface InvoiceItem { id: string; label: string; amount: number; status: "paid" | "pending" | "overdue"; dueDate: string }

interface ClientProject {
  id: string;
  client: string;
  project: string;
  description: string;
  status: "approved" | "pending" | "changes";
  rating: number | null;
  messages: Message[];
  files: FileItem[];
  milestones: Milestone[];
  revisionRound: number;
  deliverables: Deliverable[];
  activity: ActivityItem[];
  versions: VersionItem[];
  invoices: InvoiceItem[];
  startDate: string;
  dueDate: string;
  budget: number;
  spent: number;
  hoursTracked: number;
  hoursBudgeted: number;
}

export interface Handoff {
  id: string; client: string; project: string;
  status: "approved" | "pending" | "changes"; rating: number | null;
  messages: { from: string; text: string; time: string }[];
  files: { name: string; size: string }[];
}

/* ─── Mock Data ─── */
const CLIENTS: ClientProject[] = [
  {
    id: "flux-brand", client: "Flux Labs", project: "Brand Identity",
    description: "Complete brand identity system including logo, color palette, typography, and brand guidelines.",
    status: "approved", rating: 5, revisionRound: 2,
    startDate: "Jan 5", dueDate: "Feb 10", budget: 8500, spent: 8200, hoursTracked: 62, hoursBudgeted: 65,
    milestones: [
      { label: "Brief Received", status: "done", date: "Jan 12" },
      { label: "Concept Delivered", status: "done", date: "Jan 20" },
      { label: "Revisions", status: "done", date: "Feb 1" },
      { label: "Final Delivery", status: "done", date: "Feb 8" },
      { label: "Sign-off", status: "done", date: "Feb 10" },
    ],
    deliverables: [
      { id: "d1", label: "Logo Design (Primary + Secondary)", completed: true, dueDate: "Jan 20" },
      { id: "d2", label: "Color Palette & Typography", completed: true, dueDate: "Jan 25" },
      { id: "d3", label: "Brand Guidelines PDF", completed: true, dueDate: "Feb 5" },
      { id: "d4", label: "Social Media Templates", completed: true, dueDate: "Feb 8" },
      { id: "d5", label: "Business Card Design", completed: true, dueDate: "Feb 8" },
    ],
    messages: [
      { from: "You", text: "Final brand assets are ready for review.", time: "Feb 8" },
      { from: "Flux Labs", text: "Everything looks perfect, approved!", time: "Feb 9" },
      { from: "You", text: "Great — hand-off confirmed. Thanks!", time: "Feb 10" },
    ],
    files: [
      { name: "flux-brand-guide.pdf", size: "4.2 MB", type: "pdf", date: "Feb 8" },
      { name: "logo-variations.zip", size: "12 MB", type: "zip", date: "Feb 8" },
      { name: "color-palette.png", size: "340 KB", type: "image", date: "Feb 5" },
      { name: "social-templates.fig", size: "8.5 MB", type: "figma", date: "Feb 8" },
    ],
    activity: [
      { id: "a1", type: "status", description: "Project signed off and approved", time: "Feb 10", actor: "Flux Labs" },
      { id: "a2", type: "rating", description: "Rated 5 stars", time: "Feb 10", actor: "Flux Labs" },
      { id: "a3", type: "file", description: "Uploaded final brand assets", time: "Feb 8", actor: "You" },
      { id: "a4", type: "revision", description: "Completed revision round 2", time: "Feb 1", actor: "You" },
      { id: "a5", type: "payment", description: "Invoice paid ($4,250)", time: "Jan 18", actor: "Flux Labs" },
    ],
    versions: [
      { id: "v1", version: "V1.0", date: "Jan 20", notes: "Initial concept delivery", filesCount: 3 },
      { id: "v2", version: "V1.1", date: "Jan 28", notes: "Refined logo + adjusted palette", filesCount: 4 },
      { id: "v3", version: "V2.0", date: "Feb 8", notes: "Final delivery with all assets", filesCount: 5 },
    ],
    invoices: [
      { id: "i1", label: "Deposit — 50%", amount: 4250, status: "paid", dueDate: "Jan 15" },
      { id: "i2", label: "Final Payment — 50%", amount: 4250, status: "paid", dueDate: "Feb 15" },
    ],
  },
  {
    id: "mono-website", client: "Mono Studio", project: "Website V2",
    description: "Full website redesign with new information architecture, responsive layouts, and interactive prototypes.",
    status: "pending", rating: null, revisionRound: 1,
    startDate: "Feb 1", dueDate: "Mar 1", budget: 12000, spent: 7800, hoursTracked: 48, hoursBudgeted: 80,
    milestones: [
      { label: "Brief Received", status: "done", date: "Feb 1" },
      { label: "Wireframes", status: "done", date: "Feb 10" },
      { label: "Visual Design", status: "done", date: "Feb 18" },
      { label: "Client Review", status: "active" },
      { label: "Sign-off", status: "upcoming" },
    ],
    deliverables: [
      { id: "d1", label: "Information Architecture", completed: true, dueDate: "Feb 8" },
      { id: "d2", label: "Wireframes (Desktop + Mobile)", completed: true, dueDate: "Feb 10" },
      { id: "d3", label: "Visual Design System", completed: true, dueDate: "Feb 15" },
      { id: "d4", label: "Responsive Page Designs", completed: true, dueDate: "Feb 18" },
      { id: "d5", label: "Interactive Prototype", completed: false, dueDate: "Feb 25" },
      { id: "d6", label: "Developer Handoff Specs", completed: false, dueDate: "Feb 28" },
    ],
    messages: [
      { from: "You", text: "Here's the website redesign for your review.", time: "Feb 18" },
      { from: "You", text: "Let me know if any sections need adjustments.", time: "Feb 19" },
    ],
    files: [
      { name: "website-v2-mockups.fig", size: "18 MB", type: "figma", date: "Feb 18" },
      { name: "wireframes.pdf", size: "3.4 MB", type: "pdf", date: "Feb 10" },
    ],
    activity: [
      { id: "a1", type: "file", description: "Uploaded website mockups", time: "Feb 18", actor: "You" },
      { id: "a2", type: "message", description: "Sent designs for review", time: "Feb 18", actor: "You" },
      { id: "a3", type: "payment", description: "Invoice paid ($6,000)", time: "Feb 5", actor: "Mono Studio" },
    ],
    versions: [
      { id: "v1", version: "V1.0", date: "Feb 10", notes: "Wireframe delivery", filesCount: 1 },
      { id: "v2", version: "V2.0", date: "Feb 18", notes: "Full visual design delivery", filesCount: 2 },
    ],
    invoices: [
      { id: "i1", label: "Deposit — 50%", amount: 6000, status: "paid", dueDate: "Feb 5" },
      { id: "i2", label: "Final Payment — 50%", amount: 6000, status: "pending", dueDate: "Mar 5" },
    ],
  },
  {
    id: "nextwave-app", client: "Nextwave", project: "App Screens",
    description: "Mobile app screen designs for iOS and Android, covering onboarding, dashboard, settings, and profile flows.",
    status: "changes", rating: 3, revisionRound: 3,
    startDate: "Jan 5", dueDate: "Feb 28", budget: 9500, spent: 8100, hoursTracked: 71, hoursBudgeted: 75,
    milestones: [
      { label: "Brief Received", status: "done", date: "Jan 5" },
      { label: "V1 Delivered", status: "done", date: "Jan 18" },
      { label: "Revisions (R2)", status: "done", date: "Feb 2" },
      { label: "Revisions (R3)", status: "active" },
      { label: "Sign-off", status: "upcoming" },
    ],
    deliverables: [
      { id: "d1", label: "Onboarding Flow (5 screens)", completed: true, dueDate: "Jan 15" },
      { id: "d2", label: "Dashboard Screen", completed: true, dueDate: "Jan 18" },
      { id: "d3", label: "Settings & Profile", completed: false, dueDate: "Feb 20" },
      { id: "d4", label: "Navigation & Icons", completed: false, dueDate: "Feb 22" },
      { id: "d5", label: "Dark Mode Variants", completed: false, dueDate: "Feb 25" },
    ],
    messages: [
      { from: "You", text: "App screens V3 uploaded.", time: "Feb 15" },
      { from: "Nextwave", text: "The onboarding flow needs more polish.", time: "Feb 16" },
      { from: "You", text: "On it — will revise by tomorrow.", time: "Feb 16" },
      { from: "Nextwave", text: "Also the color scheme for settings page.", time: "Feb 17" },
      { from: "You", text: "Noted, updating both sections.", time: "Feb 17" },
    ],
    files: [
      { name: "app-screens-v3.png", size: "2.8 MB", type: "image", date: "Feb 15" },
      { name: "onboarding-flow.pdf", size: "1.5 MB", type: "pdf", date: "Feb 15" },
      { name: "dashboard-v2.fig", size: "6.2 MB", type: "figma", date: "Feb 2" },
    ],
    activity: [
      { id: "a1", type: "message", description: "Requested nav icon revisions", time: "Feb 18", actor: "Nextwave" },
      { id: "a2", type: "revision", description: "Started revision round 3", time: "Feb 15", actor: "You" },
      { id: "a3", type: "file", description: "Uploaded V3 screens", time: "Feb 15", actor: "You" },
      { id: "a4", type: "payment", description: "Invoice paid ($4,750)", time: "Jan 10", actor: "Nextwave" },
    ],
    versions: [
      { id: "v1", version: "V1.0", date: "Jan 18", notes: "Initial screen delivery", filesCount: 2 },
      { id: "v2", version: "V2.0", date: "Feb 2", notes: "Revised onboarding + dashboard", filesCount: 3 },
      { id: "v3", version: "V3.0", date: "Feb 15", notes: "Further revisions in progress", filesCount: 3 },
    ],
    invoices: [
      { id: "i1", label: "Deposit — 50%", amount: 4750, status: "paid", dueDate: "Jan 10" },
      { id: "i2", label: "Final Payment — 50%", amount: 4750, status: "overdue", dueDate: "Feb 20" },
    ],
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-foreground/10 text-foreground/70" },
  pending: { label: "Pending", className: "bg-foreground/5 text-muted-foreground" },
  changes: { label: "Changes", className: "bg-foreground/10 text-foreground" },
};

const invoiceStatusConfig: Record<string, string> = {
  paid: "bg-foreground/10 text-foreground/70",
  pending: "bg-foreground/5 text-muted-foreground",
  overdue: "bg-destructive/15 text-destructive",
};

const activityIcons: Record<string, React.ReactNode> = {
  message: <MessageSquare className="w-3.5 h-3.5" />,
  file: <FileText className="w-3.5 h-3.5" />,
  status: <Zap className="w-3.5 h-3.5" />,
  rating: <Star className="w-3.5 h-3.5" />,
  revision: <History className="w-3.5 h-3.5" />,
  payment: <DollarSign className="w-3.5 h-3.5" />,
};

type TabId = "overview" | "deliverables" | "messages" | "files" | "activity" | "versions" | "invoices";

/* ─── Preview ─── */
export const ClientsPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const tier = getSizeTier(pixelSize);
  const pending = CLIENTS.filter(h => h.status === "pending").length;
  const approved = CLIENTS.filter(h => h.status === "approved").length;

  if (tier === "compact") return null;

  if (tier === "standard") {
    return (
      <div className="flex flex-col h-full gap-1.5 mt-1">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" style={{ color: "#8b5cf6" }} />
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight leading-none">{CLIENTS.length}</p>
            <p className="text-[10px] text-muted-foreground">clients</p>
          </div>
        </div>
        <div className="flex-1 space-y-1 overflow-hidden">
          {CLIENTS.slice(0, 3).map((h) => (
            <div key={h.id} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#8b5cf680" }} />
              <span className="text-[10px] font-medium truncate">{h.client}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-auto">
          <span>{approved} done</span>
          <span>·</span>
          <span>{pending} pending</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-2 mt-1">
      <div className="flex items-start justify-between">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight leading-none">{CLIENTS.length}</p>
          <p className="text-xs text-muted-foreground">clients</p>
        </div>
      </div>
      <div className="flex-1 space-y-1.5 overflow-hidden">
        {CLIENTS.map((h) => {
          const cfg = statusConfig[h.status];
          return (
            <div key={h.id} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/25 shrink-0" />
              <span className="text-[10px] font-medium truncate flex-1">{h.client} — {h.project}</span>
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${cfg.className}`}>{cfg.label}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-auto pt-1 border-t border-foreground/8">
        <span>{approved} approved</span>
        <span>{pending} pending</span>
      </div>
    </div>
  );
};

/* ─── Progress Timeline ─── */
const ProgressTimeline = ({ milestones }: { milestones: Milestone[] }) => (
  <div className="flex items-start justify-between gap-1">
    {milestones.map((m, i) => {
      const isLast = i === milestones.length - 1;
      return (
        <div key={i} className="flex-1 flex flex-col items-center text-center relative">
          {!isLast && (
            <div className={cn(
              "absolute top-3 left-[calc(50%+10px)] right-[calc(-50%+10px)] h-0.5",
              m.status === "done" ? "bg-foreground/30" : "bg-border"
            )} />
          )}
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center relative z-10 border-2 shrink-0",
            m.status === "done" && "bg-foreground border-foreground",
            m.status === "active" && "bg-background border-foreground/50 animate-pulse",
            m.status === "upcoming" && "bg-muted border-border"
          )}>
            {m.status === "done" && <CheckCircle2 className="w-3.5 h-3.5 text-background" />}
            {m.status === "active" && <div className="w-2 h-2 rounded-full bg-foreground" />}
          </div>
          <p className={cn("text-[10px] mt-1.5 leading-tight font-medium max-w-[70px]",
            m.status === "done" && "text-foreground",
            m.status === "active" && "text-foreground/70",
            m.status === "upcoming" && "text-muted-foreground"
          )}>{m.label}</p>
          {m.date && <p className="text-[9px] text-muted-foreground mt-0.5">{m.date}</p>}
        </div>
      );
    })}
  </div>
);

/* ─── Expanded (full page) ─── */
export const ClientsExpanded = () => {
  const [clients, setClients] = useState<ClientProject[]>(CLIENTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [message, setMessage] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending" | "changes">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => clients.find(c => c.id === selectedId) || null, [clients, selectedId]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (searchQuery && !c.client.toLowerCase().includes(searchQuery.toLowerCase()) && !c.project.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [clients, filterStatus, searchQuery]);

  useEffect(() => {
    if (activeTab === "messages") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selected?.messages.length, activeTab]);

  const updateClient = (id: string, updater: (c: ClientProject) => ClientProject) => {
    setClients(prev => prev.map(c => c.id === id ? updater(c) : c));
  };

  const handleSend = () => {
    if (!message.trim() || !selectedId) return;
    updateClient(selectedId, c => ({
      ...c,
      messages: [...c.messages, { from: "You", text: message.trim(), time: "Just now" }],
      activity: [{ id: `a-${Date.now()}`, type: "message" as const, description: "Sent a message", time: "Just now", actor: "You" }, ...c.activity],
    }));
    setMessage("");
    toast.success("Message sent");
  };

  const handleRate = (rating: number) => {
    if (!selectedId) return;
    updateClient(selectedId, c => ({ ...c, rating }));
    toast.success(`Rated ${rating} star${rating > 1 ? "s" : ""}`);
  };

  const handleApprove = () => {
    if (!selectedId) return;
    updateClient(selectedId, c => ({
      ...c,
      status: "approved",
      milestones: c.milestones.map(m => m.status === "active" || m.status === "upcoming" ? { ...m, status: "done" as const, date: "Today" } : m),
      activity: [{ id: `a-${Date.now()}`, type: "status" as const, description: "Project approved", time: "Just now", actor: "You" }, ...c.activity],
    }));
    toast.success("Project approved! 🎉");
  };

  const handleRequestChanges = () => {
    if (!selectedId) return;
    updateClient(selectedId, c => ({
      ...c,
      status: "changes",
      revisionRound: c.revisionRound + 1,
      activity: [{ id: `a-${Date.now()}`, type: "revision" as const, description: "Requested changes", time: "Just now", actor: "You" }, ...c.activity],
    }));
    toast("Changes requested");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedId) return;
    const newFiles = Array.from(e.target.files).map(f => ({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      date: "Just now",
    }));
    updateClient(selectedId, c => ({
      ...c,
      files: [...c.files, ...newFiles],
      activity: [{ id: `a-${Date.now()}`, type: "file" as const, description: `Uploaded ${newFiles.length} file(s)`, time: "Just now", actor: "You" }, ...c.activity],
    }));
    toast.success(`${newFiles.length} file(s) uploaded`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleDeliverable = (delivId: string) => {
    if (!selectedId) return;
    updateClient(selectedId, c => ({
      ...c,
      deliverables: c.deliverables.map(d => d.id === delivId ? { ...d, completed: !d.completed } : d),
    }));
  };

  // ── Client list view ──
  if (!selected) {
    const totalRevenue = clients.reduce((s, c) => s + c.invoices.filter(i => i.status === "paid").reduce((ss, i) => ss + i.amount, 0), 0);
    const totalPending = clients.reduce((s, c) => s + c.invoices.filter(i => i.status !== "paid").reduce((ss, i) => ss + i.amount, 0), 0);

    return (
      <div className="space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Clients", value: clients.length.toString() },
            { label: "Active", value: clients.filter(c => c.status !== "approved").length.toString() },
            { label: "Revenue", value: `$${(totalRevenue / 1000).toFixed(1)}k` },
            { label: "Pending", value: `$${(totalPending / 1000).toFixed(1)}k` },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-4 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
              <p className="text-2xl font-bold tracking-tight mt-1">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-xl bg-card/60 border-border/30"
            />
          </div>
          <div className="flex items-center gap-1 rounded-full bg-muted/40 p-1">
            {(["all", "pending", "changes", "approved"] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize",
                  filterStatus === s ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground/70"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Client cards */}
        <div className="space-y-3">
          {filteredClients.map(c => {
            const cfg = statusConfig[c.status];
            const completedDel = c.deliverables.filter(d => d.completed).length;
            const budgetPct = Math.round((c.spent / c.budget) * 100);
            return (
              <button
                key={c.id}
                onClick={() => { setSelectedId(c.id); setActiveTab("overview"); }}
                className="w-full text-left rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm hover:bg-card/80 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold">{c.client}</h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${cfg.className}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.project}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <span>{completedDel}/{c.deliverables.length} deliverables</span>
                  <span>·</span>
                  <span>{budgetPct}% budget used</span>
                  <span>·</span>
                  <span>R{c.revisionRound}</span>
                  {c.rating && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-foreground/40 text-foreground/40" /> {c.rating}</span>
                    </>
                  )}
                </div>
                <Progress value={(completedDel / c.deliverables.length) * 100} className="h-1 mt-3 rounded-full" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Detail view ──
  const currentRating = selected.rating || 0;
  const completedDeliverables = selected.deliverables.filter(d => d.completed).length;
  const budgetPercent = Math.round((selected.spent / selected.budget) * 100);
  const hoursPercent = Math.round((selected.hoursTracked / selected.hoursBudgeted) * 100);
  const cfg = statusConfig[selected.status];

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "deliverables", label: "Deliverables" },
    { id: "messages", label: "Messages" },
    { id: "files", label: "Files" },
    { id: "activity", label: "Activity" },
    { id: "versions", label: "Versions" },
    { id: "invoices", label: "Invoices" },
  ];

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-start gap-3">
        <button onClick={() => setSelectedId(null)} className="mt-1 p-2 rounded-xl hover:bg-muted/50 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold">{selected.client}</h2>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.className}`}>{cfg.label}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{selected.project} — {selected.description}</p>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1.5 flex-wrap">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {selected.startDate} — {selected.dueDate}</span>
            <span>·</span>
            <span>R{selected.revisionRound}</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl gap-1.5 text-xs"
            onClick={() => {
              const url = `${window.location.origin}/client/${selected.id}`;
              navigator.clipboard.writeText(url);
              toast.success("Client link copied to clipboard");
            }}
          >
            <Copy className="w-3.5 h-3.5" /> Copy Link
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl gap-1.5 text-xs"
            onClick={() => window.open(`/client/${selected.id}`, "_blank")}
          >
            <ExternalLink className="w-3.5 h-3.5" /> Preview
          </Button>
          {selected.status !== "approved" && (
            <>
              <Button size="sm" onClick={handleApprove} className="rounded-xl gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5" /> Approve
              </Button>
              <Button size="sm" variant="outline" onClick={handleRequestChanges} className="rounded-xl gap-1.5">
                <PenLine className="w-3.5 h-3.5" /> Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 rounded-full bg-muted/40 p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              activeTab === tab.id ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Budget", value: `$${selected.spent.toLocaleString()}`, sub: `of $${selected.budget.toLocaleString()} (${budgetPercent}%)` },
                  { label: "Hours", value: `${selected.hoursTracked}h`, sub: `of ${selected.hoursBudgeted}h (${hoursPercent}%)` },
                  { label: "Deliverables", value: `${completedDeliverables}/${selected.deliverables.length}`, sub: completedDeliverables === selected.deliverables.length ? "All done ✓" : `${selected.deliverables.length - completedDeliverables} remaining` },
                  { label: "Revisions", value: `R${selected.revisionRound}`, sub: `${selected.startDate} → ${selected.dueDate}` },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-4 shadow-sm">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                    <p className="text-xl font-bold mt-1">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Progress</h3>
                <ProgressTimeline milestones={selected.milestones} />
              </div>
              <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Rating</h3>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => handleRate(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="p-1 transition-transform hover:scale-125">
                      <Star className={cn("w-6 h-6 transition-colors", (hoverRating || currentRating) >= star ? "fill-foreground/60 text-foreground" : "text-border")} />
                    </button>
                  ))}
                  {currentRating > 0 && <span className="text-sm text-muted-foreground ml-3">{currentRating}.0</span>}
                </div>
              </div>
              <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Recent Activity</h3>
                  <button onClick={() => setActiveTab("activity")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5">View all <ChevronRight className="w-3 h-3" /></button>
                </div>
                <div className="space-y-2.5">
                  {selected.activity.slice(0, 4).map(a => (
                    <div key={a.id} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-muted/40 flex items-center justify-center shrink-0 mt-0.5">{activityIcons[a.type]}</div>
                      <div>
                        <p className="text-xs">{a.description}</p>
                        <p className="text-[10px] text-muted-foreground">{a.actor} · {a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "deliverables" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{completedDeliverables} of {selected.deliverables.length} completed</p>
                <p className="text-2xl font-bold">{Math.round((completedDeliverables / selected.deliverables.length) * 100)}%</p>
              </div>
              <Progress value={(completedDeliverables / selected.deliverables.length) * 100} className="h-2 rounded-full" />
              <div className="space-y-2">
                {selected.deliverables.map(d => (
                  <button key={d.id} onClick={() => toggleDeliverable(d.id)} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-card/60 backdrop-blur-xl border border-border/30 hover:bg-card/80 transition-colors text-left group">
                    <div className={cn("w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors",
                      d.completed ? "bg-foreground border-foreground" : "border-border group-hover:border-foreground/40"
                    )}>
                      {d.completed && <CheckCircle2 className="w-3 h-3 text-background" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium", d.completed && "line-through text-muted-foreground")}>{d.label}</p>
                      {d.dueDate && <p className="text-[10px] text-muted-foreground">Due {d.dueDate}</p>}
                    </div>
                    {!d.completed && <Badge variant="outline" className="text-[9px] h-5 border-foreground/15">Pending</Badge>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm">
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {selected.messages.map((msg, i) => (
                    <div key={i} className={cn("flex flex-col gap-0.5", msg.from === "You" ? "items-end" : "items-start")}>
                      <div className={cn("max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm",
                        msg.from === "You" ? "bg-foreground text-background rounded-br-md" : "bg-muted/40 rounded-bl-md"
                      )}>{msg.text}</div>
                      <span className="text-[10px] text-muted-foreground px-1.5">
                        {msg.from === "You" ? "" : `${msg.from} · `}{msg.time}
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type a message…"
                  className="min-h-[40px] max-h-[80px] resize-none text-sm rounded-xl bg-card/60 border-border/30"
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <Button size="icon" onClick={handleSend} disabled={!message.trim()} className="shrink-0 rounded-xl h-10 w-10">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="space-y-2">
              {selected.files.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-xl border border-border/30 hover:bg-card/80 transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-muted/40 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{file.size}{file.date ? ` · ${file.date}` : ""}</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-muted/40">
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border/40 hover:border-foreground/30 hover:bg-muted/10 transition-colors text-muted-foreground hover:text-foreground">
                <Upload className="w-4 h-4" />
                <span className="text-xs font-medium">Upload files</span>
              </button>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-1">
              {selected.activity.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/15 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">{activityIcons[a.type]}</div>
                  <div>
                    <p className="text-sm">{a.description}</p>
                    <p className="text-[10px] text-muted-foreground">{a.actor} · {a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "versions" && (
            <div className="space-y-3">
              {selected.versions.map((v, i) => (
                <div key={v.id} className={cn("p-4 rounded-xl border transition-colors",
                  i === 0 ? "bg-foreground/5 border-foreground/15" : "bg-card/60 border-border/30"
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{v.version}</span>
                      {i === 0 && <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-foreground/20">Latest</Badge>}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{v.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{v.notes}</p>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1.5"><Paperclip className="w-3 h-3" />{v.filesCount} files</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-4 shadow-sm">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
                  <p className="text-lg font-bold mt-1">${selected.invoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}</p>
                </div>
                <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-4 shadow-sm">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Paid</p>
                  <p className="text-lg font-bold mt-1">${selected.invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0).toLocaleString()}</p>
                </div>
              </div>
              {selected.invoices.map(inv => (
                <div key={inv.id} className="flex items-center gap-3 p-4 rounded-xl bg-card/60 backdrop-blur-xl border border-border/30">
                  <div className="w-9 h-9 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{inv.label}</p>
                    <p className="text-[10px] text-muted-foreground">Due {inv.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">${inv.amount.toLocaleString()}</p>
                    <span className={cn("text-[9px] font-medium px-2 py-0.5 rounded-full capitalize", invoiceStatusConfig[inv.status])}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};
