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

  const handleSave = () => {
    const saved = { ...form, id: form.id || genId(), avatar: form.avatar || getInitials(form.name) };
    onSave(saved);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-3xl border-border/30 max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Add"} Freelancer</DialogTitle>
          <DialogDescription>{isEdit ? "Update freelancer details." : "Add a new freelancer to your pool."}</DialogDescription>
        </DialogHeader>
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
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="on-project">On Project</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
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

  const handleSave = () => {
    onSave({ ...form, id: form.id || genId() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-3xl border-border/30 max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Add"} Deal</DialogTitle>
          <DialogDescription>{isEdit ? "Update deal details." : "Add a new deal to your pipeline."}</DialogDescription>
        </DialogHeader>
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
                <SelectContent>
                  <SelectItem value="Qualified">Qualified</SelectItem>
                  <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Closed Won">Closed Won</SelectItem>
                  <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                </SelectContent>
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

  const handleSave = () => {
    onSave({ ...form, id: form.id || genId() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-3xl border-border/30 max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Add"} Proposal</DialogTitle>
          <DialogDescription>{isEdit ? "Update proposal details." : "Create a new proposal."}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div><Label className="text-xs">Title</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="rounded-xl mt-1" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">Value</Label><Input value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="$10,000" className="rounded-xl mt-1" /></div>
            <div><Label className="text-xs">Date</Label><Input value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} placeholder="Feb 20" className="rounded-xl mt-1" /></div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v as ProposalStatus }))}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
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

  const handleSave = () => {
    onSave({ ...form, id: form.id || genId() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong rounded-3xl border-border/30 max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Add"} Contact</DialogTitle>
          <DialogDescription>{isEdit ? "Update contact details." : "Add a new contact."}</DialogDescription>
        </DialogHeader>
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
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
              </SelectContent>
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
    <button onClick={onEdit} className="w-7 h-7 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors">
      <Pencil className="w-3 h-3 text-muted-foreground" />
    </button>
    <button onClick={onDelete} className="w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors">
      <Trash2 className="w-3 h-3 text-destructive/70" />
    </button>
  </div>
);

/* ─── Kanban Components ─── */
const KANBAN_STAGES = ["Qualified", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"];

const KanbanCard = ({ deal, onEdit, onDelete }: { deal: Deal; onEdit: () => void; onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id, data: { deal } });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group p-3 rounded-xl bg-background/60 border border-border/20 hover:border-border/40 transition-all cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
      <div className="flex items-start justify-between mb-1.5">
        <p className="text-xs font-medium leading-tight">{deal.name}</p>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 -mt-0.5 -mr-1">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="w-5 h-5 rounded-md hover:bg-muted/50 flex items-center justify-center">
            <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-5 h-5 rounded-md hover:bg-destructive/10 flex items-center justify-center">
            <Trash2 className="w-2.5 h-2.5 text-destructive/70" />
          </button>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mb-2">{deal.contact}</p>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold">{deal.value}</p>
        <span className="text-[10px] text-muted-foreground">{deal.probability}%</span>
      </div>
    </div>
  );
};

const KanbanColumn = ({ stage, deals, onEdit, onDelete, totalPipelineValue }: { stage: string; deals: Deal[]; onEdit: (d: Deal) => void; onDelete: (d: Deal) => void; totalPipelineValue: number }) => {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const stageTotal = deals.reduce((sum, d) => sum + (parseFloat(d.value.replace(/[^0-9.]/g, "")) || 0), 0);
  const stagePercent = totalPipelineValue > 0 ? Math.round((stageTotal / totalPipelineValue) * 100) : 0;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-w-[180px] w-[180px] rounded-2xl bg-muted/15 p-2.5 transition-colors",
        isOver && "bg-primary/5 ring-1 ring-primary/20"
      )}
    >
      <div className="flex items-center justify-between mb-1 px-1">
        <div className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full", stageColors[stage]?.replace(/text-\S+/, "").trim() || "bg-muted")} />
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{stage}</p>
        </div>
        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 rounded-full font-semibold">
          {deals.length}
        </Badge>
      </div>
      <div className="px-1 mb-1.5">
        <p className="text-sm font-semibold">${stageTotal.toLocaleString()}</p>
      </div>
      <div className="px-1 mb-2.5">
        <div className="w-full h-1 rounded-full bg-muted/30 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", stage === "Closed Won" ? "bg-success" : stage === "Closed Lost" ? "bg-destructive" : "bg-primary")}
            style={{ width: `${stagePercent}%` }}
          />
        </div>
        <p className="text-[9px] text-muted-foreground mt-0.5">{stagePercent}% of pipeline</p>
      </div>
      <div className="flex flex-col gap-1.5 flex-1 min-h-[60px]">
        {deals.map(d => (
          <KanbanCard key={d.id} deal={d} onEdit={() => onEdit(d)} onDelete={() => onDelete(d)} />
        ))}
      </div>
    </div>
  );
};

const KanbanBoard = ({ deals, onMoveDeal, onEdit, onDelete }: {
  deals: Deal[];
  onMoveDeal: (dealId: string, newStage: string) => void;
  onEdit: (d: Deal) => void;
  onDelete: (d: Deal) => void;
}) => {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find(d => d.id === event.active.id);
    if (deal) setActiveDeal(deal);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const overId = String(over.id);
    // If dropped on a stage column
    if (KANBAN_STAGES.includes(overId)) {
      onMoveDeal(String(active.id), overId);
    } else {
      // Dropped on another card — move to that card's stage
      const targetDeal = deals.find(d => d.id === overId);
      if (targetDeal) {
        onMoveDeal(String(active.id), targetDeal.stage);
      }
    }
  };

  const totalPipelineValue = deals.reduce((sum, d) => sum + (parseFloat(d.value.replace(/[^0-9.]/g, "")) || 0), 0);

  // Stage progression summary
  const stageSummary = KANBAN_STAGES.map(stage => {
    const stageDeals = deals.filter(d => d.stage === stage);
    const stageVal = stageDeals.reduce((s, d) => s + (parseFloat(d.value.replace(/[^0-9.]/g, "")) || 0), 0);
    return { stage, count: stageDeals.length, value: stageVal };
  });

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Pipeline progress bar */}
      <div className="flex items-center gap-0.5 mb-3 px-1">
        {stageSummary.map((s, i) => (
          <div key={s.stage} className="flex items-center flex-1">
            <div className="flex-1">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  s.stage === "Closed Won" ? "bg-success" : s.stage === "Closed Lost" ? "bg-destructive" : s.count > 0 ? "bg-primary" : "bg-muted/30"
                )}
              />
            </div>
            {i < stageSummary.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0 mx-0.5" />}
          </div>
        ))}
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-2">
        {KANBAN_STAGES.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            deals={deals.filter(d => d.stage === stage)}
            onEdit={onEdit}
            onDelete={onDelete}
            totalPipelineValue={totalPipelineValue}
          />
        ))}
      </div>
      <DragOverlay>
        {activeDeal && (
          <div className="p-3 rounded-xl bg-background border border-border/40 shadow-lg w-[170px] rotate-2">
            <p className="text-xs font-medium">{activeDeal.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{activeDeal.contact}</p>
            <p className="text-xs font-semibold mt-1.5">{activeDeal.value}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

/* ─── Expanded View ─── */
export const StudioExpanded = () => {
  const [activeTab, setActiveTab] = useState<Tab>("freelancers");
  const [search, setSearch] = useState("");
  const [pipelineView, setPipelineView] = useState<"list" | "kanban">("kanban");

  // Filters
  const [freelancerStatusFilter, setFreelancerStatusFilter] = useState<string>("all");
  const [dealStageFilter, setDealStageFilter] = useState<string>("all");
  const [contactTypeFilter, setContactTypeFilter] = useState<string>("all");

  // Sort
  const [freelancerSort, setFreelancerSort] = useState<string>("name");
  const [dealSort, setDealSort] = useState<string>("name");
  const [proposalSort, setProposalSort] = useState<string>("title");
  const [contactSort, setContactSort] = useState<string>("name");

  // State
  const [freelancerList, setFreelancerList] = useState<Freelancer[]>(initialFreelancers);
  const [dealList, setDealList] = useState<Deal[]>(initialDeals);
  const [proposalList, setProposalList] = useState<Proposal[]>(initialProposals);
  const [contactList, setContactList] = useState<Contact[]>(initialContacts);

  // Dialog state
  const [freelancerDialog, setFreelancerDialog] = useState<{ open: boolean; item: Freelancer | null }>({ open: false, item: null });
  const [dealDialog, setDealDialog] = useState<{ open: boolean; item: Deal | null }>({ open: false, item: null });
  const [proposalDialog, setProposalDialog] = useState<{ open: boolean; item: Proposal | null }>({ open: false, item: null });
  const [contactDialog, setContactDialog] = useState<{ open: boolean; item: Contact | null }>({ open: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; label: string; onConfirm: () => void }>({ open: false, label: "", onConfirm: () => {} });

  // CRUD helpers
  const saveFreelancer = (f: Freelancer) => setFreelancerList(prev => prev.find(x => x.id === f.id) ? prev.map(x => x.id === f.id ? f : x) : [...prev, f]);
  const saveDeal = (d: Deal) => setDealList(prev => prev.find(x => x.id === d.id) ? prev.map(x => x.id === d.id ? d : x) : [...prev, d]);
  const saveProposal = (p: Proposal) => setProposalList(prev => prev.find(x => x.id === p.id) ? prev.map(x => x.id === p.id ? p : x) : [...prev, p]);
  const saveContact = (c: Contact) => setContactList(prev => prev.find(x => x.id === c.id) ? prev.map(x => x.id === c.id ? c : x) : [...prev, c]);

  const confirmDelete = (label: string, onConfirm: () => void) => setDeleteDialog({ open: true, label, onConfirm });

  // Parse currency string to number
  const parseValue = (v: string) => parseFloat(v.replace(/[^0-9.]/g, "")) || 0;

  // Filtered & sorted lists
  const q = search.toLowerCase();
  const filteredFreelancers = freelancerList
    .filter(f => (freelancerStatusFilter === "all" || f.status === freelancerStatusFilter) && (!q || f.name.toLowerCase().includes(q) || f.role.toLowerCase().includes(q)))
    .sort((a, b) => {
      if (freelancerSort === "rating") return b.rating - a.rating;
      if (freelancerSort === "rate") return parseValue(b.rate) - parseValue(a.rate);
      return a.name.localeCompare(b.name);
    });
  const filteredDeals = dealList
    .filter(d => (dealStageFilter === "all" || d.stage === dealStageFilter) && (!q || d.name.toLowerCase().includes(q) || d.contact.toLowerCase().includes(q)))
    .sort((a, b) => {
      if (dealSort === "value") return parseValue(b.value) - parseValue(a.value);
      if (dealSort === "probability") return b.probability - a.probability;
      return a.name.localeCompare(b.name);
    });
  const filteredProposals = proposalList
    .filter(p => (!q || p.title.toLowerCase().includes(q) || p.scope.toLowerCase().includes(q)))
    .sort((a, b) => {
      if (proposalSort === "value") return parseValue(b.value) - parseValue(a.value);
      if (proposalSort === "date") return a.date.localeCompare(b.date);
      if (proposalSort === "status") return a.status.localeCompare(b.status);
      return a.title.localeCompare(b.title);
    });
  const filteredContacts = contactList
    .filter(c => (contactTypeFilter === "all" || c.type === contactTypeFilter) && (!q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)))
    .sort((a, b) => {
      if (contactSort === "company") return a.company.localeCompare(b.company);
      if (contactSort === "type") return a.type.localeCompare(b.type);
      return a.name.localeCompare(b.name);
    });

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "freelancers", label: "Freelancers", icon: <Users className="w-4 h-4" /> },
    { id: "pipeline", label: "Pipeline", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "proposals", label: "Proposals", icon: <FileText className="w-4 h-4" /> },
    { id: "budget", label: "Budget", icon: <DollarSign className="w-4 h-4" /> },
    { id: "contacts", label: "Contacts", icon: <UserPlus className="w-4 h-4" /> },
  ];

  const addButton = (onClick: () => void) => (
    <Button size="sm" variant="ghost" onClick={onClick} className="rounded-xl h-8 gap-1.5 text-xs">
      <Plus className="w-3.5 h-3.5" /> Add
    </Button>
  );

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pipeline Value", value: "$82.5k" },
          { label: "Active Deals", value: String(dealList.length) },
          { label: "Freelancers", value: String(freelancerList.length) },
          { label: "Win Rate", value: "68%" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-muted/30 p-3.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{s.label}</p>
            <p className="text-xl font-semibold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-2">
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
        {activeTab === "freelancers" && addButton(() => setFreelancerDialog({ open: true, item: null }))}
        {activeTab === "pipeline" && addButton(() => setDealDialog({ open: true, item: null }))}
        {activeTab === "proposals" && addButton(() => setProposalDialog({ open: true, item: null }))}
        {activeTab === "contacts" && addButton(() => setContactDialog({ open: true, item: null }))}
      </div>

      {/* Search & Filter Bar */}
      {activeTab !== "budget" && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="rounded-xl pl-9 h-9 text-xs bg-muted/20 border-border/30"
            />
          </div>
          {activeTab === "freelancers" && (
            <>
              <Select value={freelancerStatusFilter} onValueChange={setFreelancerStatusFilter}>
                <SelectTrigger className="rounded-xl h-9 w-[130px] text-xs border-border/30 bg-muted/20">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="on-project">On Project</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
              <Select value={freelancerSort} onValueChange={setFreelancerSort}>
                <SelectTrigger className="rounded-xl h-9 w-[110px] text-xs border-border/30 bg-muted/20">
                  <ArrowUpDown className="w-3 h-3 mr-1 shrink-0" /><SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="rate">Rate</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
          {activeTab === "pipeline" && (
            <>
              <div className="flex items-center rounded-xl border border-border/30 bg-muted/20 h-9 p-0.5">
                <button
                  onClick={() => setPipelineView("list")}
                  className={cn("rounded-lg h-full px-2 transition-colors", pipelineView === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPipelineView("kanban")}
                  className={cn("rounded-lg h-full px-2 transition-colors", pipelineView === "kanban" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
              {pipelineView === "list" && (
                <>
                  <Select value={dealStageFilter} onValueChange={setDealStageFilter}>
                    <SelectTrigger className="rounded-xl h-9 w-[150px] text-xs border-border/30 bg-muted/20">
                      <SelectValue placeholder="Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                      <SelectItem value="Negotiation">Negotiation</SelectItem>
                      <SelectItem value="Closed Won">Closed Won</SelectItem>
                      <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dealSort} onValueChange={setDealSort}>
                    <SelectTrigger className="rounded-xl h-9 w-[120px] text-xs border-border/30 bg-muted/20">
                      <ArrowUpDown className="w-3 h-3 mr-1 shrink-0" /><SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="value">Value</SelectItem>
                      <SelectItem value="probability">Probability</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </>
          )}
          {activeTab === "proposals" && (
            <Select value={proposalSort} onValueChange={setProposalSort}>
              <SelectTrigger className="rounded-xl h-9 w-[110px] text-xs border-border/30 bg-muted/20">
                <ArrowUpDown className="w-3 h-3 mr-1 shrink-0" /><SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="value">Value</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          )}
          {activeTab === "contacts" && (
            <>
              <Select value={contactTypeFilter} onValueChange={setContactTypeFilter}>
                <SelectTrigger className="rounded-xl h-9 w-[120px] text-xs border-border/30 bg-muted/20">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
              <Select value={contactSort} onValueChange={setContactSort}>
                <SelectTrigger className="rounded-xl h-9 w-[120px] text-xs border-border/30 bg-muted/20">
                  <ArrowUpDown className="w-3 h-3 mr-1 shrink-0" /><SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "freelancers" && (
        <div className="space-y-2">
          {filteredFreelancers.map(f => (
            <div key={f.id} className="group flex items-center gap-3 p-3 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
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
              <div className="text-right shrink-0 mr-1">
                <p className="text-sm font-medium">{f.rate}</p>
                <div className="flex items-center gap-1 justify-end">
                  <Star className="w-3 h-3 fill-warning text-warning" />
                  <span className="text-[11px] text-muted-foreground">{f.rating}</span>
                </div>
              </div>
              <RowActions onEdit={() => setFreelancerDialog({ open: true, item: f })} onDelete={() => confirmDelete(f.name, () => setFreelancerList(prev => prev.filter(x => x.id !== f.id)))} />
            </div>
          ))}
          {filteredFreelancers.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No freelancers found</p>}
        </div>
      )}

      {activeTab === "pipeline" && pipelineView === "list" && (
        <div className="space-y-2">
          {filteredDeals.map(d => (
            <div key={d.id} className="group p-4 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.contact}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{d.value}</p>
                  <RowActions onEdit={() => setDealDialog({ open: true, item: d })} onDelete={() => confirmDelete(d.name, () => setDealList(prev => prev.filter(x => x.id !== d.id)))} />
                </div>
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
          {filteredDeals.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No deals found</p>}
        </div>
      )}

      {activeTab === "pipeline" && pipelineView === "kanban" && (
        <KanbanBoard
          deals={dealList}
          onMoveDeal={(dealId, newStage) => setDealList(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d))}
          onEdit={(d) => setDealDialog({ open: true, item: d })}
          onDelete={(d) => confirmDelete(d.name, () => setDealList(prev => prev.filter(x => x.id !== d.id)))}
        />
      )}

      {activeTab === "proposals" && (
        <div className="space-y-2">
          {filteredProposals.map(p => {
            const statusStyle = {
              sent: "bg-primary/10 text-primary",
              draft: "bg-muted text-muted-foreground",
              accepted: "bg-success/10 text-success",
              rejected: "bg-destructive/10 text-destructive",
            };
            return (
              <div key={p.id} className="group p-4 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.scope}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full capitalize", statusStyle[p.status])}>
                      {p.status}
                    </span>
                    <RowActions onEdit={() => setProposalDialog({ open: true, item: p })} onDelete={() => confirmDelete(p.title, () => setProposalList(prev => prev.filter(x => x.id !== p.id)))} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{p.date}</span>
                  <span className="font-medium text-foreground">{p.value}</span>
                </div>
              </div>
            );
          })}
          {filteredProposals.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No proposals found</p>}
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
          {filteredContacts.map(c => (
            <div key={c.id} className="group flex items-center gap-3 p-3 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors">
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
              <div className="flex items-center gap-1 shrink-0">
                <button className="w-8 h-8 rounded-xl hover:bg-muted/50 flex items-center justify-center transition-colors">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button className="w-8 h-8 rounded-xl hover:bg-muted/50 flex items-center justify-center transition-colors">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              <RowActions onEdit={() => setContactDialog({ open: true, item: c })} onDelete={() => confirmDelete(c.name, () => setContactList(prev => prev.filter(x => x.id !== c.id)))} />
            </div>
          ))}
          {filteredContacts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No contacts found</p>}
        </div>
      )}

      {/* Dialogs */}
      <FreelancerDialog open={freelancerDialog.open} onOpenChange={o => setFreelancerDialog(p => ({ ...p, open: o }))} freelancer={freelancerDialog.item} onSave={saveFreelancer} />
      <DealDialog open={dealDialog.open} onOpenChange={o => setDealDialog(p => ({ ...p, open: o }))} deal={dealDialog.item} onSave={saveDeal} />
      <ProposalDialog open={proposalDialog.open} onOpenChange={o => setProposalDialog(p => ({ ...p, open: o }))} proposal={proposalDialog.item} onSave={saveProposal} />
      <ContactDialog open={contactDialog.open} onOpenChange={o => setContactDialog(p => ({ ...p, open: o }))} contact={contactDialog.item} onSave={saveContact} />
      <DeleteConfirmDialog open={deleteDialog.open} onOpenChange={o => setDeleteDialog(p => ({ ...p, open: o }))} onConfirm={() => { deleteDialog.onConfirm(); setDeleteDialog(p => ({ ...p, open: false })); }} label={deleteDialog.label} />
    </div>
  );
};
