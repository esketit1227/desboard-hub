import { Star, MessageSquare, Check } from "lucide-react";

const handoffs = [
  { client: "Flux Labs", project: "Brand Identity", status: "approved", rating: 5, messages: 3 },
  { client: "Mono Studio", project: "Website V2", status: "pending", rating: null, messages: 1 },
  { client: "Nextwave", project: "App Screens", status: "changes", rating: 3, messages: 7 },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  approved: { label: "Approved", className: "bg-success/10 text-success" },
  pending: { label: "Pending Review", className: "bg-warning/10 text-warning" },
  changes: { label: "Changes Req.", className: "bg-destructive/10 text-destructive" },
};

const ClientPortalWidget = () => {
  return (
    <div className="space-y-3">
      {handoffs.map((item) => (
        <div key={item.project} className="p-3 rounded-xl bg-secondary/50 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium">{item.project}</p>
              <p className="text-xs text-muted-foreground">{item.client}</p>
            </div>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig[item.status].className}`}
            >
              {statusConfig[item.status].label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-1">
              {item.rating ? (
                <>
                  <Star className="w-3 h-3 fill-warning text-warning" />
                  <span className="text-[11px]">{item.rating}.0</span>
                </>
              ) : (
                <span className="text-[11px]">No rating</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span className="text-[11px]">{item.messages}</span>
            </div>
            {item.status === "approved" && <Check className="w-3 h-3 text-success" />}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientPortalWidget;
