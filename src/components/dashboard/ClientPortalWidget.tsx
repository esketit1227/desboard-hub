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
    ],
    files: [{ name: "app-screens-v2.png", size: "2.8 MB" }],
  },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-foreground/10 text-foreground/70" },
  pending: { label: "Pending", className: "bg-foreground/5 text-muted-foreground" },
  changes: { label: "Changes", className: "bg-foreground/10 text-foreground" },
};

export const ClientsPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const tier = getSizeTier(pixelSize);
  const pending = initialHandoffs.filter(h => h.status === "pending").length;
  const approved = initialHandoffs.filter(h => h.status === "approved").length;

  if (tier === "compact") return null;

  if (tier === "standard") {
    return (
      <div className="flex flex-col h-full gap-1.5 mt-1">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight leading-none">{initialHandoffs.length}</p>
          <p className="text-[10px] text-muted-foreground">hand-offs</p>
        </div>
        <div className="flex-1 space-y-1 overflow-hidden">
          {initialHandoffs.slice(0, 3).map((h) => (
            <div key={h.id} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/25 shrink-0" />
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
          <p className="text-2xl font-bold tracking-tight leading-none">{initialHandoffs.length}</p>
          <p className="text-xs text-muted-foreground">hand-offs</p>
        </div>
      </div>
      <div className="flex-1 space-y-1.5 overflow-hidden">
        {initialHandoffs.map((h) => {
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

export const ClientsExpanded = () => {
  const [handoffs] = useState(initialHandoffs);
  const [selected, setSelected] = useState<Handoff | null>(null);

  return (
    <>
      <div className="space-y-3">
        {handoffs.map(h => {
          const cfg = statusConfig[h.status];
          return (
            <button key={h.id} onClick={() => setSelected(h)} className="w-full text-left flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors">
              <div>
                <div className="flex items-center gap-2"><span className="text-sm font-semibold">{h.client}</span><span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${cfg.className}`}>{cfg.label}</span></div>
                <p className="text-xs text-muted-foreground">{h.project}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>
      <ClientDetailSheet handoff={selected} open={!!selected} onOpenChange={(open) => !open && setSelected(null)} onUpdate={(h) => setSelected(h)} />
    </>
  );
};
