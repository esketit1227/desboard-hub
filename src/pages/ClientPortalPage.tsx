import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MessageSquare, Send, Upload, FileText, CheckCircle2,
  Clock, Eye, PenLine, ThumbsUp, ChevronDown, Paperclip, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ─── Types ─── */
interface Message { from: string; text: string; time: string }
interface FileItem { name: string; size: string }

interface Milestone {
  label: string;
  status: "done" | "active" | "upcoming";
  date?: string;
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
    milestones: [
      { label: "Brief Received", status: "done", date: "Jan 12" },
      { label: "Concept Delivered", status: "done", date: "Jan 20" },
      { label: "Revisions", status: "done", date: "Feb 1" },
      { label: "Final Delivery", status: "done", date: "Feb 8" },
      { label: "Sign-off", status: "done", date: "Feb 10" },
    ],
    messages: [
      { from: "Designer", text: "Final brand assets are ready for review.", time: "Feb 8" },
      { from: "Flux Labs", text: "Everything looks perfect, approved!", time: "Feb 9" },
      { from: "Designer", text: "Great — hand-off confirmed. Thanks!", time: "Feb 10" },
    ],
    files: [
      { name: "flux-brand-guide.pdf", size: "4.2 MB" },
      { name: "logo-variations.zip", size: "12 MB" },
      { name: "color-palette.png", size: "340 KB" },
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
    milestones: [
      { label: "Brief Received", status: "done", date: "Feb 1" },
      { label: "Wireframes", status: "done", date: "Feb 10" },
      { label: "Visual Design", status: "done", date: "Feb 18" },
      { label: "Client Review", status: "active" },
      { label: "Sign-off", status: "upcoming" },
    ],
    messages: [
      { from: "Designer", text: "Here's the website redesign for your review.", time: "Feb 18" },
      { from: "Designer", text: "Let me know if any sections need adjustments.", time: "Feb 19" },
    ],
    files: [{ name: "website-v2-mockups.fig", size: "18 MB" }],
  },
  "nextwave-app": {
    id: "nextwave-app",
    client: "Nextwave",
    project: "App Screens",
    description: "Mobile app screen designs for iOS and Android, covering onboarding, dashboard, settings, and profile flows.",
    status: "changes",
    rating: 3,
    revisionRound: 3,
    milestones: [
      { label: "Brief Received", status: "done", date: "Jan 5" },
      { label: "V1 Delivered", status: "done", date: "Jan 18" },
      { label: "Revisions (R2)", status: "done", date: "Feb 2" },
      { label: "Revisions (R3)", status: "active" },
      { label: "Sign-off", status: "upcoming" },
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
      { name: "app-screens-v3.png", size: "2.8 MB" },
      { name: "onboarding-flow.pdf", size: "1.5 MB" },
    ],
  },
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  approved: { label: "Approved", icon: <ThumbsUp className="w-4 h-4" />, className: "bg-success/15 text-success border-success/20" },
  pending: { label: "Pending Review", icon: <Eye className="w-4 h-4" />, className: "bg-warning/15 text-warning border-warning/20" },
  changes: { label: "Changes Requested", icon: <PenLine className="w-4 h-4" />, className: "bg-destructive/15 text-destructive border-destructive/20" },
};

/* ─── Progress Timeline ─── */
const ProgressTimeline = ({ milestones }: { milestones: Milestone[] }) => (
  <div className="relative">
    <div className="flex items-start justify-between gap-1">
      {milestones.map((m, i) => {
        const isLast = i === milestones.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center text-center relative">
            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute top-3 left-[calc(50%+10px)] right-[calc(-50%+10px)] h-0.5",
                  m.status === "done" ? "bg-success" : "bg-border"
                )}
              />
            )}
            {/* Dot */}
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center relative z-10 border-2 shrink-0",
                m.status === "done" && "bg-success border-success",
                m.status === "active" && "bg-background border-primary animate-pulse",
                m.status === "upcoming" && "bg-muted border-border"
              )}
            >
              {m.status === "done" && <CheckCircle2 className="w-3.5 h-3.5 text-success-foreground" />}
              {m.status === "active" && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
            <p className={cn(
              "text-[10px] mt-1.5 leading-tight font-medium max-w-[70px]",
              m.status === "done" && "text-foreground",
              m.status === "active" && "text-primary",
              m.status === "upcoming" && "text-muted-foreground"
            )}>
              {m.label}
            </p>
            {m.date && <p className="text-[9px] text-muted-foreground mt-0.5">{m.date}</p>}
          </div>
        );
      })}
    </div>
  </div>
);

/* ─── Main Portal Page ─── */
const ClientPortalPage = () => {
  const { portalId } = useParams<{ portalId: string }>();
  const [data, setData] = useState<HandoffData | null>(null);
  const [message, setMessage] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [activeTab, setActiveTab] = useState<"messages" | "files">("messages");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (portalId && PORTAL_DATA[portalId]) {
      setData({ ...PORTAL_DATA[portalId] });
    }
  }, [portalId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length]);

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

  const handleSend = () => {
    if (!message.trim()) return;
    setData(prev => prev ? {
      ...prev,
      messages: [...prev.messages, { from: prev.client, text: message.trim(), time: "Just now" }],
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
      return updated;
    });
    toast.success("Project approved! 🎉");
  };

  const handleRequestChanges = () => {
    setData(prev => prev ? { ...prev, status: "changes" as const, revisionRound: prev.revisionRound + 1 } : prev);
    toast("Changes requested — the designer will be notified.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map(f => ({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
    setData(prev => prev ? { ...prev, files: [...prev.files, ...newFiles] } : prev);
    toast.success(`${newFiles.length} file${newFiles.length > 1 ? "s" : ""} uploaded`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Client Portal</span>
          </div>
          <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border", status.className)}>
            {status.icon}
            {status.label}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Project header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{data.project}</h1>
          <p className="text-sm text-muted-foreground">{data.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Revision {data.revisionRound}</span>
            <span>·</span>
            <span>{data.client}</span>
          </div>
        </motion.div>

        {/* Progress Timeline */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="p-5 rounded-2xl bg-card border border-border/50"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Progress</h3>
          <ProgressTimeline milestones={data.milestones} />
        </motion.div>

        {/* Rating */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-card border border-border/50"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Rate this delivery</h3>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-125"
              >
                <Star className={cn(
                  "w-7 h-7 transition-colors",
                  (hoverRating || currentRating) >= star ? "fill-warning text-warning" : "text-border"
                )} />
              </button>
            ))}
            {currentRating > 0 && (
              <span className="text-sm text-muted-foreground ml-3 font-medium">{currentRating}.0</span>
            )}
          </div>
        </motion.div>

        {/* Tabs: Messages / Files */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl bg-card border border-border/50 overflow-hidden"
        >
          <div className="flex border-b border-border/50">
            <button
              onClick={() => setActiveTab("messages")}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeTab === "messages" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="w-4 h-4" /> Messages
              <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full font-semibold">{data.messages.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("files")}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeTab === "files" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Paperclip className="w-4 h-4" /> Files
              <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full font-semibold">{data.files.length}</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "messages" ? (
              <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {data.messages.map((msg, i) => (
                    <div key={i} className={cn("flex flex-col gap-0.5", msg.from === data.client ? "items-end" : "items-start")}>
                      <div className={cn(
                        "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm",
                        msg.from === data.client
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-secondary-foreground rounded-bl-md"
                      )}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1.5">
                        {msg.from === data.client ? "" : `${msg.from} · `}{msg.time}
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </motion.div>
            ) : (
              <motion.div key="files" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-2">
                {data.files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-[11px] text-muted-foreground">{file.size}</p>
                    </div>
                  </div>
                ))}
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-xs font-medium">Upload files</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/40">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-3">
          {/* Message input */}
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

          {/* Action buttons */}
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
