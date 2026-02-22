import { useState, useMemo } from "react";
import {
  Users, Briefcase, TrendingUp, FileText, DollarSign, UserPlus,
  ChevronRight, Star, Clock, CheckCircle2, Circle, ArrowUpRight,
  Building2, Phone, Mail, MapPin, Filter, Plus, MoreHorizontal,
  Pencil, Trash2, Search, ArrowUpDown, LayoutGrid, List,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

// --- Types ---
type FreelancerStatus = "available" | "on-project" | "unavailable";
type ContactType = "client" | "lead";
type ProposalStatus = "sent" | "draft" | "accepted" | "rejected";

interface Freelancer { id: string; name: string; role: string; rate: string; rating: number; status: FreelancerStatus; avatar: string; }
interface Deal { id: string; name: string; value: string; stage: string; probability: number; contact: string; }
interface Proposal { id: string; title: string; status: ProposalStatus; value: string; date: string; scope: string; }
interface Contact { id: string; name: string; company: string; email: string; phone: string; type: ContactType; }

// --- Initial Data ---
const initialFreelancers: Freelancer[] = [
  { id: "1", name: "Ava Chen", role: "UI Designer", rate: "$85/hr", rating: 4.9, status: "available", avatar: "AC" },
  { id: "2", name: "Marcus Bell", role: "Motion Designer", rate: "$95/hr", rating: 4.7, status: "on-project", avatar: "MB" },
  { id: "3", name: "Lina Park", role: "Brand Strategist", rate: "$120/hr", rating: 5.0, status: "available", avatar: "LP" },
  { id: "4", name: "Tom Rivera", role: "3D Artist", rate: "$110/hr", rating: 4.6, status: "unavailable", avatar: "TR" },
  { id: "5", name: "Sara Kim", role: "Copywriter", rate: "$70/hr", rating: 4.8, status: "available", avatar: "SK" },
];

const initialDeals: Deal[] = [
  { id: "1", name: "Flux Labs Rebrand", value: "$24,000", stage: "Proposal Sent", probability: 75, contact: "Jamie Flux" },
  { id: "2", name: "Mono Studio Website", value: "$18,500", stage: "Negotiation", probability: 60, contact: "Alex Mono" },
  { id: "3", name: "Nextwave App Design", value: "$32,000", stage: "Qualified", probability: 40, contact: "Sam Next" },
  { id: "4", name: "Aura Brand System", value: "$8,000", stage: "Closed Won", probability: 100, contact: "Dana Aura" },
];

const initialProposals: Proposal[] = [
  { id: "1", title: "Flux Labs Brand Identity", status: "sent", value: "$24,000", date: "Feb 15", scope: "Logo, Brand Guide, Collateral" },
  { id: "2", title: "Mono Website Redesign", status: "draft", value: "$18,500", date: "Feb 18", scope: "UX, UI, Development" },
  { id: "3", title: "Nextwave Mobile App", status: "accepted", value: "$32,000", date: "Feb 10", scope: "Research, Wireframes, UI, Handoff" },
];

const initialContacts: Contact[] = [
  { id: "1", name: "Jamie Flux", company: "Flux Labs", email: "jamie@flux.co", phone: "+1 555-0101", type: "client" },
  { id: "2", name: "Alex Mono", company: "Mono Studio", email: "alex@mono.io", phone: "+1 555-0102", type: "lead" },
  { id: "3", name: "Sam Next", company: "Nextwave", email: "sam@nextwave.com", phone: "+1 555-0103", type: "lead" },
  { id: "4", name: "Dana Aura", company: "Aura Inc", email: "dana@aura.co", phone: "+1 555-0104", type: "client" },
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

/* ─── Preview — business hub summary ─── */
export const StudioPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const available = initialFreelancers.filter(f => f.status === "available").length;
  const pipelineValue = "$82.5k";

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground font-medium">Pipeline</p>
          <p className="text-2xl font-bold tracking-tight leading-none mt-0.5">{pipelineValue}</p>
        </div>
        <Briefcase className="w-5 h-5 text-muted-foreground/40" />
      </div>
      <div className="flex items-center gap-3 mt-auto">
        <div className="flex -space-x-1">
          {initialFreelancers.slice(0, 3).map((f, i) => (
            <div key={i} className="w-5 h-5 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[7px] font-bold">{f.avatar}</div>
          ))}
        </div>
        <span className="text-[9px] text-muted-foreground">{available} available</span>
        <span className="text-[9px] text-muted-foreground ml-auto">{initialDeals.length} deals</span>
      </div>
    </div>
  );
};

/* ─── Helpers ─── */
const genId = () => Math.random().toString(36).slice(2, 9);
const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const DeleteConfirmDialog = ({ open, onOpenChange, onConfirm, label }: { open: boolean; onOpenChange: (o: boolean) => void; onConfirm: () => void; label: string }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="glass-strong rounded-3xl border-border/30 max-w-sm">
      <DialogHeader><DialogTitle>Delete {label}</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
      <DialogFooter className="gap-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
        <Button variant="destructive" onClick={onConfirm} className="rounded-xl">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const FreelancerDialog = ({ open, onOpenChange, freelancer, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; freelancer: Freelancer | null; onSave: (f: Freelancer) => void }) => {
  const [form, setForm] = useState<Freelancer>(freelancer ?? { id: "", name: "", role: "", rate: "", rating: 5.0, status: "available", avatar: "" });
  const isEdit = !!freelancer;
  const handleSave = () => { onSave({ ...form, id: form.id || genId(), avatar: form.avatar || getInitials(form.name) }); onOpenChange(false); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-3xl border-border/30 max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? "Edit" : "Add"} Freelancer</DialogTitle><DialogDescription>{isEdit ? "Update freelancer details." : "Add a new freelancer to your pool."}</DialogDescription></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl mt-1" /></div>
            <div><Label className="text-xs">Role</Label><Input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="rounded-xl mt-1" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">Rate</Label><Input value={form.rate} onChange={e => setForm(p => ({ ...p, rate: e.target.value }))} placeholder="$85/hr" className="rounded-xl mt-1" /></div>
            <div><Label className="text-xs">Rating</Label><Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm(p => ({ ...p, rating: parseFloat(e.target.value) || 0 }))} className="rounded-xl mt-1" /></div>
            <div><Label className="text-xs">Status</Label><Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as FreelancerStatus }))}><SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="available">Available</SelectItem><SelectItem value="on-project">On Project</SelectItem><SelectItem value="unavailable">Unavailable</SelectItem></SelectContent></Select></div>
          </div>
        </div>
        <DialogFooter><Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button><Button onClick={handleSave} className="rounded-xl" disabled={!form.name}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DealDialog = ({ open, onOpenChange, deal, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; deal: Deal | null; onSave: (d: Deal) => void }) => {
  const [form, setForm] = useState<Deal>(deal ?? { id: "", name: "", value: "", stage: "Qualified", probability: 50, contact: "" });
  const isEdit = !!deal;
  const handleSave = () => { onSave({ ...form, id: form.id || genId() }); onOpenChange(false); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-3xl border-border/30 max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? "Edit" : "Add"} Deal</DialogTitle><DialogDescription>{isEdit ? "Update deal details." : "Add a new deal to your pipeline."}</DialogDescription></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3"><div><Label className="text-xs">Deal Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl mt-1" /></div><div><Label className="text-xs">Value</Label><Input value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="$10,000" className="rounded-xl mt-1" /></div></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">Stage</Label><Select value={form.stage} onValueChange={v => setForm(p => ({ ...p, stage: v }))}><SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Qualified">Qualified</SelectItem><SelectItem value="Proposal Sent">Proposal Sent</SelectItem><SelectItem value="Negotiation">Negotiation</SelectItem><SelectItem value="Closed Won">Closed Won</SelectItem><SelectItem value="Closed Lost">Closed Lost</SelectItem></SelectContent></Select></div>
            <div><Label className="text-xs">Probability</Label><Input type="number" min="0" max="100" value={form.probability} onChange={e => setForm(p => ({ ...p, probability: parseInt(e.target.value) || 0 }))} className="rounded-xl mt-1" /></div>
            <div><Label className="text-xs">Contact</Label><Input value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} className="rounded-xl mt-1" /></div>
          </div>
        </div>
        <DialogFooter><Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button><Button onClick={handleSave} className="rounded-xl" disabled={!form.name}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ProposalDialog = ({ open, onOpenChange, proposal, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; proposal: Proposal | null; onSave: (p: Proposal) => void }) => {
  const [form, setForm] = useState<Proposal>(proposal ?? { id: "", title: "", status: "draft", value: "", date: "", scope: "" });
  const isEdit = !!proposal;
  const handleSave = () => { onSave({ ...form, id: form.id || genId() }); onOpenChange(false); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-3xl border-border/30 max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? "Edit" : "Add"} Proposal</DialogTitle><DialogDescription>{isEdit ? "Update proposal details." : "Create a new proposal."}</DialogDescription></DialogHeader>
        <div className="grid gap-3">
          <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="rounded-xl mt-1" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">Value</Label><Input value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="$10,000" className="rounded-xl mt-1" /></div>
            <div><Label className="text-xs">Date</Label><Input value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} placeholder="Feb 20" className="rounded-xl mt-1" /></div>
            <div><Label className="text-xs">Status</Label><Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as ProposalStatus }))}><SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="sent">Sent</SelectItem><SelectItem value="accepted">Accepted</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select></div>
          </div>
          <div><Label className="text-xs">Scope</Label><Input value={form.scope} onChange={e => setForm(p => ({ ...p, scope: e.target.value }))} placeholder="UX, UI, Development" className="rounded-xl mt-1" /></div>
        </div>
        <DialogFooter><Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button><Button onClick={handleSave} className="rounded-xl" disabled={!form.title}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ContactDialog = ({ open, onOpenChange, contact, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; contact: Contact | null; onSave: (c: Contact) => void }) => {
  const [form, setForm] = useState<Contact>(contact ?? { id: "", name: "", company: "", email: "", phone: "", type: "lead" });
  const isEdit = !!contact;
  const handleSave = () => { onSave({ ...form, id: form.id || genId() }); onOpenChange(false); };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-3xl border-border/30 max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? "Edit" : "Add"} Contact</DialogTitle><DialogDescription>{isEdit ? "Update contact details." : "Add a new contact."}</DialogDescription></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3"><div><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl mt-1" /></div><div><Label className="text-xs">Company</Label><Input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} className="rounded-xl mt-1" /></div></div>
          <div className="grid grid-cols-2 gap-3"><div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="rounded-xl mt-1" /></div><div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="rounded-xl mt-1" /></div></div>
          <div><Label className="text-xs">Type</Label><Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as ContactType }))}><SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="client">Client</SelectItem><SelectItem value="lead">Lead</SelectItem></SelectContent></Select></div>
        </div>
        <DialogFooter><Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button><Button onClick={handleSave} className="rounded-xl" disabled={!form.name}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Pipeline Kanban Components ─── */
const PIPELINE_STAGES = ["Qualified", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"];

const DraggableDealCard = ({ deal, onEdit, onDelete }: { deal: Deal; onEdit: () => void; onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });
  const style: React.CSSProperties = { transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined, transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="p-3 rounded-xl bg-background/60 border border-border/30 group cursor-default">
      <div className="flex items-start justify-between gap-1">
        <button {...attributes} {...listeners} className="p-0.5 rounded cursor-grab active:cursor-grabbing touch-none"><GripVertical className="w-3 h-3 text-muted-foreground/40" /></button>
        <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{deal.name}</p><p className="text-[10px] text-muted-foreground">{deal.contact}</p></div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1 rounded-md hover:bg-secondary"><Pencil className="w-3 h-3 text-muted-foreground" /></button>
          <button onClick={onDelete} className="p-1 rounded-md hover:bg-destructive/10"><Trash2 className="w-3 h-3 text-destructive/60" /></button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2"><span className="text-xs font-semibold">{deal.value}</span><span className="text-[10px] text-muted-foreground">{deal.probability}%</span></div>
    </div>
  );
};

const StageColumn = ({ stage, deals, onEditDeal, onDeleteDeal }: { stage: string; deals: Deal[]; onEditDeal: (d: Deal) => void; onDeleteDeal: (id: string) => void }) => {
  const { setNodeRef } = useDroppable({ id: stage });
  return (
    <div ref={setNodeRef} className="flex-1 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${stageColors[stage] || "bg-muted text-muted-foreground"}`}>{stage}</span><span className="text-[10px] text-muted-foreground">{deals.length}</span></div>
      <div className="space-y-2 min-h-[60px]">{deals.map(d => <DraggableDealCard key={d.id} deal={d} onEdit={() => onEditDeal(d)} onDelete={() => onDeleteDeal(d.id)} />)}</div>
    </div>
  );
};

/* ─── Expanded View ─── */
export const StudioExpanded = () => {
  const [tab, setTab] = useState<Tab>("freelancers");
  const [freelancers, setFreelancers] = useState(initialFreelancers);
  const [deals, setDeals] = useState(initialDeals);
  const [proposals, setProposals] = useState(initialProposals);
  const [contacts, setContacts] = useState(initialContacts);
  const [editFreelancer, setEditFreelancer] = useState<Freelancer | null>(null);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [editProposal, setEditProposal] = useState<Proposal | null>(null);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [showFreelancerDialog, setShowFreelancerDialog] = useState(false);
  const [showDealDialog, setShowDealDialog] = useState(false);
  const [showProposalDialog, setShowProposalDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const dealsByStage = useMemo(() => {
    const groups: Record<string, Deal[]> = {};
    PIPELINE_STAGES.forEach(s => groups[s] = []);
    deals.forEach(d => { if (groups[d.stage]) groups[d.stage].push(d); });
    return groups;
  }, [deals]);

  const handleDragStart = (e: DragStartEvent) => { const d = deals.find(d => d.id === e.active.id); if (d) setDraggedDeal(d); };
  const handleDragEnd = (e: DragEndEvent) => {
    setDraggedDeal(null);
    const { active, over } = e;
    if (!over) return;
    const dealId = active.id as string;
    const targetStage = PIPELINE_STAGES.includes(over.id as string) ? (over.id as string) : deals.find(d => d.id === over.id)?.stage;
    if (targetStage) setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: targetStage } : d));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "freelancer") setFreelancers(p => p.filter(f => f.id !== deleteTarget.id));
    else if (deleteTarget.type === "deal") setDeals(p => p.filter(d => d.id !== deleteTarget.id));
    else if (deleteTarget.type === "proposal") setProposals(p => p.filter(pr => pr.id !== deleteTarget.id));
    else if (deleteTarget.type === "contact") setContacts(p => p.filter(c => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "freelancers", label: "Team", icon: <Users className="w-3.5 h-3.5" /> },
    { id: "pipeline", label: "Pipeline", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: "proposals", label: "Proposals", icon: <FileText className="w-3.5 h-3.5" /> },
    { id: "budget", label: "Budget", icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: "contacts", label: "Contacts", icon: <Building2 className="w-3.5 h-3.5" /> },
  ];

  const proposalStatusColors: Record<string, string> = { draft: "bg-muted text-muted-foreground", sent: "bg-primary/10 text-primary", accepted: "bg-success/10 text-success", rejected: "bg-destructive/10 text-destructive" };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 bg-muted/30 rounded-xl p-0.5">{tabs.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", tab === t.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>{t.icon}{t.label}</button>))}</div>
        <div className="flex items-center gap-1.5 flex-1 min-w-[140px] bg-muted/30 border border-border/40 rounded-xl px-3 py-1.5 ml-auto max-w-[240px]"><Search className="w-3.5 h-3.5 text-muted-foreground" /><input type="text" placeholder="Search..." className="bg-transparent text-xs outline-none flex-1" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
      </div>

      {tab === "freelancers" && (
        <div className="space-y-3">
          <div className="flex justify-end"><Button size="sm" className="rounded-xl gap-1 text-xs" onClick={() => { setEditFreelancer(null); setShowFreelancerDialog(true); }}><UserPlus className="w-3.5 h-3.5" />Add</Button></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {freelancers.filter(f => !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.role.toLowerCase().includes(searchQuery.toLowerCase())).map(f => (
              <div key={f.id} className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/40 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sm font-bold relative"><span>{f.avatar}</span><div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${statusColors[f.status]}`} /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold">{f.name}</p><p className="text-xs text-muted-foreground">{f.role}</p></div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100"><button onClick={() => { setEditFreelancer(f); setShowFreelancerDialog(true); }} className="p-1 rounded-md hover:bg-secondary"><Pencil className="w-3 h-3 text-muted-foreground" /></button><button onClick={() => setDeleteTarget({ type: "freelancer", id: f.id })} className="p-1 rounded-md hover:bg-destructive/10"><Trash2 className="w-3 h-3 text-destructive/60" /></button></div>
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground"><span className="font-medium text-foreground">{f.rate}</span><span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-warning text-warning" />{f.rating}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "pipeline" && (
        <div className="space-y-3">
          <div className="flex justify-end"><Button size="sm" className="rounded-xl gap-1 text-xs" onClick={() => { setEditDeal(null); setShowDealDialog(true); }}><Plus className="w-3.5 h-3.5" />Add Deal</Button></div>
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-3 overflow-x-auto pb-2">{PIPELINE_STAGES.map(stage => <StageColumn key={stage} stage={stage} deals={dealsByStage[stage] || []} onEditDeal={d => { setEditDeal(d); setShowDealDialog(true); }} onDeleteDeal={id => setDeleteTarget({ type: "deal", id })} />)}</div>
            <DragOverlay>{draggedDeal && <div className="p-3 rounded-xl bg-background border border-border shadow-lg"><p className="text-xs font-medium">{draggedDeal.name}</p><p className="text-[10px] text-muted-foreground">{draggedDeal.value}</p></div>}</DragOverlay>
          </DndContext>
        </div>
      )}

      {tab === "proposals" && (
        <div className="space-y-3">
          <div className="flex justify-end"><Button size="sm" className="rounded-xl gap-1 text-xs" onClick={() => { setEditProposal(null); setShowProposalDialog(true); }}><Plus className="w-3.5 h-3.5" />New Proposal</Button></div>
          {proposals.filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
            <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/40 transition-colors group">
              <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><p className="text-sm font-semibold">{p.title}</p><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${proposalStatusColors[p.status]}`}>{p.status}</span></div><p className="text-xs text-muted-foreground mt-0.5">{p.scope} · {p.date}</p></div>
              <span className="text-sm font-bold">{p.value}</span>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100"><button onClick={() => { setEditProposal(p); setShowProposalDialog(true); }} className="p-1.5 rounded-lg hover:bg-secondary"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button><button onClick={() => setDeleteTarget({ type: "proposal", id: p.id })} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive/60" /></button></div>
            </div>
          ))}
        </div>
      )}

      {tab === "budget" && (
        <div className="space-y-4">
          {budgets.map(b => {
            const pct = Math.round((b.spent / b.budget) * 100);
            const isOver = pct > 85;
            return (
              <div key={b.project} className="p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center justify-between mb-2"><p className="text-sm font-semibold">{b.project}</p><span className={cn("text-xs font-medium", isOver ? "text-destructive" : "text-muted-foreground")}>{pct}% used</span></div>
                <Progress value={pct} className="h-2 mb-2" />
                <div className="flex gap-4 text-xs text-muted-foreground"><span>Budget: <span className="font-medium text-foreground">${b.budget.toLocaleString()}</span></span><span>Spent: <span className="font-medium text-foreground">${b.spent.toLocaleString()}</span></span><span>Left: <span className={cn("font-medium", isOver ? "text-destructive" : "text-success")}>${b.remaining.toLocaleString()}</span></span></div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "contacts" && (
        <div className="space-y-3">
          <div className="flex justify-end"><Button size="sm" className="rounded-xl gap-1 text-xs" onClick={() => { setEditContact(null); setShowContactDialog(true); }}><UserPlus className="w-3.5 h-3.5" />Add Contact</Button></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contacts.filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.company.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
              <div key={c.id} className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/40 transition-colors group">
                <div className="flex items-start justify-between">
                  <div><p className="text-sm font-semibold">{c.name}</p><p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" />{c.company}</p></div>
                  <div className="flex items-center gap-1"><Badge variant="outline" className={cn("text-[10px]", c.type === "client" ? "border-success/30 text-success" : "border-primary/30 text-primary")}>{c.type}</Badge><div className="flex gap-0.5 opacity-0 group-hover:opacity-100 ml-1"><button onClick={() => { setEditContact(c); setShowContactDialog(true); }} className="p-1 rounded-md hover:bg-secondary"><Pencil className="w-3 h-3 text-muted-foreground" /></button><button onClick={() => setDeleteTarget({ type: "contact", id: c.id })} className="p-1 rounded-md hover:bg-destructive/10"><Trash2 className="w-3 h-3 text-destructive/60" /></button></div></div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span><span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <FreelancerDialog open={showFreelancerDialog} onOpenChange={setShowFreelancerDialog} freelancer={editFreelancer} onSave={f => { if (editFreelancer) setFreelancers(p => p.map(x => x.id === f.id ? f : x)); else setFreelancers(p => [...p, f]); }} />
      <DealDialog open={showDealDialog} onOpenChange={setShowDealDialog} deal={editDeal} onSave={d => { if (editDeal) setDeals(p => p.map(x => x.id === d.id ? d : x)); else setDeals(p => [...p, d]); }} />
      <ProposalDialog open={showProposalDialog} onOpenChange={setShowProposalDialog} proposal={editProposal} onSave={p => { if (editProposal) setProposals(prev => prev.map(x => x.id === p.id ? p : x)); else setProposals(prev => [...prev, p]); }} />
      <ContactDialog open={showContactDialog} onOpenChange={setShowContactDialog} contact={editContact} onSave={c => { if (editContact) setContacts(p => p.map(x => x.id === c.id ? c : x)); else setContacts(p => [...p, c]); }} />
      <DeleteConfirmDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)} onConfirm={handleDelete} label={deleteTarget?.type || ""} />
    </div>
  );
};
