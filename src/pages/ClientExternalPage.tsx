import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MessageSquare, Send, FileText, CheckCircle2,
  Clock, Eye, PenLine, ThumbsUp, Paperclip, X,
  ChevronRight, Download, Calendar, DollarSign,
  ListChecks, Activity, History, Receipt,
  ExternalLink, ArrowUpRight, Check, Circle, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ─── Types ─── */
interface Message { from: string; text: string; time: string }
interface FileItem { name: string; size: string; type?: string; date?: string }
interface Milestone { label: string; status: "done" | "active" | "upcoming"; date?: string }
interface Deliverable { id: string; label: string; completed: boolean; dueDate?: string }
interface ActivityItem { id: string; type: "message" | "file" | "status" | "rating" | "revision" | "payment"; description: string; time: string; actor: string }
interface VersionItem { id: string; version: string; date: string; notes: string; filesCount: number }
interface InvoiceItem { id: string; label: string; amount: number; status: "paid" | "pending" | "overdue"; dueDate: string }

interface ProjectData {
  id: string; client: string; project: string; description: string;
  status: "approved" | "pending" | "changes"; rating: number | null;
  messages: Message[]; files: FileItem[]; milestones: Milestone[];
  revisionRound: number; deliverables: Deliverable[];
  activity: ActivityItem[]; versions: VersionItem[]; invoices: InvoiceItem[];
  startDate: string; dueDate: string; budget: number; spent: number;
  hoursTracked: number; hoursBudgeted: number;
}

/* ─── Mock Data ─── */
const PROJECT_DATA: Record<string, ProjectData> = {
  "flux-brand": {
    id: "flux-brand", client: "Flux Labs", project: "Brand Identity",
    description: "Complete brand identity system including logo, color palette, typography, and brand guidelines document.",
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
      { from: "Designer", text: "Final brand assets are ready for review.", time: "Feb 8" },
      { from: "Flux Labs", text: "Everything looks perfect, approved!", time: "Feb 9" },
    ],
    files: [
      { name: "flux-brand-guide.pdf", size: "4.2 MB", type: "pdf", date: "Feb 8" },
      { name: "logo-variations.zip", size: "12 MB", type: "zip", date: "Feb 8" },
      { name: "color-palette.png", size: "340 KB", type: "image", date: "Feb 5" },
    ],
    activity: [
      { id: "a1", type: "status", description: "Project signed off and approved", time: "Feb 10", actor: "Flux Labs" },
      { id: "a2", type: "file", description: "Uploaded final brand assets package", time: "Feb 8", actor: "Designer" },
    ],
    versions: [
      { id: "v1", version: "V1.0", date: "Jan 20", notes: "Initial concept delivery", filesCount: 3 },
      { id: "v2", version: "V2.0", date: "Feb 8", notes: "Final delivery with all assets", filesCount: 5 },
    ],
    invoices: [
      { id: "i1", label: "Deposit — 50%", amount: 4250, status: "paid", dueDate: "Jan 15" },
      { id: "i2", label: "Final Payment — 50%", amount: 4250, status: "paid", dueDate: "Feb 15" },
    ],
  },
  "mono-website": {
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
      { from: "Designer", text: "Here's the website redesign for your review.", time: "Feb 18" },
    ],
    files: [
      { name: "website-v2-mockups.fig", size: "18 MB", type: "figma", date: "Feb 18" },
      { name: "wireframes.pdf", size: "3.4 MB", type: "pdf", date: "Feb 10" },
    ],
    activity: [
      { id: "a1", type: "file", description: "Uploaded website mockups", time: "Feb 18", actor: "Designer" },
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
      { from: "Designer", text: "App screens V3 uploaded.", time: "Feb 15" },
      { from: "Nextwave", text: "The onboarding flow needs more polish.", time: "Feb 16" },
    ],
    files: [
      { name: "app-screens-v3.png", size: "2.8 MB", type: "image", date: "Feb 15" },
      { name: "onboarding-flow.pdf", size: "1.5 MB", type: "pdf", date: "Feb 15" },
    ],
    activity: [
      { id: "a1", type: "message", description: "Requested nav icon revisions", time: "Feb 18", actor: "Nextwave" },
      { id: "a2", type: "revision", description: "Started revision round 3", time: "Feb 15", actor: "Designer" },
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

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  approved: { label: "Approved", icon: <ThumbsUp className="w-4 h-4" />, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  pending: { label: "Pending Review", icon: <Eye className="w-4 h-4" />, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  changes: { label: "Changes Requested", icon: <PenLine className="w-4 h-4" />, color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const invoiceStatusColors: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-500",
  pending: "bg-amber-500/10 text-amber-500",
  overdue: "bg-red-500/10 text-red-400",
};

const fileTypeColors: Record<string, string> = {
  pdf: "text-red-400", figma: "text-purple-400", image: "text-blue-400", zip: "text-amber-400",
};

type SectionId = "overview" | "deliverables" | "files" | "messages" | "invoices";

/* ─── Timeline ─── */
const Timeline = ({ milestones }: { milestones: Milestone[] }) => (
  <div className="flex items-start justify-between gap-1">
    {milestones.map((m, i) => {
      const isLast = i === milestones.length - 1;
      return (
        <div key={i} className="flex-1 flex flex-col items-center text-center relative">
          {!isLast && (
            <div className={cn(
              "absolute top-3 left-[calc(50%+10px)] right-[calc(-50%+10px)] h-0.5",
              m.status === "done" ? "bg-emerald-500/40" : "bg-border"
            )} />
          )}
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center relative z-10 border-2 shrink-0",
            m.status === "done" && "bg-emerald-500 border-emerald-500",
            m.status === "active" && "bg-background border-primary animate-pulse",
            m.status === "upcoming" && "bg-muted border-border"
          )}>
            {m.status === "done" && <Check className="w-3.5 h-3.5 text-white" />}
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
);

/* ─── Main External Page ─── */
const ClientExternalPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [data, setData] = useState<ProjectData | null>(null);
  const [section, setSection] = useState<SectionId>("overview");
  const [message, setMessage] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (projectId && PROJECT_DATA[projectId]) {
      setData({ ...PROJECT_DATA[projectId] });
    }
  }, [projectId]);

  useEffect(() => {
    if (section === "messages") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.messages.length, section]);

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Eye className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold">Project not found</h1>
          <p className="text-sm text-muted-foreground max-w-xs">This link may have expired or the project doesn't exist.</p>
        </div>
      </div>
    );
  }

  const status = statusConfig[data.status];
  const currentRating = data.rating || 0;
  const completedDel = data.deliverables.filter(d => d.completed).length;
  const budgetPct = Math.round((data.spent / data.budget) * 100);

  const handleSend = () => {
    if (!message.trim()) return;
    setData(prev => prev ? {
      ...prev,
      messages: [...prev.messages, { from: prev.client, text: message.trim(), time: "Just now" }],
    } : prev);
    setMessage("");
    toast.success("Message sent");
  };

  const handleRate = (r: number) => {
    setData(prev => prev ? { ...prev, rating: r } : prev);
    toast.success(`Rated ${r} star${r > 1 ? "s" : ""}`);
  };

  const handleApprove = () => {
    setData(prev => prev ? {
      ...prev,
      status: "approved" as const,
      milestones: prev.milestones.map(m => ({ ...m, status: "done" as const, date: m.date || "Today" })),
    } : prev);
    toast.success("Project approved! 🎉");
  };

  const handleRequestChanges = () => {
    setData(prev => prev ? {
      ...prev,
      status: "changes" as const,
      revisionRound: prev.revisionRound + 1,
    } : prev);
    toast("Changes requested — the team will be notified.");
  };

  const sections: { id: SectionId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "deliverables", label: "Deliverables" },
    { id: "files", label: "Files" },
    { id: "messages", label: "Messages" },
    { id: "invoices", label: "Invoices" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{data.client.slice(0, 2)}</span>
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">{data.project}</h1>
              <p className="text-[11px] text-muted-foreground">{data.client}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${status.color}`}>
            {status.icon}
            {status.label}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-1 rounded-full bg-muted/40 p-1 w-fit">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                section === s.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {section === "overview" && (
              <div className="space-y-5">
                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Budget Used", value: `$${data.spent.toLocaleString()}`, sub: `of $${data.budget.toLocaleString()} (${budgetPct}%)` },
                    { label: "Deliverables", value: `${completedDel}/${data.deliverables.length}`, sub: completedDel === data.deliverables.length ? "All done ✓" : `${data.deliverables.length - completedDel} remaining` },
                    { label: "Revision", value: `R${data.revisionRound}`, sub: `${data.startDate} → ${data.dueDate}` },
                    { label: "Files", value: data.files.length.toString(), sub: `${data.versions.length} versions` },
                  ].map(s => (
                    <div key={s.label} className="p-4 rounded-2xl bg-card border border-border/30 space-y-1.5">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      <p className="text-xl font-bold tracking-tight">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div className="p-5 rounded-2xl bg-card border border-border/30">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Progress</h3>
                  <Timeline milestones={data.milestones} />
                </div>

                {/* Rating */}
                <div className="p-5 rounded-2xl bg-card border border-border/30">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Rate this project</h3>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => handleRate(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="p-1 transition-transform hover:scale-125">
                        <Star className={cn("w-7 h-7 transition-colors", (hoverRating || currentRating) >= star ? "fill-amber-400 text-amber-400" : "text-border")} />
                      </button>
                    ))}
                    {currentRating > 0 && <span className="text-sm text-muted-foreground ml-3 font-medium">{currentRating}.0</span>}
                  </div>
                </div>

                {/* Actions */}
                {data.status !== "approved" && (
                  <div className="flex gap-3">
                    <Button onClick={handleApprove} className="rounded-xl gap-2 flex-1 sm:flex-none">
                      <ThumbsUp className="w-4 h-4" /> Approve Project
                    </Button>
                    <Button variant="outline" onClick={handleRequestChanges} className="rounded-xl gap-2 flex-1 sm:flex-none">
                      <PenLine className="w-4 h-4" /> Request Changes
                    </Button>
                  </div>
                )}
              </div>
            )}

            {section === "deliverables" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{completedDel}/{data.deliverables.length} completed</h3>
                  <Progress value={(completedDel / data.deliverables.length) * 100} className="w-24 h-1.5" />
                </div>
                <div className="space-y-2">
                  {data.deliverables.map(d => (
                    <div key={d.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/30">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                        d.completed ? "bg-emerald-500" : "border-2 border-border"
                      )}>
                        {d.completed && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", d.completed && "line-through text-muted-foreground")}>{d.label}</p>
                        {d.dueDate && <p className="text-[10px] text-muted-foreground mt-0.5">Due {d.dueDate}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === "files" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{data.files.length} files</h3>
                </div>
                <div className="space-y-2">
                  {data.files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/30 group">
                      <FileText className={cn("w-5 h-5 shrink-0", fileTypeColors[f.type || ""] || "text-muted-foreground")} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{f.name}</p>
                        <p className="text-[10px] text-muted-foreground">{f.size}{f.date ? ` · ${f.date}` : ""}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Versions */}
                <div className="pt-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Versions</h3>
                  <div className="space-y-2">
                    {data.versions.map(v => (
                      <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/20">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">{v.version}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{v.notes}</p>
                          <p className="text-[10px] text-muted-foreground">{v.date} · {v.filesCount} files</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {section === "messages" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-card border border-border/30 max-h-[50vh] overflow-y-auto">
                  <div className="space-y-4">
                    {data.messages.map((m, i) => {
                      const isClient = m.from === data.client;
                      return (
                        <div key={i} className={cn("flex", isClient ? "justify-end" : "justify-start")}>
                          <div className={cn(
                            "max-w-[75%] p-3 rounded-2xl text-sm",
                            isClient ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"
                          )}>
                            <p>{m.text}</p>
                            <p className={cn("text-[10px] mt-1", isClient ? "text-primary-foreground/60" : "text-muted-foreground")}>{m.from} · {m.time}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type a message…"
                    className="rounded-xl bg-card border-border/30 resize-none min-h-[44px] max-h-[120px]"
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  />
                  <Button onClick={handleSend} disabled={!message.trim()} className="rounded-xl h-auto">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {section === "invoices" && (
              <div className="space-y-3">
                {data.invoices.map(inv => (
                  <div key={inv.id} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/30">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Receipt className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{inv.label}</p>
                      <p className="text-[10px] text-muted-foreground">Due {inv.dueDate}</p>
                    </div>
                    <span className="text-sm font-bold">${inv.amount.toLocaleString()}</span>
                    <span className={cn("text-[10px] px-2 py-1 rounded-full font-medium capitalize", invoiceStatusColors[inv.status])}>
                      {inv.status}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t border-border/30 flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">${data.invoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="border-t border-border/20 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-[11px] text-muted-foreground">
            Powered by <span className="font-semibold text-foreground">Desboard</span> · Client Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientExternalPage;
