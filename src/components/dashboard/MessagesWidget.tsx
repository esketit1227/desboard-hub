import { useState } from "react";
import { Send, Circle, Check, CheckCheck, Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getSizeTier } from "./WidgetCard";

interface Message {
  id: string; from: string; avatar: string; preview: string;
  fullMessage: string; time: string; read: boolean; project?: string;
}

const initialMessages: Message[] = [
  { id: "1", from: "Sarah Chen", avatar: "SC", preview: "Hey Jordan, the revised mockups look great! Just a few…", fullMessage: "Hey Jordan, the revised mockups look great! Just a few minor tweaks on the color palette — can we try a warmer tone for the CTA buttons?", time: "10 min ago", read: false, project: "Brand Identity" },
  { id: "2", from: "Mike Torres", avatar: "MT", preview: "Updated the staging deploy — check the new nav flow…", fullMessage: "Updated the staging deploy — check the new nav flow when you get a chance. I also pushed the responsive fixes for tablet.", time: "45 min ago", read: false, project: "Website V2" },
  { id: "3", from: "Lisa Park", avatar: "LP", preview: "Invoice #002 received. Payment processing within 5…", fullMessage: "Invoice #002 received. Payment processing within 5 business days.", time: "2h ago", read: true },
  { id: "4", from: "Alex Kim", avatar: "AK", preview: "Can we revisit the onboarding screens? I have some…", fullMessage: "Can we revisit the onboarding screens? I have some new ideas after user testing.", time: "5h ago", read: true, project: "Mobile App UI" },
  { id: "5", from: "Jordan Bell", avatar: "JB", preview: "Team standup notes: Sprint goals updated, design…", fullMessage: "Team standup notes: Sprint goals updated, design review moved to Thursday.", time: "Yesterday", read: true },
];

export const MessagesPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const tier = getSizeTier(pixelSize);
  const unread = initialMessages.filter(m => !m.read);

  if (tier === "compact") return null;

  if (tier === "standard") {
    return (
      <div className="flex flex-col h-full gap-1.5 mt-1">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight leading-none">{unread.length}</p>
          <p className="text-[10px] text-muted-foreground">unread</p>
        </div>
        <div className="flex-1 space-y-1.5 overflow-hidden">
          {initialMessages.slice(0, 3).map((msg) => (
            <div key={msg.id} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-foreground/10 flex items-center justify-center text-[7px] font-bold shrink-0">{msg.avatar}</div>
              <span className="text-[10px] truncate flex-1">{msg.preview}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-2 mt-1">
      <div className="flex items-start justify-between">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight leading-none">{unread.length}</p>
          <p className="text-xs text-muted-foreground">unread</p>
        </div>
        <span className="text-[10px] text-muted-foreground">{initialMessages.length} total</span>
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        {initialMessages.slice(0, 4).map((msg) => (
          <div key={msg.id} className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">{msg.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={cn("text-[10px] font-medium", !msg.read && "font-semibold")}>{msg.from}</span>
                <span className="text-[8px] text-muted-foreground">{msg.time}</span>
              </div>
              <p className="text-[9px] text-muted-foreground truncate">{msg.preview}</p>
            </div>
            {!msg.read && <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 shrink-0 mt-1.5" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export const MessagesExpanded = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [selected, setSelected] = useState<Message | null>(null);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");

  const markRead = (id: string) => setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));

  const filtered = messages.filter(m =>
    m.from.toLowerCase().includes(search.toLowerCase()) || m.preview.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Back</button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-bold">{selected.avatar}</div>
          <div>
            <p className="font-medium">{selected.from}</p>
            <p className="text-xs text-muted-foreground">{selected.time}{selected.project && ` · ${selected.project}`}</p>
          </div>
        </div>
        <div className="bg-secondary/30 rounded-xl p-4"><p className="text-sm leading-relaxed">{selected.fullMessage}</p></div>
        <div className="flex gap-2">
          <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply…" className="rounded-xl flex-1" />
          <button className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages…" className="pl-9 rounded-xl" />
      </div>
      <div className="space-y-1">
        {filtered.map((msg) => (
          <button key={msg.id} onClick={() => { setSelected(msg); markRead(msg.id); }} className={cn("w-full text-left flex items-start gap-3 p-3 rounded-xl transition-colors", msg.read ? "hover:bg-secondary/30" : "bg-secondary/20 hover:bg-secondary/40")}>
            <div className="w-9 h-9 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold shrink-0">{msg.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={cn("text-sm", !msg.read && "font-semibold")}>{msg.from}</span>
                <span className="text-[10px] text-muted-foreground">{msg.time}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{msg.preview}</p>
              {msg.project && <span className="text-[10px] text-muted-foreground/70">{msg.project}</span>}
            </div>
            {!msg.read && <div className="w-2 h-2 rounded-full bg-foreground/40 shrink-0 mt-2" />}
          </button>
        ))}
      </div>
    </div>
  );
};
