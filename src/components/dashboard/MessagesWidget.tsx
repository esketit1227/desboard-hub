import { useState } from "react";
import { Send, Circle, Check, CheckCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  from: string;
  avatar: string;
  preview: string;
  fullMessage: string;
  time: string;
  read: boolean;
  project?: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    from: "Sarah Chen",
    avatar: "SC",
    preview: "Hey Jordan, the revised mockups look great! Just a few…",
    fullMessage: "Hey Jordan, the revised mockups look great! Just a few minor tweaks on the color palette — can we try a warmer tone for the CTA buttons? Also, the client loved the hero section layout. Let's schedule a call to finalize.",
    time: "10 min ago",
    read: false,
    project: "Brand Identity",
  },
  {
    id: "2",
    from: "Mike Torres",
    avatar: "MT",
    preview: "Updated the staging deploy — check the new nav flow…",
    fullMessage: "Updated the staging deploy — check the new nav flow when you get a chance. I also pushed the responsive fixes for tablet. The menu animation is smoother now. Let me know if you spot anything off.",
    time: "45 min ago",
    read: false,
    project: "Website V2",
  },
  {
    id: "3",
    from: "Lisa Park",
    avatar: "LP",
    preview: "Invoice #002 received. Payment processing within 5…",
    fullMessage: "Invoice #002 received. Payment processing within 5 business days. Thanks for the quick turnaround on the design system documentation — our team finds it very comprehensive.",
    time: "2h ago",
    read: true,
  },
  {
    id: "4",
    from: "Alex Kim",
    avatar: "AK",
    preview: "Can we revisit the onboarding screens? I have some…",
    fullMessage: "Can we revisit the onboarding screens? I have some new ideas after user testing. The current flow has a 40% drop-off at step 3. I think we can simplify it to 2 steps instead.",
    time: "5h ago",
    read: true,
    project: "Mobile App UI",
  },
  {
    id: "5",
    from: "Jordan Bell",
    avatar: "JB",
    preview: "Team standup notes: Sprint goals updated, design…",
    fullMessage: "Team standup notes: Sprint goals updated, design review moved to Thursday. New client onboarding starts next week. Please update your task estimates by EOD.",
    time: "Yesterday",
    read: true,
  },
];

/** Compact preview */
export const MessagesPreview = () => (
  <div>
    <p className="text-3xl font-bold tracking-tight">2</p>
    <p className="text-xs text-muted-foreground mt-1">Unread messages</p>
  </div>
);

/** Full expanded view */
export const MessagesExpanded = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selected, setSelected] = useState<Message | null>(null);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");

  const selectMessage = (msg: Message) => {
    setSelected(msg);
    if (!msg.read) {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)));
    }
  };

  const filtered = messages.filter(
    (m) =>
      m.from.toLowerCase().includes(search.toLowerCase()) ||
      m.preview.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-4 min-h-[400px]">
      {/* Message list */}
      <div className="w-[280px] shrink-0 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages…"
            className="rounded-xl pl-9"
          />
        </div>
        <div className="space-y-1 max-h-[350px] overflow-y-auto">
          {filtered.map((msg) => (
            <button
              key={msg.id}
              onClick={() => selectMessage(msg)}
              className={cn(
                "w-full text-left p-3 rounded-xl transition-colors",
                selected?.id === msg.id ? "bg-primary/10" : "hover:bg-secondary/50",
                !msg.read && "bg-secondary/30"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                  !msg.read ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  {msg.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn("text-sm", !msg.read ? "font-semibold" : "font-medium")}>{msg.from}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{msg.time}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground truncate pl-10">{msg.preview}</p>
              {msg.project && (
                <span className="text-[10px] text-primary/70 pl-10">{msg.project}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Message detail */}
      <div className="flex-1 border-l border-border/40 pl-4">
        {selected ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                {selected.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold">{selected.from}</p>
                <p className="text-[10px] text-muted-foreground">{selected.time}{selected.project && ` · ${selected.project}`}</p>
              </div>
              <div className="ml-auto">
                {selected.read ? (
                  <CheckCheck className="w-4 h-4 text-primary" />
                ) : (
                  <Check className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="flex-1 p-4 rounded-xl bg-secondary/20 mb-4">
              <p className="text-sm leading-relaxed">{selected.fullMessage}</p>
            </div>
            <div className="flex gap-2">
              <Input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type a reply…"
                className="rounded-xl flex-1"
                onKeyDown={(e) => e.key === "Enter" && reply.trim() && setReply("")}
              />
              <button
                onClick={() => reply.trim() && setReply("")}
                className="rounded-xl bg-primary text-primary-foreground p-2.5 hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Select a message to read
          </div>
        )}
      </div>
    </div>
  );
};
