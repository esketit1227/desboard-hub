import { useState } from "react";
import { Star, MessageSquare, Check, ChevronRight } from "lucide-react";
import ClientDetailSheet from "./ClientDetailSheet";

export interface Handoff {
  id: string;
  client: string;
  project: string;
  status: "approved" | "pending" | "changes";
  rating: number | null;
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
  pending: { label: "Pending Review", className: "bg-warning/10 text-warning" },
  changes: { label: "Changes Req.", className: "bg-destructive/10 text-destructive" },
};

/** Compact preview */
export const ClientsPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const h = pixelSize?.height ?? 140;
  const w = pixelSize?.width ?? 300;

  const titleSize = h > 300 ? "text-4xl" : h > 200 ? "text-3xl" : "text-2xl";
  const labelSize = h > 300 ? "text-sm" : h > 200 ? "text-xs" : "text-[11px]";
  const itemSize = w > 400 ? "text-xs" : "text-[11px]";
  const badgeSize = w > 400 ? "text-[10px]" : "text-[9px]";
  const subSize = w > 400 ? "text-xs" : "text-[10px]";

  const showList = h > 180;
  const showClient = w > 300;
  const showRating = h > 280;
  const itemCount = h > 340 ? initialHandoffs.length : 2;

  if (!showList) {
    const pending = initialHandoffs.filter(h => h.status === "pending").length;
    return (
      <div>
        <p className={`${titleSize} font-bold tracking-tight`}>{initialHandoffs.length}</p>
        <p className={`${labelSize} text-muted-foreground mt-1`}>Active Hand-offs</p>
        {h > 160 && pending > 0 && (
          <p className={`${subSize} opacity-40 mt-1`}>{pending} pending review</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <p className={`${labelSize} text-muted-foreground font-medium`}>{initialHandoffs.length} Hand-offs</p>
      {initialHandoffs.slice(0, itemCount).map((item) => (
        <div key={item.id} className="flex items-center gap-2 py-0.5">
          <span className={`${itemSize} font-medium truncate flex-1`}>{item.project}</span>
          {showClient && <span className={`${subSize} opacity-40 shrink-0`}>{item.client}</span>}
          {showRating && item.rating && (
            <span className={`${subSize} opacity-50 flex items-center gap-0.5 shrink-0`}>
              <Star className="w-3 h-3 fill-warning text-warning" />{item.rating}
            </span>
          )}
          <span className={`${badgeSize} font-medium px-1.5 py-0.5 rounded-full ${statusConfig[item.status].className}`}>
            {statusConfig[item.status].label}
          </span>
        </div>
      ))}
    </div>
  );
};

/** Full expanded view */
export const ClientsExpanded = () => {
  const [handoffs, setHandoffs] = useState<Handoff[]>(initialHandoffs);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedHandoff = handoffs.find((h) => h.id === selectedId) || null;

  const handleUpdate = (updated: Handoff) => {
    setHandoffs((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  };

  return (
    <>
      <div className="space-y-3">
        {handoffs.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            className="w-full text-left p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">{item.project}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.client}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${statusConfig[item.status].className}`}
                >
                  {statusConfig[item.status].label}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                {item.rating ? (
                  <>
                    <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                    <span className="text-xs">{item.rating}.0</span>
                  </>
                ) : (
                  <span className="text-xs">No rating</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-xs">{item.messages.length} messages</span>
              </div>
              {item.status === "approved" && <Check className="w-3.5 h-3.5 text-success" />}
            </div>
          </button>
        ))}
      </div>

      <ClientDetailSheet
        handoff={selectedHandoff}
        open={!!selectedId}
        onOpenChange={(open) => !open && setSelectedId(null)}
        onUpdate={handleUpdate}
      />
    </>
  );
};
