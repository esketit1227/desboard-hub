import { useState } from "react";
import { Plus, Send, Eye, FileText, Check, Clock, AlertCircle, X, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface Invoice {
  id: string; number: string; client: string; project: string; amount: number;
  status: "paid" | "pending" | "overdue" | "draft"; date: string; dueDate: string;
  items: { description: string; hours: number; rate: number }[];
}

const initialInvoices: Invoice[] = [
  { id: "1", number: "INV-001", client: "Flux Labs", project: "Brand Identity", amount: 4500, status: "paid", date: "2026-01-15", dueDate: "2026-02-15", items: [{ description: "Logo Design", hours: 12, rate: 150 }, { description: "Brand Guidelines", hours: 18, rate: 150 }] },
  { id: "2", number: "INV-002", client: "Mono Studio", project: "Website V2", amount: 6200, status: "pending", date: "2026-02-01", dueDate: "2026-03-01", items: [{ description: "UI Design", hours: 24, rate: 150 }, { description: "Prototyping", hours: 16, rate: 150 }, { description: "Design System", hours: 8, rate: 125 }] },
  { id: "3", number: "INV-003", client: "Nextwave", project: "Mobile App UI", amount: 3800, status: "overdue", date: "2026-01-01", dueDate: "2026-02-01", items: [{ description: "App Screen Design", hours: 20, rate: 150 }, { description: "Icon Set", hours: 6, rate: 130 }] },
];

const statusConfig: Record<string, { label: string; className: string; icon: typeof Check }> = {
  paid: { label: "Paid", className: "bg-success/10 text-success", icon: Check },
  pending: { label: "Pending", className: "bg-warning/10 text-warning", icon: Clock },
  overdue: { label: "Overdue", className: "bg-destructive/10 text-destructive", icon: AlertCircle },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground", icon: FileText },
};

/** Compact preview — outstanding $ + overdue alert */
export const InvoicesPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const totalOutstanding = initialInvoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0);
  const overdue = initialInvoices.filter(i => i.status === "overdue").length;

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold tracking-tight leading-none">${(totalOutstanding / 1000).toFixed(1)}k</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Outstanding</p>
        </div>
        <Receipt className="w-5 h-5 text-muted-foreground/40" />
      </div>
      <div className="flex items-center gap-3 mt-auto">
        {overdue > 0 && (
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-destructive" />
            <span className="text-[10px] font-medium text-destructive">{overdue} overdue</span>
          </div>
        )}
        <span className="text-[9px] text-muted-foreground">{initialInvoices.length} total</span>
      </div>
    </div>
  );
};

/** Full expanded view */
export const InvoicesExpanded = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ client: "", project: "", items: [{ description: "", hours: 0, rate: 0 }] });

  const addItem = () => setNewInvoice((prev) => ({ ...prev, items: [...prev.items, { description: "", hours: 0, rate: 0 }] }));
  const removeItem = (index: number) => setNewInvoice((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  const updateItem = (index: number, field: string, value: string | number) => setNewInvoice((prev) => ({ ...prev, items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item) }));

  const handleCreate = () => {
    if (!newInvoice.client.trim() || !newInvoice.project.trim()) { toast.error("Please fill in client and project name"); return; }
    const total = newInvoice.items.reduce((s, i) => s + i.hours * i.rate, 0);
    if (total <= 0) { toast.error("Invoice total must be greater than $0"); return; }
    const num = `INV-${String(invoices.length + 1).padStart(3, "0")}`;
    const today = new Date().toISOString().split("T")[0];
    const due = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
    const invoice: Invoice = { id: String(Date.now()), number: num, client: newInvoice.client.trim(), project: newInvoice.project.trim(), amount: total, status: "draft", date: today, dueDate: due, items: newInvoice.items.filter((i) => i.description && i.hours > 0 && i.rate > 0) };
    setInvoices((prev) => [invoice, ...prev]);
    setCreateOpen(false);
    setNewInvoice({ client: "", project: "", items: [{ description: "", hours: 0, rate: 0 }] });
    toast.success(`Invoice ${num} created`);
  };

  const markAsSent = (id: string) => { setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: "pending" as const } : inv))); toast.success("Invoice sent"); };
  const markAsPaid = (id: string) => { setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: "paid" as const } : inv))); toast.success("Invoice marked as paid"); };

  const newTotal = newInvoice.items.reduce((s, i) => s + i.hours * i.rate, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{invoices.length} invoices · ${invoices.reduce((s, i) => s + i.amount, 0).toLocaleString()} total</p>
        <Button onClick={() => setCreateOpen(true)} className="rounded-xl gap-2" size="sm"><Plus className="w-4 h-4" />New Invoice</Button>
      </div>
      <div className="space-y-3">
        {invoices.map((inv) => {
          const config = statusConfig[inv.status];
          const StatusIcon = config.icon;
          return (
            <div key={inv.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-muted-foreground" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="text-sm font-semibold">{inv.number}</p><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.className}`}><StatusIcon className="w-3 h-3" />{config.label}</span></div>
                <p className="text-xs text-muted-foreground mt-0.5">{inv.client} · {inv.project}</p>
              </div>
              <p className="text-sm font-bold shrink-0">${inv.amount.toLocaleString()}</p>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setPreviewInvoice(inv)} className="rounded-lg p-2 hover:bg-secondary transition-colors" title="Preview"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                {inv.status === "draft" && <button onClick={() => markAsSent(inv.id)} className="rounded-lg p-2 hover:bg-secondary transition-colors" title="Send"><Send className="w-4 h-4 text-muted-foreground" /></button>}
                {(inv.status === "pending" || inv.status === "overdue") && <button onClick={() => markAsPaid(inv.id)} className="rounded-lg p-2 hover:bg-success/10 transition-colors" title="Mark Paid"><Check className="w-4 h-4 text-success" /></button>}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!previewInvoice} onOpenChange={(open) => !open && setPreviewInvoice(null)}>
        <DialogContent className="sm:max-w-[550px] rounded-2xl">
          {previewInvoice && (<>
            <DialogHeader><DialogTitle className="text-lg font-bold">{previewInvoice.number}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground">Client</p><p className="font-medium">{previewInvoice.client}</p></div>
                <div><p className="text-xs text-muted-foreground">Project</p><p className="font-medium">{previewInvoice.project}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{previewInvoice.date}</p></div>
                <div><p className="text-xs text-muted-foreground">Due Date</p><p className="font-medium">{previewInvoice.dueDate}</p></div>
              </div>
              <div className="border-t border-border/50 pt-4">
                <div className="grid grid-cols-[1fr_60px_80px_80px] gap-2 text-[10px] text-muted-foreground uppercase tracking-wider mb-2 px-1"><span>Description</span><span className="text-right">Hours</span><span className="text-right">Rate</span><span className="text-right">Total</span></div>
                {previewInvoice.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-[1fr_60px_80px_80px] gap-2 text-sm py-2 px-1 rounded-lg hover:bg-secondary/30"><span>{item.description}</span><span className="text-right text-muted-foreground">{item.hours}</span><span className="text-right text-muted-foreground">${item.rate}</span><span className="text-right font-semibold">${(item.hours * item.rate).toLocaleString()}</span></div>
                ))}
              </div>
              <div className="border-t border-border/50 pt-3 flex justify-between items-center"><span className="text-sm text-muted-foreground">Total</span><span className="text-xl font-bold">${previewInvoice.amount.toLocaleString()}</span></div>
            </div>
          </>)}
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-2xl">
          <DialogHeader><DialogTitle className="text-lg font-bold">Create Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground mb-1 block">Client</label><Input value={newInvoice.client} onChange={(e) => setNewInvoice((p) => ({ ...p, client: e.target.value }))} placeholder="Client name" className="rounded-xl" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Project</label><Input value={newInvoice.project} onChange={(e) => setNewInvoice((p) => ({ ...p, project: e.target.value }))} placeholder="Project name" className="rounded-xl" /></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2"><label className="text-xs text-muted-foreground">Line Items</label><button onClick={addItem} className="text-xs text-primary font-medium hover:underline">+ Add item</button></div>
              <div className="space-y-2">
                {newInvoice.items.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} placeholder="Description" className="rounded-xl flex-1" />
                    <Input type="number" value={item.hours || ""} onChange={(e) => updateItem(i, "hours", Number(e.target.value))} placeholder="Hrs" className="rounded-xl w-16" />
                    <Input type="number" value={item.rate || ""} onChange={(e) => updateItem(i, "rate", Number(e.target.value))} placeholder="Rate" className="rounded-xl w-20" />
                    {newInvoice.items.length > 1 && <button onClick={() => removeItem(i)} className="p-1 rounded-lg hover:bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>}
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border/50 pt-3 flex justify-between items-center"><span className="text-sm text-muted-foreground">Total</span><span className="text-xl font-bold">${newTotal.toLocaleString()}</span></div>
            <Button onClick={handleCreate} className="w-full rounded-xl">Create Invoice</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
