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
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

/* ─── Types ─── */
type FreelancerStatus = "available" | "on-project" | "unavailable";
type ContactType = "client" | "lead";
type ProposalStatus = "sent" | "draft" | "accepted" | "rejected";

interface Freelancer { id: string; name: string; role: string; rate: string; rating: number; status: FreelancerStatus; avatar: string; }
interface Deal { id: string; name: string; value: string; stage: string; probability: number; contact: string; }
interface Proposal { id: string; title: string; status: ProposalStatus; value: string; date: string; scope: string; }
interface Contact { id: string; name: string; company: string; email: string; phone: string; type: ContactType; }

/* ─── Initial Data ─── */
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

/* ─── Preview ─── */
export const StudioPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const h = pixelSize?.height ?? 140;
  const w = pixelSize?.width ?? 300;

  const titleSize = h > 300 ? "text-4xl" : h > 200 ? "text-3xl" : "text-2xl";
  const labelSize = h > 300 ? "text-sm" : h > 200 ? "text-xs" : "text-[11px]";
  const itemSize = w > 400 ? "text-xs" : "text-[11px]";
  const subSize = w > 400 ? "text-xs" : "text-[10px]";

  const showTeam = h > 180;
  const showPipeline = h > 300;
  const itemCount = h > 340 ? 4 : h > 240 ? 3 : 2;

  if (!showTeam) {
    const available = initialFreelancers.filter(f => f.status === "available").length;
    return (
      <div>
        <p className={`${titleSize} font-semibold tracking-tight`}>Studio</p>
        <p className={`${labelSize} text-muted-foreground mt-1`}>Business Hub</p>
        {h > 160 && (
          <p className={`${subSize} opacity-40 mt-1`}>{available} available · {initialDeals.length} deals</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className={`${labelSize} text-muted-foreground font-medium`}>Team · {initialFreelancers.length} members</p>
      {initialFreelancers.slice(0, itemCount).map((f) => (
        <div key={f.id} className="flex items-center gap-2 py-0.5">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColors[f.status]}`} />
          <span className={`${itemSize} font-medium truncate flex-1`}>{f.name}</span>
          <span className={`${subSize} opacity-50`}>{f.role}</span>
        </div>
      ))}
      {showPipeline && (
        <div className="pt-2 mt-1 border-t border-border/20">
          <p className={`${labelSize} text-muted-foreground font-medium mb-1`}>Pipeline</p>
          {initialDeals.slice(0, 2).map(d => (
            <div key={d.id} className="flex items-center gap-2 py-0.5">
              <span className={`${itemSize} font-medium truncate flex-1`}>{d.name}</span>
              <span className={`${subSize} opacity-50`}>{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Helper ─── */
const genId = () => Math.random().toString(36).slice(2, 9);
const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

/* ─── Delete Confirm Dialog ─── */
const DeleteConfirmDialog = ({ open, onOpenChange, onConfirm, label }: { open: boolean; onOpenChange: (o: boolean) => void; onConfirm: () => void; label: string }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="glass-strong rounded-3xl border-border/30 max-w-sm">
      <DialogHeader>
        <DialogTitle>Delete {label}</DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2">
        <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
        <Button variant="destructive" onClick={onConfirm} className="rounded-xl">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/* ─── Freelancer Dialog ─── */
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
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as FreelancerStatus }))}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="available">Available</SelectItem><SelectItem value="on-project">On Project</SelectItem><SelectItem value="unavailable">Unavailable</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} className="rounded-xl" disabled={!form.name}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Deal Dialog ─── */
const DealDialog = ({ open, onOpenChange, deal, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; deal: Deal | null; onSave: (d: Deal) => void }) => {
  const [form, setForm] = useState<Deal>(deal ?? { id: "", name: "", value: "", stage: "Qualified", probability: 50, contact: "" });
  const isEdit = !!deal;
  const handleSave = () => { onSave({ ...form, id: form.id || genId() }); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-3xl border-border/30 max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? "Edit" : "Add"} Deal</DialogTitle><DialogDescription>{isEdit ? "Update deal details." : "Add a new deal to your pipeline."}</DialogDescription></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Deal Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl mt-1" /></div>
            <div><Label className="text-xs">Value</Label><Input value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="$10,000" className="rounded-xl mt-1" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Stage</Label>
              <Select value={form.stage} onValueChange={v => setForm(p => ({ ...p, stage: v }))}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Qualified">Qualified</SelectItem><SelectItem value="Proposal Sent">Proposal Sent</SelectItem><SelectItem value="Negotiation">Negotiation</SelectItem><SelectItem value="Closed Won">Closed Won</SelectItem><SelectItem value="Closed Lost">Closed Lost</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Probability</Label><Input type="number" min="0" max="100" value={form.probability} onChange={e => setForm(p => ({ ...p, probability: parseInt(e.target.value) || 0 }))} className="rounded-xl mt-1" /></div>
            <div><Label className="text-xs">Contact</Label><Input value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} className="rounded-xl mt-1" /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} className="rounded-xl" disabled={!form.name}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Proposal Dialog ─── */
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
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as ProposalStatus }))}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="sent">Sent</SelectItem><SelectItem value="accepted">Accepted</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div><Label className="text-xs">Scope</Label><Input value={form.scope} onChange={e => setForm(p => ({ ...p, scope: e.target.value }))} placeholder="UX, UI, Development" className="rounded-xl mt-1" /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} className="rounded-xl" disabled={!form.title}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Contact Dialog ─── */
const ContactDialog = ({ open, onOpenChange, contact, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; contact: Contact | null; onSave: (c: Contact) => void }) => {
  const [form, setForm] = useState<Contact>(contact ?? { id: "", name: "", company: "", email: "", phone: "", type: "lead" });
  const isEdit = !!contact;
  const handleSave = () => { onSave({ ...form, id: form.id || genId() }); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-3xl border-border/30 max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? "Edit" : "Add"} Contact</DialogTitle><DialogDescription>{isEdit ? "Update contact details." : "Add a new contact."}</DialogDescription></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-xl mt-1" /></div>
            <div><Label className="text-xs">Company</Label><Input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} className="rounded-xl mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="rounded-xl mt-1" /></div>
            <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="rounded-xl mt-1" /></div>
          </div>
          <div>
            <Label className="text-xs">Type</Label>
            <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as ContactType }))}>
              <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="client">Client</SelectItem><SelectItem value="lead">Lead</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={handleSave} className="rounded-xl" disabled={!form.name}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Row Action Buttons ─── */
const RowActions = ({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) => (
  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
    <button onClick={onEdit} className="rounded-lg p-1.5 hover:bg-secondary transition-colors"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
    <button onClick={onDelete} className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
  </div>
);

/* ─── Kanban DnD ─── */
const STAGES = ["Qualified", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"];

const KanbanColumn = ({ stage, children }: { stage: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div ref={setNodeRef} className={cn("flex-1 min-w-[180px] rounded-xl p-2 transition-colors", isOver ? "bg-primary/5" : "bg-secondary/20")}>
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className={`w-2 h-2 rounded-full ${stageColors[stage]?.split(" ")[0] ?? "bg-muted"}`} />
        <span className="text-xs font-semibold">{stage}</span>
      </div>
      <div className="space-y-2 min-h-[60px]">{children}</div>
    </div>
  );
};

const KanbanCard = ({ deal }: { deal: Deal }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: deal.id });
  const style: React.CSSProperties = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-3 rounded-xl bg-background/80 border border-border/30 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow">
      <p className="text-xs font-semibold">{deal.name}</p>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[11px] text-muted-foreground">{deal.contact}</span>
        <span className="text-xs font-bold">{deal.value}</span>
      </div>
    </div>
  );
};

/* ─── Expanded ─── */
export const StudioExpanded = () => {
  const [tab, setTab] = useState<Tab>("freelancers");
  const [freelancers, setFreelancers] = useState(initialFreelancers);
  const [deals, setDeals] = useState(initialDeals);
  const [proposals, setProposals] = useState(initialProposals);
  const [contacts, setContacts] = useState(initialContacts);

  const [editFreelancer, setEditFreelancer] = useState<Freelancer | null>(null);
  const [showFreelancerDialog, setShowFreelancerDialog] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [showDealDialog, setShowDealDialog] = useState(false);
  const [editProposal, setEditProposal] = useState<Proposal | null>(null);
  const [showProposalDialog, setShowProposalDialog] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; label: string } | null>(null);
  const [pipelineView, setPipelineView] = useState<"list" | "kanban">("kanban");

  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const d = deals.find(x => x.id === event.active.id);
    if (d) setActiveDeal(d);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    if (STAGES.includes(overId)) {
      setDeals(prev => prev.map(d => d.id === active.id ? { ...d, stage: overId } : d));
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "freelancer") setFreelancers(p => p.filter(x => x.id !== deleteTarget.id));
    if (deleteTarget.type === "deal") setDeals(p => p.filter(x => x.id !== deleteTarget.id));
    if (deleteTarget.type === "proposal") setProposals(p => p.filter(x => x.id !== deleteTarget.id));
    if (deleteTarget.type === "contact") setContacts(p => p.filter(x => x.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "freelancers", label: "Team", icon: <Users className="w-3.5 h-3.5" /> },
    { key: "pipeline", label: "Pipeline", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: "proposals", label: "Proposals", icon: <FileText className="w-3.5 h-3.5" /> },
    { key: "budget", label: "Budget", icon: <DollarSign className="w-3.5 h-3.5" /> },
    { key: "contacts", label: "Contacts", icon: <Building2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors",
              tab === t.key ? "bg-foreground text-background" : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            )}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === "freelancers" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" className="rounded-xl gap-1 h-8 text-xs" onClick={() => { setEditFreelancer(null); setShowFreelancerDialog(true); }}>
              <UserPlus className="w-3.5 h-3.5" />Add
            </Button>
          </div>
          {freelancers.map(f => (
            <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{f.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="text-sm font-semibold">{f.name}</p><div className={`w-2 h-2 rounded-full ${statusColors[f.status]}`} /></div>
                <p className="text-xs text-muted-foreground">{f.role} · {f.rate}</p>
              </div>
              <div className="flex items-center gap-1"><Star className="w-3 h-3 fill-warning text-warning" /><span className="text-xs font-medium">{f.rating}</span></div>
              <RowActions onEdit={() => { setEditFreelancer(f); setShowFreelancerDialog(true); }} onDelete={() => setDeleteTarget({ type: "freelancer", id: f.id, label: f.name })} />
            </div>
          ))}
        </div>
      )}

      {tab === "pipeline" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPipelineView("list")}><List className={`w-3.5 h-3.5 ${pipelineView === "list" ? "text-foreground" : "text-muted-foreground"}`} /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPipelineView("kanban")}><LayoutGrid className={`w-3.5 h-3.5 ${pipelineView === "kanban" ? "text-foreground" : "text-muted-foreground"}`} /></Button>
            </div>
            <Button size="sm" className="rounded-xl gap-1 h-8 text-xs" onClick={() => { setEditDeal(null); setShowDealDialog(true); }}><Plus className="w-3.5 h-3.5" />Add Deal</Button>
          </div>

          {pipelineView === "kanban" ? (
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {STAGES.map(stage => (
                  <KanbanColumn key={stage} stage={stage}>
                    {deals.filter(d => d.stage === stage).map(deal => <KanbanCard key={deal.id} deal={deal} />)}
                  </KanbanColumn>
                ))}
              </div>
              <DragOverlay>{activeDeal ? <KanbanCard deal={activeDeal} /> : null}</DragOverlay>
            </DndContext>
          ) : (
            <div className="space-y-2">
              {deals.map(deal => (
                <div key={deal.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{deal.name}</p>
                    <p className="text-xs text-muted-foreground">{deal.contact}</p>
                  </div>
                  <Badge className={`text-[10px] rounded-full ${stageColors[deal.stage]}`}>{deal.stage}</Badge>
                  <span className="text-sm font-bold">{deal.value}</span>
                  <RowActions onEdit={() => { setEditDeal(deal); setShowDealDialog(true); }} onDelete={() => setDeleteTarget({ type: "deal", id: deal.id, label: deal.name })} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "proposals" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" className="rounded-xl gap-1 h-8 text-xs" onClick={() => { setEditProposal(null); setShowProposalDialog(true); }}><Plus className="w-3.5 h-3.5" />New Proposal</Button>
          </div>
          {proposals.map(p => {
            const colors: Record<string, string> = { draft: "bg-muted text-muted-foreground", sent: "bg-primary/10 text-primary", accepted: "bg-success/10 text-success", rejected: "bg-destructive/10 text-destructive" };
            return (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.scope}</p>
                </div>
                <Badge className={`text-[10px] rounded-full capitalize ${colors[p.status]}`}>{p.status}</Badge>
                <span className="text-sm font-bold">{p.value}</span>
                <span className="text-xs text-muted-foreground">{p.date}</span>
                <RowActions onEdit={() => { setEditProposal(p); setShowProposalDialog(true); }} onDelete={() => setDeleteTarget({ type: "proposal", id: p.id, label: p.title })} />
              </div>
            );
          })}
        </div>
      )}

      {tab === "budget" && (
        <div className="space-y-4">
          {budgets.map(b => {
            const pct = Math.round((b.spent / b.budget) * 100);
            const isOver = pct > 85;
            return (
              <div key={b.project} className="p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{b.project}</p>
                  <span className={cn("text-xs font-medium", isOver ? "text-destructive" : "text-muted-foreground")}>{pct}% used</span>
                </div>
                <Progress value={pct} className="h-2 mb-2" />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Budget: <span className="font-medium text-foreground">${b.budget.toLocaleString()}</span></span>
                  <span>Spent: <span className="font-medium text-foreground">${b.spent.toLocaleString()}</span></span>
                  <span>Remaining: <span className={cn("font-medium", isOver ? "text-destructive" : "text-success")}>${b.remaining.toLocaleString()}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "contacts" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" className="rounded-xl gap-1 h-8 text-xs" onClick={() => { setEditContact(null); setShowContactDialog(true); }}><UserPlus className="w-3.5 h-3.5" />Add Contact</Button>
          </div>
          {contacts.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{getInitials(c.name)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="text-sm font-semibold">{c.name}</p><Badge variant="outline" className="text-[9px] capitalize h-4">{c.type}</Badge></div>
                <p className="text-xs text-muted-foreground">{c.company}</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
              </div>
              <RowActions onEdit={() => { setEditContact(c); setShowContactDialog(true); }} onDelete={() => setDeleteTarget({ type: "contact", id: c.id, label: c.name })} />
            </div>
          ))}
        </div>
      )}

      <FreelancerDialog open={showFreelancerDialog} onOpenChange={setShowFreelancerDialog} freelancer={editFreelancer} onSave={f => { setFreelancers(prev => editFreelancer ? prev.map(x => x.id === f.id ? f : x) : [f, ...prev]); }} />
      <DealDialog open={showDealDialog} onOpenChange={setShowDealDialog} deal={editDeal} onSave={d => { setDeals(prev => editDeal ? prev.map(x => x.id === d.id ? d : x) : [d, ...prev]); }} />
      <ProposalDialog open={showProposalDialog} onOpenChange={setShowProposalDialog} proposal={editProposal} onSave={p => { setProposals(prev => editProposal ? prev.map(x => x.id === p.id ? p : x) : [p, ...prev]); }} />
      <ContactDialog open={showContactDialog} onOpenChange={setShowContactDialog} contact={editContact} onSave={c => { setContacts(prev => editContact ? prev.map(x => x.id === c.id ? c : x) : [c, ...prev]); }} />
      <DeleteConfirmDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)} onConfirm={confirmDelete} label={deleteTarget?.label ?? ""} />
    </div>
  );
};
