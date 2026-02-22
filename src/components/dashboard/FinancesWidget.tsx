import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight, ArrowDownRight, TrendingUp,
  CreditCard, Wallet, Receipt, Download, Search, Plus, Loader2, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions, type Transaction } from "@/hooks/useTransactions";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";

const CATEGORY_COLORS = [
  "hsl(220 13% 18%)", "hsl(220 10% 46%)", "hsl(150 40% 50%)",
  "hsl(220 10% 72%)", "hsl(220 10% 86%)", "hsl(38 92% 50%)", "hsl(0 72% 52%)",
];

// --- Preview (still uses real data) ---
export const FinancesPreview = () => {
  const { transactions, isLoading } = useTransactions();

  const thisMonthIncome = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return transactions
      .filter((t) => t.type === "income" && parseISO(t.transaction_date) >= start && parseISO(t.transaction_date) <= end)
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  }, [transactions]);

  const thisMonthExpenses = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return transactions
      .filter((t) => t.type === "expense" && parseISO(t.transaction_date) >= start && parseISO(t.transaction_date) <= end)
      .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  }, [transactions]);

  const profit = thisMonthIncome - thisMonthExpenses;

  // Monthly bar data (last 6 months)
  const monthlyBars = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const income = transactions
        .filter((t) => t.type === "income" && parseISO(t.transaction_date) >= start && parseISO(t.transaction_date) <= end)
        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
      const profit = income - transactions
        .filter((t) => t.type === "expense" && parseISO(t.transaction_date) >= start && parseISO(t.transaction_date) <= end)
        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
      months.push({ month: format(d, "MMM"), income, profit });
    }
    return months;
  }, [transactions]);

  if (isLoading) return <div className="flex items-center justify-center h-20"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold tracking-tight">
            ${thisMonthIncome > 1000 ? `${(thisMonthIncome / 1000).toFixed(1)}k` : thisMonthIncome.toFixed(0)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Revenue this month</p>
        </div>
        {thisMonthIncome > 0 && (
          <div className="flex items-center gap-1 text-success text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            ${profit.toFixed(0)} profit
          </div>
        )}
      </div>

      {thisMonthIncome === 0 && thisMonthExpenses === 0 ? (
        <p className="text-xs text-muted-foreground mt-4">No transactions this month yet.</p>
      ) : (
        <>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-foreground rounded-full" style={{ width: `${thisMonthIncome > 0 ? (profit / thisMonthIncome) * 100 : 0}%` }} />
            </div>
          </div>
          <div className="h-[48px] mt-3 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBars}>
                <Bar dataKey="income" fill="hsl(var(--foreground))" radius={[3, 3, 0, 0]} opacity={0.15} />
                <Bar dataKey="profit" fill="hsl(var(--foreground))" radius={[3, 3, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

// --- Stat Card ---
const StatCard = ({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon: React.ElementType }) => (
  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
    <div className="flex items-center justify-between mb-2">
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <p className="text-2xl font-bold tracking-tight">{value}</p>
    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
  </div>
);

// --- Add Transaction Form ---
const AddTransactionForm = ({ onSubmit, categories, incomeSources }: {
  onSubmit: (tx: { description: string; amount: number; type: "income" | "expense"; category_id?: string; income_source_id?: string; payment_method?: string; transaction_date?: string }) => void;
  categories: { id: string; name: string }[];
  incomeSources: { id: string; name: string }[];
}) => {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [catId, setCatId] = useState("");
  const [srcId, setSrcId] = useState("");
  const [method, setMethod] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    onSubmit({
      description: desc,
      amount: parseFloat(amount),
      type,
      category_id: type === "expense" && catId ? catId : undefined,
      income_source_id: type === "income" && srcId ? srcId : undefined,
      payment_method: method || undefined,
      transaction_date: date,
    });
    setDesc(""); setAmount(""); setMethod("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border/50">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Description</Label>
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Payment from..." className="h-9 text-sm" required />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Amount</Label>
          <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="h-9 text-sm" required />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Method</Label>
          <Input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Credit card..." className="h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 text-sm" />
        </div>
      </div>
      {type === "expense" && categories.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs">Category</Label>
          <Select value={catId} onValueChange={setCatId}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      {type === "income" && incomeSources.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs">Source</Label>
          <Select value={srcId} onValueChange={setSrcId}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select source" /></SelectTrigger>
            <SelectContent>
              {incomeSources.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      <Button type="submit" size="sm" className="w-full">
        <Plus className="w-3.5 h-3.5 mr-1" /> Add Transaction
      </Button>
    </form>
  );
};

// --- Expanded View ---
export const FinancesExpanded = () => {
  const { transactions, categories, incomeSources, isLoading, addTransaction, deleteTransaction } = useTransactions();
  const [txFilter, setTxFilter] = useState<"all" | "income" | "expense">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const thisMonthTxs = useMemo(() =>
    transactions.filter((t) => parseISO(t.transaction_date) >= monthStart && parseISO(t.transaction_date) <= monthEnd),
    [transactions]
  );

  const totalIncome = thisMonthTxs.filter((t) => t.type === "income").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const totalExpenses = thisMonthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const profit = totalIncome - totalExpenses;
  const pendingInvoices = transactions.filter((t) => t.type === "income" && t.payment_method === "Invoice").length;

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 6; i >= 0; i--) {
      const d = subMonths(now, i);
      const s = startOfMonth(d);
      const e = endOfMonth(d);
      const income = transactions.filter((t) => t.type === "income" && parseISO(t.transaction_date) >= s && parseISO(t.transaction_date) <= e).reduce((a, t) => a + Math.abs(Number(t.amount)), 0);
      const expenses = transactions.filter((t) => t.type === "expense" && parseISO(t.transaction_date) >= s && parseISO(t.transaction_date) <= e).reduce((a, t) => a + Math.abs(Number(t.amount)), 0);
      months.push({ month: format(d, "MMM"), income, expenses, profit: income - expenses });
    }
    return months;
  }, [transactions]);

  // Expense breakdown by category
  const expenseByCategory = useMemo(() => {
    const catMap: Record<string, { name: string; value: number; color: string }> = {};
    thisMonthTxs.filter((t) => t.type === "expense").forEach((t) => {
      const cat = categories.find((c) => c.id === t.category_id);
      const key = cat?.id ?? "uncategorized";
      if (!catMap[key]) catMap[key] = { name: cat?.name ?? "Uncategorized", value: 0, color: cat?.color ?? "hsl(220 10% 72%)" };
      catMap[key].value += Math.abs(Number(t.amount));
    });
    return Object.values(catMap);
  }, [thisMonthTxs, categories]);

  // Income by source
  const incomeBySource = useMemo(() => {
    const srcMap: Record<string, { name: string; value: number }> = {};
    thisMonthTxs.filter((t) => t.type === "income").forEach((t) => {
      const src = incomeSources.find((s) => s.id === t.income_source_id);
      const key = src?.id ?? "other";
      if (!srcMap[key]) srcMap[key] = { name: src?.name ?? "Other", value: 0 };
      srcMap[key].value += Math.abs(Number(t.amount));
    });
    return Object.values(srcMap);
  }, [thisMonthTxs, incomeSources]);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = txFilter === "all" || tx.type === txFilter;
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getCategoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "";

  if (isLoading) return <div className="flex items-center justify-center h-40"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenue" value={`$${totalIncome.toLocaleString()}`} icon={Wallet} />
        <StatCard label="Expenses" value={`$${totalExpenses.toLocaleString()}`} icon={CreditCard} />
        <StatCard label="Profit" value={`$${profit.toLocaleString()}`} icon={TrendingUp} />
        <StatCard label="Transactions" value={`${thisMonthTxs.length}`} sub="this month" icon={Receipt} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/40 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg text-xs">Overview</TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-lg text-xs">Transactions</TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-lg text-xs">Expenses</TabsTrigger>
          <TabsTrigger value="income" className="rounded-lg text-xs">Income</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4 space-y-5">
          <div>
            <h4 className="text-sm font-semibold mb-3">Revenue vs Profit (7 months)</h4>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="incGradLive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profGradLive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "12px" }} formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === "income" ? "Revenue" : "Profit"]} />
                  <Area type="monotone" dataKey="income" stroke="hsl(var(--foreground))" strokeWidth={2} fill="url(#incGradLive)" />
                  <Area type="monotone" dataKey="profit" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#profGradLive)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {transactions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No transactions yet. Add your first one in the Transactions tab.</p>
          )}
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions" className="mt-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-1 min-w-[180px] bg-muted/30 border border-border/50 rounded-xl px-3 py-2">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" placeholder="Search transactions..." className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground/60" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-1">
              {(["all", "income", "expense"] as const).map((f) => (
                <button key={f} onClick={() => setTxFilter(f)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize", txFilter === f ? "bg-foreground text-background" : "bg-muted/40 text-muted-foreground hover:text-foreground")}>{f}</button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>

          {showAddForm && (
            <AddTransactionForm
              categories={categories}
              incomeSources={incomeSources}
              onSubmit={(tx) => { addTransaction.mutate(tx); setShowAddForm(false); }}
            />
          )}

          {filteredTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No transactions found.</p>
          ) : (
            <div className="space-y-1">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-muted/20 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", tx.type === "income" ? "bg-success/10" : "bg-muted/50")}>
                      {tx.type === "income" ? <ArrowDownRight className="w-3.5 h-3.5 text-success" /> : <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground">{format(parseISO(tx.transaction_date), "MMM d")}</span>
                        {tx.payment_method && <><span className="text-[11px] text-muted-foreground">·</span><span className="text-[11px] text-muted-foreground">{tx.payment_method}</span></>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {tx.category_id && (
                      <Badge variant="outline" className="text-[10px] rounded-md font-normal hidden sm:inline-flex">{getCategoryName(tx.category_id)}</Badge>
                    )}
                    <span className={cn("text-sm font-semibold tabular-nums", tx.type === "income" ? "text-success" : "text-foreground")}>
                      {tx.type === "income" ? "+" : "-"}${Math.abs(Number(tx.amount)).toLocaleString()}
                    </span>
                    <button onClick={() => deleteTransaction.mutate(tx.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10">
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Expenses */}
        <TabsContent value="expenses" className="mt-4 space-y-5">
          {expenseByCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No expenses this month.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-3">Breakdown</h4>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                        {expenseByCategory.map((entry, index) => <Cell key={index} fill={entry.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "12px" }} formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3">By Category</h4>
                <div className="space-y-3">
                  {expenseByCategory.map((cat, i) => {
                    const pct = totalExpenses > 0 ? Math.round((cat.value / totalExpenses) * 100) : 0;
                    return (
                      <div key={cat.name} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color || CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                            <span className="text-sm">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium tabular-nums">${cat.value.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color || CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Income */}
        <TabsContent value="income" className="mt-4 space-y-5">
          {incomeBySource.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No income this month.</p>
          ) : (
            <div>
              <h4 className="text-sm font-semibold mb-3">Revenue Sources</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {incomeBySource.map((source) => {
                  const pct = totalIncome > 0 ? Math.round((source.value / totalIncome) * 100) : 0;
                  return (
                    <div key={source.name} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{source.name}</span>
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </div>
                      <p className="text-xl font-bold tracking-tight">${source.value.toLocaleString()}</p>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-foreground/60 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold mb-3">Monthly Income Trend</h4>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "12px" }} formatter={(value: number) => [`$${value.toLocaleString()}`, "Income"]} />
                  <Bar dataKey="income" fill="hsl(var(--foreground))" radius={[6, 6, 0, 0]} opacity={0.15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
