import { useState } from "react";
import { Star, MessageSquare, Check, ChevronRight, Users } from "lucide-react";
import ClientDetailSheet from "./ClientDetailSheet";
import { getSizeTier } from "./WidgetCard";

export interface Handoff {
  id: string; client: string; project: string;
  status: "approved" | "pending" | "changes"; rating: number | null;
  messages: { from: string; text: string; time: string }[];
  files: { name: string; size: string }[];
}

const initialHandoffs: Handoff[] = [
  {
    id: "1", client: "Flux Labs", project: "Brand Identity", status: "approved", rating: 5,
    messages: [
      { from: "You", text: "Final brand assets are ready for review.", time: "2h ago" },
      { from: "Flux Labs", text: "Everything looks perfect, approved!", time: "1h ago" },
      { from: "You", text: "Great — hand-off confirmed. Thanks!", time: "45m ago" },
    ],
    files: [{ name: "flux-brand-guide.pdf", size: "4.2 MB" }, { name: "logo-variations.zip", size: "12 MB" }],
  },
  {
    id: "2", client: "Mono Studio", project: "Website V2", status: "pending", rating: null,
    messages: [{ from: "You", text: "Here's the website redesign for your review.", time: "3h ago" }],
    files: [{ name: "website-v2-mockups.fig", size: "18 MB" }],
  },
  {
    id: "3", client: "Nextwave", project: "App Screens", status: "changes", rating: 3,
    messages: [
      { from: "You", text: "App screens V2 uploaded.", time: "1d ago" },
      { from: "Nextwave", text: "The onboarding flow needs more polish.", time: "6h ago" },
      { from: "You", text: "On it — will revise by tomorrow.", time: "5h ago" },
      { from: "Nextwave", text: "Also the color scheme for settings page.", time: "4h ago" },
      { from: "You", text: "Noted, updating both sections.", time: "3h ago" },
      { from: "Nextwave", text: "Can we also revisit the nav icons?", time: "2h ago" },
      { from: "You", text: "Sure, I'll include icon alternatives.", time: "1h ago" },
    ],
    files: [{ name: "app-screens-v2.png", size: "2.8 MB" }, { name: "onboarding-flow.pdf", size: "1.5 MB" }],
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-success/10 text-success" },
  pending: { label: "Pending", className: "bg-warning/10 text-warning" },
  changes: { label: "Changes", className: "bg-destructive/10 text-destructive" },
};

export const ClientsPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const tier = getSizeTier(pixelSize);
  const pending = initialHandoffs.filter(h => h.status === "pending").length;
  const approved = initialHandoffs.filter(h => h.status === "approved").length;
  const changes = initialHandoffs.filter(h => h.status === "changes").length;

  if (tier === "compact") {
    return (
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl font-bold tracking-tight leading-none">{initialHandoffs.length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Hand-offs</p>
          </div>
          <Users className="w-5 h-5 text-muted-foreground/40" />
        </div>
        <div className="flex items-center gap-3 mt-auto">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-[9px] text-muted-foreground">{approved} done</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-[9px] text-muted-foreground">{pending} pending</span>
          </div>
        </div>
      </div>
    );
  }

  if (tier === "standard") {
    return (
      <div className="flex flex-col h-full gap-1.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight leading-none">{initialHandoffs.length}</p>
            <p className="text-[10px] text-muted-foreground">Hand-offs</p>
          </div>
          <Users className="w-4 h-4 text-muted-foreground/40" />
        </div>
        <div className="flex-1 space-y-1 mt-1 overflow-hidden">
          {initialHandoffs.map((h) => {
            const cfg = statusConfig[h.status];
            return (
              <div key={h.id} className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.className.includes("success") ? "bg-success" : cfg.className.includes("warning") ? "bg-warning" : "bg-destructive"}`} />
                <span className="text-[10px] font-medium truncate flex-1">{h.client}</span>
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${cfg.className}`}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // expanded
  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-start justify-between">
        <p className="text-lg font-bold leading-none">{initialHandoffs.length} <span className="text-sm font-normal text-muted-foreground">hand-offs</span></p>
      </div>
      <div className="flex-1 space-y-1.5 overflow-hidden">
        {initialHandoffs.map((h) => {
          const cfg = statusConfig[h.status];
          return (
            <div key={h.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium truncate">{h.project}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${cfg.className}`}>{cfg.label}</span>
                </div>
                <p className="text-[9px] text-muted-foreground">{h.client}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {h.rating && (
                  <div className="flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-warning text-warning" />
                    <span className="text-[8px]">{h.rating}</span>
                  </div>
                )}
                <div className="flex items-center gap-0.5 text-muted-foreground">
                  <MessageSquare className="w-2.5 h-2.5" />
                  <span className="text-[8px]">{h.messages.length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-auto pt-1 border-t border-border/30 text-[9px] text-muted-foreground">
        <span>{approved} approved</span>
        <span>·</span>
        <span>{pending} pending</span>
        <span>·</span>
        <span>{changes} changes</span>
      </div>
    </div>
  );
};

/** Full expanded view */
export const ClientsExpanded = () => {
  const [handoffs, setHandoffs] = useState<Handoff[]>(initialHandoffs);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedHandoff = handoffs.find((h) => h.id === selectedId) || null;
  const handleUpdate = (updated: Handoff) => { setHandoffs((prev) => prev.map((h) => (h.id === updated.id ? updated : h))); };

  return (
    <>
      <div className="space-y-3">
        {handoffs.map((item) => (
          <button key={item.id} onClick={() => setSelectedId(item.id)} className="w-full text-left p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group">
            <div className="flex items-start justify-between">
              <div><p className="text-sm font-semibold">{item.project}</p><p className="text-xs text-muted-foreground mt-0.5">{item.client}</p></div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${statusConfig[item.status].className}`}>{statusConfig[item.status].label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground mt-2">
              <div className="flex items-center gap-1">{item.rating ? (<><Star className="w-3.5 h-3.5 fill-warning text-warning" /><span className="text-xs">{item.rating}.0</span></>) : (<span className="text-xs">No rating</span>)}</div>
              <div className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /><span className="text-xs">{item.messages.length} messages</span></div>
              {item.status === "approved" && <Check className="w-3.5 h-3.5 text-success" />}
            </div>
          </button>
        ))}
      </div>
      <ClientDetailSheet handoff={selectedHandoff} open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)} onUpdate={handleUpdate} />
    </>
  );
};
