import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MessageSquare, Send, Upload, FileText, CheckCircle2,
  Clock, Eye, PenLine, ThumbsUp, Paperclip, X,
  LayoutDashboard, ListChecks, Activity, Receipt, History,
  ChevronRight, Download, ExternalLink, Calendar, DollarSign,
  Users, Zap, BarChart3, ArrowUpRight, Check, Circle, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ─── Types ─── */
interface Message { from: string; text: string; time: string }
interface FileItem { name: string; size: string; type?: string; date?: string }

interface Milestone {
  label: string;
  status: "done" | "active" | "upcoming";
  date?: string;
}

interface Deliverable {
  id: string;
  label: string;
  completed: boolean;
  dueDate?: string;
}

interface ActivityItem {
  id: string;
  type: "message" | "file" | "status" | "rating" | "revision" | "payment";
  description: string;
  time: string;
  actor: string;
}

interface VersionItem {
  id: string;
  version: string;
  date: string;
  notes: string;
  filesCount: number;
}

interface InvoiceItem {
  id: string;
  label: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  dueDate: string;
}

interface HandoffData {
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

/* ─── Mock Data ─── */
const PORTAL_DATA: Record<string, HandoffData> = {
  "flux-brand": {
    id: "flux-brand",
    client: "Flux Labs",
    project: "Brand Identity",
    description: "Complete brand identity system including logo, color palette, typography, and brand guidelines document.",
    status: "approved",
    rating: 5,
    revisionRound: 2,
    startDate: "Jan 5",
    dueDate: "Feb 10",
    budget: 8500,
    spent: 8200,
    hoursTracked: 62,
    hoursBudgeted: 65,
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
      { from: "Designer", text: "Final brand assets are ready for review.", time: "Feb 8" },
      { from: "Flux Labs", text: "Everything looks perfect, approved!", time: "Feb 9" },
      { from: "Designer", text: "Great — hand-off confirmed. Thanks!", time: "Feb 10" },
    ],
    files: [
      { name: "flux-brand-guide.pdf", size: "4.2 MB", type: "pdf", date: "Feb 8" },
      { name: "logo-variations.zip", size: "12 MB", type: "zip", date: "Feb 8" },
      { name: "color-palette.png", size: "340 KB", type: "image", date: "Feb 5" },
      { name: "social-templates.fig", size: "8.5 MB", type: "figma", date: "Feb 8" },
      { name: "business-cards.pdf", size: "1.2 MB", type: "pdf", date: "Feb 8" },
    ],
    activity: [
      { id: "a1", type: "status", description: "Project signed off and approved", time: "Feb 10", actor: "Flux Labs" },
      { id: "a2", type: "rating", description: "Rated 5 stars", time: "Feb 10", actor: "Flux Labs" },
      { id: "a3", type: "file", description: "Uploaded final brand assets package", time: "Feb 8", actor: "Designer" },
      { id: "a4", type: "revision", description: "Completed revision round 2", time: "Feb 1", actor: "Designer" },
      { id: "a5", type: "message", description: "Sent initial concepts for review", time: "Jan 20", actor: "Designer" },
      { id: "a6", type: "payment", description: "Invoice #INV-001 paid ($4,250)", time: "Jan 18", actor: "Flux Labs" },
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
  "mono-website": {
    id: "mono-website",
    client: "Mono Studio",
    project: "Website V2",
    description: "Full website redesign with new information architecture, responsive layouts, and interactive prototypes.",
    status: "pending",
    rating: null,
    revisionRound: 1,
    startDate: "Feb 1",
    dueDate: "Mar 1",
    budget: 12000,
    spent: 7800,
    hoursTracked: 48,
    hoursBudgeted: 80,
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
      { id: "d4", label: "Responsive Page Designs (6 pages)", completed: true, dueDate: "Feb 18" },
      { id: "d5", label: "Interactive Prototype", completed: false, dueDate: "Feb 25" },
      { id: "d6", label: "Developer Handoff Specs", completed: false, dueDate: "Feb 28" },
    ],
    messages: [
      { from: "Designer", text: "Here's the website redesign for your review.", time: "Feb 18" },
      { from: "Designer", text: "Let me know if any sections need adjustments.", time: "Feb 19" },
    ],
    files: [
      { name: "website-v2-mockups.fig", size: "18 MB", type: "figma", date: "Feb 18" },
      { name: "wireframes.pdf", size: "3.4 MB", type: "pdf", date: "Feb 10" },
    ],
    activity: [
      { id: "a1", type: "file", description: "Uploaded website mockups", time: "Feb 18", actor: "Designer" },
      { id: "a2", type: "message", description: "Sent designs for review", time: "Feb 18", actor: "Designer" },
      { id: "a3", type: "file", description: "Uploaded wireframes", time: "Feb 10", actor: "Designer" },
      { id: "a4", type: "payment", description: "Invoice #INV-003 paid ($6,000)", time: "Feb 5", actor: "Mono Studio" },
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
  "nextwave-app": {
    id: "nextwave-app",
    client: "Nextwave",
    project: "App Screens",
    description: "Mobile app screen designs for iOS and Android, covering onboarding, dashboard, settings, and profile flows.",
    status: "changes",
    rating: 3,
    revisionRound: 3,
    startDate: "Jan 5",
    dueDate: "Feb 28",
    budget: 9500,
    spent: 8100,
    hoursTracked: 71,
    hoursBudgeted: 75,
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
      { from: "Designer", text: "App screens V3 uploaded.", time: "Feb 15" },
      { from: "Nextwave", text: "The onboarding flow needs more polish.", time: "Feb 16" },
      { from: "Designer", text: "On it — will revise by tomorrow.", time: "Feb 16" },
      { from: "Nextwave", text: "Also the color scheme for settings page.", time: "Feb 17" },
      { from: "Designer", text: "Noted, updating both sections.", time: "Feb 17" },
      { from: "Nextwave", text: "Can we also revisit the nav icons?", time: "Feb 18" },
      { from: "Designer", text: "Sure, I'll include icon alternatives.", time: "Feb 18" },
    ],
    files: [
      { name: "app-screens-v3.png", size: "2.8 MB", type: "image", date: "Feb 15" },
      { name: "onboarding-flow.pdf", size: "1.5 MB", type: "pdf", date: "Feb 15" },
      { name: "dashboard-v2.fig", size: "6.2 MB", type: "figma", date: "Feb 2" },
    ],
    activity: [
      { id: "a1", type: "message", description: "Requested nav icon revisions", time: "Feb 18", actor: "Nextwave" },
      { id: "a2", type: "revision", description: "Started revision round 3", time: "Feb 15", actor: "Designer" },
      { id: "a3", type: "file", description: "Uploaded V3 screens", time: "Feb 15", actor: "Designer" },
      { id: "a4", type: "revision", description: "Completed revision round 2", time: "Feb 2", actor: "Designer" },
      { id: "a5", type: "rating", description: "Rated 3 stars", time: "Feb 3", actor: "Nextwave" },
      { id: "a6", type: "payment", description: "Invoice #INV-005 paid ($4,750)", time: "Jan 10", actor: "Nextwave" },
      { id: "a7", type: "status", description: "Changes requested on onboarding", time: "Feb 16", actor: "Nextwave" },
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
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  approved: { label: "Approved", icon: <ThumbsUp className="w-4 h-4" />, className: "bg-success/15 text-success border-success/20" },
  pending: { label: "Pending Review", icon: <Eye className="w-4 h-4" />, className: "bg-warning/15 text-warning border-warning/20" },
  changes: { label: "Changes Requested", icon: <PenLine className="w-4 h-4" />, className: "bg-destructive/15 text-destructive border-destructive/20" },
};

const invoiceStatusConfig: Record<string, string> = {
  paid: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
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

const fileTypeIcons: Record<string, string> = {
  pdf: "text-destructive",
  figma: "text-purple-500",
  image: "text-blue-500",
  zip: "text-warning",
};

type TabId = "overview" | "deliverables" | "messages" | "files" | "activity" | "versions" | "invoices";

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "deliverables", label: "Deliverables", icon: <ListChecks className="w-4 h-4" /> },
  { id: "messages", label: "Messages", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "files", label: "Files", icon: <Paperclip className="w-4 h-4" /> },
  { id: "activity", label: "Activity", icon: <Activity className="w-4 h-4" /> },
  { id: "versions", label: "Versions", icon: <History className="w-4 h-4" /> },
  { id: "invoices", label: "Invoices", icon: <Receipt className="w-4 h-4" /> },
];

/* ─── Progress Timeline ─── */
const ProgressTimeline = ({ milestones }: { milestones: Milestone[] }) => (
  <div className="relative">
    <div className="flex items-start justify-between gap-1">
      {milestones.map((m, i) => {
        const isLast = i === milestones.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center text-center relative">
            {!isLast && (
              <div className={cn("absolute top-3 left-[calc(50%+10px)] right-[calc(-50%+10px)] h-0.5", m.status === "done" ? "bg-success" : "bg-border")} />
            )}
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center relative z-10 border-2 shrink-0",
              m.status === "done" && "bg-success border-success",
              m.status === "active" && "bg-background border-primary animate-pulse",
              m.status === "upcoming" && "bg-muted border-border"
            )}>
              {m.status === "done" && <CheckCircle2 className="w-3.5 h-3.5 text-success-foreground" />}
              {m.status === "active" && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
            <p className={cn("text-[10px] mt-1.5 leading-tight font-medium max-w-[70px]",
              m.status === "done" && "text-foreground",
              m.status === "active" && "text-primary",
              m.status === "upcoming" && "text-muted-foreground"
            )}>{m.label}</p>
            {m.date && <p className="text-[9px] text-muted-foreground mt-0.5">{m.date}</p>}
          </div>
        );
      })}
    </div>
  </div>
);

/* ─── Stat Card ─── */
const StatCard = ({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: React.ReactNode }) => (
  <div className="p-4 rounded-xl bg-secondary/30 border border-border/30 space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="text-muted-foreground">{icon}</div>
    </div>
    <p className="text-xl font-bold tracking-tight">{value}</p>
    {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
  </div>
);

/* ─── Main Portal Page ─── */
const ClientPortalPage = () => {
  const { portalId } = useParams<{ portalId: string }>();
  const [data, setData] = useState<HandoffData | null>(null);
  const [message, setMessage] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (portalId && PORTAL_DATA[portalId]) {
      setData({ ...PORTAL_DATA[portalId] });
    }
  }, [portalId]);

  useEffect(() => {
    if (activeTab === "messages") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.messages.length, activeTab]);

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Eye className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold">Portal not found</h1>
          <p className="text-sm text-muted-foreground max-w-xs">This link may have expired or the project doesn't exist.</p>
        </div>
      </div>
    );
  }

  const currentRating = data.rating || 0;
  const status = statusConfig[data.status];
  const completedDeliverables = data.deliverables.filter(d => d.completed).length;
  const budgetPercent = Math.round((data.spent / data.budget) * 100);
  const hoursPercent = Math.round((data.hoursTracked / data.hoursBudgeted) * 100);

  const handleSend = () => {
    if (!message.trim()) return;
    setData(prev => prev ? {
      ...prev,
      messages: [...prev.messages, { from: prev.client, text: message.trim(), time: "Just now" }],
      activity: [{ id: `a-${Date.now()}`, type: "message" as const, description: `Sent a message`, time: "Just now", actor: prev.client }, ...prev.activity],
    } : prev);
    setMessage("");
    toast.success("Message sent");
  };

  const handleRate = (rating: number) => {
    setData(prev => prev ? { ...prev, rating } : prev);
    toast.success(`Rated ${rating} star${rating > 1 ? "s" : ""}`);
  };

  const handleApprove = () => {
    setData(prev => {
      if (!prev) return prev;
      const updated = { ...prev, status: "approved" as const };
      updated.milestones = updated.milestones.map(m =>
        m.status === "active" || m.status === "upcoming" ? { ...m, status: "done" as const, date: "Today" } : m
      );
      updated.activity = [{ id: `a-${Date.now()}`, type: "status", description: "Project approved", time: "Just now", actor: prev.client }, ...updated.activity];
      return updated;
    });
    toast.success("Project approved! 🎉");
  };

  const handleRequestChanges = () => {
    setData(prev => prev ? {
      ...prev,
      status: "changes" as const,
      revisionRound: prev.revisionRound + 1,
      activity: [{ id: `a-${Date.now()}`, type: "revision", description: "Requested changes", time: "Just now", actor: prev.client }, ...prev.activity],
    } : prev);
    toast("Changes requested — the designer will be notified.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map(f => ({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      date: "Just now",
    }));
    setData(prev => prev ? {
      ...prev,
      files: [...prev.files, ...newFiles],
      activity: [{ id: `a-${Date.now()}`, type: "file", description: `Uploaded ${newFiles.length} file(s)`, time: "Just now", actor: prev.client }, ...prev.activity],
    } : prev);
    toast.success(`${newFiles.length} file${newFiles.length > 1 ? "s" : ""} uploaded`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleDeliverable = (id: string) => {
    setData(prev => prev ? {
      ...prev,
      deliverables: prev.deliverables.map(d => d.id === id ? { ...d, completed: !d.completed } : d),
    } : prev);
  };

  /* ─── Tab Content ─── */
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-5">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Budget" value={`$${data.spent.toLocaleString()}`} sub={`of $${data.budget.toLocaleString()} (${budgetPercent}%)`} icon={<DollarSign className="w-4 h-4" />} />
              <StatCard label="Hours" value={`${data.hoursTracked}h`} sub={`of ${data.hoursBudgeted}h budgeted (${hoursPercent}%)`} icon={<Clock className="w-4 h-4" />} />
              <StatCard label="Deliverables" value={`${completedDeliverables}/${data.deliverables.length}`} sub={completedDeliverables === data.deliverables.length ? "All completed ✓" : `${data.deliverables.length - completedDeliverables} remaining`} icon={<ListChecks className="w-4 h-4" />} />
              <StatCard label="Revisions" value={`R${data.revisionRound}`} sub={`${data.startDate} → ${data.dueDate}`} icon={<History className="w-4 h-4" />} />
            </div>

            {/* Progress */}
            <div className="p-5 rounded-2xl bg-card border border-border/50">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Progress</h3>
              <ProgressTimeline milestones={data.milestones} />
            </div>

            {/* Rating */}
            <div className="p-5 rounded-2xl bg-card border border-border/50">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Rate this delivery</h3>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => handleRate(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="p-1 transition-transform hover:scale-125">
                    <Star className={cn("w-7 h-7 transition-colors", (hoverRating || currentRating) >= star ? "fill-warning text-warning" : "text-border")} />
                  </button>
                ))}
                {currentRating > 0 && <span className="text-sm text-muted-foreground ml-3 font-medium">{currentRating}.0</span>}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="p-5 rounded-2xl bg-card border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Recent Activity</h3>
                <button onClick={() => setActiveTab("activity")} className="text-xs text-primary hover:underline flex items-center gap-0.5">View all <ChevronRight className="w-3 h-3" /></button>
              </div>
              <div className="space-y-3">
                {data.activity.slice(0, 4).map(a => (
                  <div key={a.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-secondary/60 flex items-center justify-center shrink-0 mt-0.5">{activityIcons[a.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{a.description}</p>
                      <p className="text-[11px] text-muted-foreground">{a.actor} · {a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "deliverables":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{completedDeliverables} of {data.deliverables.length} completed</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Track deliverable progress</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{Math.round((completedDeliverables / data.deliverables.length) * 100)}%</p>
              </div>
            </div>
            <Progress value={(completedDeliverables / data.deliverables.length) * 100} className="h-2" />
            <div className="space-y-2 pt-2">
              {data.deliverables.map(d => (
                <button key={d.id} onClick={() => toggleDeliverable(d.id)} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors text-left group">
                  <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                    d.completed ? "bg-success border-success" : "border-border group-hover:border-primary"
                  )}>
                    {d.completed && <Check className="w-3 h-3 text-success-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", d.completed && "line-through text-muted-foreground")}>{d.label}</p>
                    {d.dueDate && <p className="text-[11px] text-muted-foreground">Due {d.dueDate}</p>}
                  </div>
                  {!d.completed && d.dueDate && (
                    <span className="text-[10px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">Pending</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case "messages":
        return (
          <div className="space-y-3">
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {data.messages.map((msg, i) => (
                <div key={i} className={cn("flex flex-col gap-0.5", msg.from === data.client ? "items-end" : "items-start")}>
                  <div className={cn("max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm",
                    msg.from === data.client ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-secondary-foreground rounded-bl-md"
                  )}>{msg.text}</div>
                  <span className="text-[10px] text-muted-foreground px-1.5">
                    {msg.from === data.client ? "" : `${msg.from} · `}{msg.time}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        );

      case "files":
        return (
          <div className="space-y-2">
            {data.files.map((file, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors group">
                <div className={cn("w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0", fileTypeIcons[file.type || ""] || "")}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground">{file.size}{file.date ? ` · ${file.date}` : ""}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-secondary">
                  <Download className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary">
              <Upload className="w-4 h-4" />
              <span className="text-xs font-medium">Upload files</span>
            </button>
          </div>
        );

      case "activity":
        return (
          <div className="space-y-1">
            {data.activity.map((a, i) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center shrink-0 mt-0.5">{activityIcons[a.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{a.description}</p>
                  <p className="text-[11px] text-muted-foreground">{a.actor} · {a.time}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case "versions":
        return (
          <div className="space-y-3">
            {data.versions.map((v, i) => (
              <div key={v.id} className={cn("p-4 rounded-xl border transition-colors",
                i === 0 ? "bg-primary/5 border-primary/20" : "bg-secondary/30 border-border/30"
              )}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-bold", i === 0 && "text-primary")}>{v.version}</span>
                    {i === 0 && <span className="text-[10px] font-medium bg-primary/15 text-primary px-2 py-0.5 rounded-full">Latest</span>}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{v.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">{v.notes}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" />{v.filesCount} files</span>
                </div>
              </div>
            ))}
          </div>
        );

      case "invoices":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="text-lg font-bold mt-1">${data.invoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Paid</p>
                <p className="text-lg font-bold mt-1 text-success">${data.invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0).toLocaleString()}</p>
              </div>
            </div>
            {data.invoices.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/30">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{inv.label}</p>
                  <p className="text-[11px] text-muted-foreground">Due {inv.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${inv.amount.toLocaleString()}</p>
                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full capitalize", invoiceStatusConfig[inv.status])}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Client Portal</span>
              <p className="text-[11px] text-muted-foreground">{data.client}</p>
            </div>
          </div>
          <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border", status.className)}>
            {status.icon}
            {status.label}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5 pb-36">
        {/* Project header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{data.project}</h1>
          <p className="text-sm text-muted-foreground">{data.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 flex-wrap">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Revision {data.revisionRound}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {data.startDate} — {data.dueDate}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {data.client}</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/40">
        <div className="max-w-3xl mx-auto px-4 py-3 space-y-3">
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type a message to the designer..."
              className="min-h-[40px] max-h-[80px] resize-none text-sm rounded-xl bg-secondary/50 border-0 focus-visible:ring-1"
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            <Button size="icon" onClick={handleSend} disabled={!message.trim()} className="shrink-0 rounded-xl h-10 w-10">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {data.status !== "approved" && (
            <div className="flex gap-2">
              <Button onClick={handleApprove} className="flex-1 rounded-xl gap-2" variant="default">
                <ThumbsUp className="w-4 h-4" /> Approve
              </Button>
              <Button onClick={handleRequestChanges} className="flex-1 rounded-xl gap-2" variant="outline">
                <PenLine className="w-4 h-4" /> Request Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPortalPage;
