import { useState } from "react";
import {
  Users, Briefcase, TrendingUp, FileText, DollarSign, UserPlus,
  ChevronRight, Star, Clock, CheckCircle2, Circle, ArrowUpRight,
  Building2, Phone, Mail, MapPin, Filter, Plus, MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

/* ─── Preview ─── */
export const StudioPreview = () => (
  <div>
    <p className="text-3xl font-semibold tracking-tight">Studio</p>
    <p className="text-xs text-muted-foreground mt-1">Business Hub</p>
    <div className="grid grid-cols-3 gap-2 mt-4">
      <div className="rounded-2xl bg-muted/40 p-2.5 text-center">
        <p className="text-lg font-semibold">14</p>
        <p className="text-[10px] text-muted-foreground">Freelancers</p>
      </div>
      <div className="rounded-2xl bg-muted/40 p-2.5 text-center">
        <p className="text-lg font-semibold">$82k</p>
        <p className="text-[10px] text-muted-foreground">Pipeline</p>
      </div>
      <div className="rounded-2xl bg-muted/40 p-2.5 text-center">
        <p className="text-lg font-semibold">6</p>
        <p className="text-[10px] text-muted-foreground">Active Deals</p>
      </div>
    </div>
  </div>
);

/* ─── Mock Data ─── */
const freelancers = [
  { id: "1", name: "Ava Chen", role: "UI Designer", rate: "$85/hr", rating: 4.9, status: "available" as const, avatar: "AC" },
  { id: "2", name: "Marcus Bell", role: "Motion Designer", rate: "$95/hr", rating: 4.7, status: "on-project" as const, avatar: "MB" },
  { id: "3", name: "Lina Park", role: "Brand Strategist", rate: "$120/hr", rating: 5.0, status: "available" as const, avatar: "LP" },
  { id: "4", name: "Tom Rivera", role: "3D Artist", rate: "$110/hr", rating: 4.6, status: "unavailable" as const, avatar: "TR" },
  { id: "5", name: "Sara Kim", role: "Copywriter", rate: "$70/hr", rating: 4.8, status: "available" as const, avatar: "SK" },
];

const deals = [
  { id: "1", name: "Flux Labs Rebrand", value: "$24,000", stage: "Proposal Sent", probability: 75, contact: "Jamie Flux" },
  { id: "2", name: "Mono Studio Website", value: "$18,500", stage: "Negotiation", probability: 60, contact: "Alex Mono" },
  { id: "3", name: "Nextwave App Design", value: "$32,000", stage: "Qualified", probability: 40, contact: "Sam Next" },
  { id: "4", name: "Aura Brand System", value: "$8,000", stage: "Closed Won", probability: 100, contact: "Dana Aura" },
];

const proposals = [
  { id: "1", title: "Flux Labs Brand Identity", status: "sent" as const, value: "$24,000", date: "Feb 15", scope: "Logo, Brand Guide, Collateral" },
  { id: "2", title: "Mono Website Redesign", status: "draft" as const, value: "$18,500", date: "Feb 18", scope: "UX, UI, Development" },
  { id: "3", title: "Nextwave Mobile App", status: "accepted" as const, value: "$32,000", date: "Feb 10", scope: "Research, Wireframes, UI, Handoff" },
];

const contacts = [
  { id: "1", name: "Jamie Flux", company: "Flux Labs", email: "jamie@flux.co", phone: "+1 555-0101", type: "client" as const },
  { id: "2", name: "Alex Mono", company: "Mono Studio", email: "alex@mono.io", phone: "+1 555-0102", type: "lead" as const },
  { id: "3", name: "Sam Next", company: "Nextwave", email: "sam@nextwave.com", phone: "+1 555-0103", type: "lead" as const },
  { id: "4", name: "Dana Aura", company: "Aura Inc", email: "dana@aura.co", phone: "+1 555-0104", type: "client" as const },
];

const budgets = [
  { project: "Flux Labs Rebrand", budget: 24000, spent: 16800, remaining: 7200 },
  { project: "Mono Website", budget: 18500, spent: 4200, remaining: 14300 },
  { project: "Nextwave App", budget: 32000, spent: 28100, remaining: 3900 },
];

const stageColors: Record<string, string> = {
  "Qualified": "bg-muted text-muted-foreground",
  "Proposal Sent": "bg-primary/10 text-primary",
  "Negotiation": "bg-warning/10 text-warning",
  "Closed Won": "bg-success/10 text-success",
  "Closed Lost": "bg-destructive/10 text-destructive",
};

const statusColors: Record<string, string> = {
  available: "bg-success",
  "on-project": "bg-warning",
  unavailable: "bg-muted-foreground/40",
};

type Tab = "freelancers" | "pipeline" | "proposals" | "budget" | "contacts";

/* ─── Expanded View ─── */
export const StudioExpanded = () => {
  const [activeTab, setActiveTab] = useState<Tab>("freelancers");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "freelancers", label: "Freelancers", icon: <Users className="w-4 h-4" /> },
    { id: "pipeline", label: "Pipeline", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "proposals", label: "Proposals", icon: <FileText className="w-4 h-4" /> },
    { id: "budget", label: "Budget", icon: <DollarSign className="w-4 h-4" /> },
    { id: "contacts", label: "Contacts", icon: <UserPlus className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pipeline Value", value: "$82.5k" },
          { label: "Active Deals", value: "6" },
          { label: "Freelancers", value: "14" },
          { label: "Win Rate", value: "68%" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-muted/30 p-3.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{s.label}</p>
            <p className="text-xl font-semibold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "freelancers" && (
        <div className="space-y-2">
          {freelancers.map(f => (
            <div key={f.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center text-xs font-semibold shrink-0">
                {f.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  <span className={cn("w-2 h-2 rounded-full shrink-0", statusColors[f.status])} />
                </div>
                <p className="text-xs text-muted-foreground">{f.role}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium">{f.rate}</p>
                <div className="flex items-center gap-1 justify-end">
                  <Star className="w-3 h-3 fill-warning text-warning" />
                  <span className="text-[11px] text-muted-foreground">{f.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "pipeline" && (
        <div className="space-y-2">
          {deals.map(d => (
            <div key={d.id} className="p-4 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.contact}</p>
                </div>
                <p className="text-sm font-semibold">{d.value}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", stageColors[d.stage])}>
                  {d.stage}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${d.probability}%` }} />
                  </div>
                  <span className="text-[11px] text-muted-foreground">{d.probability}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "proposals" && (
        <div className="space-y-2">
          {proposals.map(p => {
            const statusStyle = {
              sent: "bg-primary/10 text-primary",
              draft: "bg-muted text-muted-foreground",
              accepted: "bg-success/10 text-success",
              rejected: "bg-destructive/10 text-destructive",
            };
            return (
              <div key={p.id} className="p-4 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.scope}</p>
                  </div>
                  <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full capitalize", statusStyle[p.status])}>
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{p.date}</span>
                  <span className="font-medium text-foreground">{p.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "budget" && (
        <div className="space-y-3">
          {budgets.map(b => (
            <div key={b.project} className="p-4 rounded-2xl bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{b.project}</p>
                <p className="text-xs text-muted-foreground">
                  ${b.spent.toLocaleString()} / ${b.budget.toLocaleString()}
                </p>
              </div>
              <Progress value={(b.spent / b.budget) * 100} className="h-2 rounded-full" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-muted-foreground">
                  {Math.round((b.spent / b.budget) * 100)}% used
                </span>
                <span className={cn(
                  "text-[11px] font-medium",
                  b.remaining < 5000 ? "text-destructive" : "text-success"
                )}>
                  ${b.remaining.toLocaleString()} remaining
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "contacts" && (
        <div className="space-y-2">
          {contacts.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize",
                    c.type === "client" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                  )}>
                    {c.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{c.company}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button className="w-8 h-8 rounded-xl hover:bg-muted/50 flex items-center justify-center transition-colors">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button className="w-8 h-8 rounded-xl hover:bg-muted/50 flex items-center justify-center transition-colors">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
