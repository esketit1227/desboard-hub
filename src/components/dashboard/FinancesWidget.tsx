import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  CreditCard, Wallet, Receipt, Filter, Download, Search, DollarSign,
  Plus, Trash2, X, Clock, Building2, Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { getSizeTier } from "./WidgetCard";

// ── Data ──

const monthlyData = [
  { month: "Jul", income: 4200, expenses: 1800, profit: 2400 },
  { month: "Aug", income: 5800, expenses: 2100, profit: 3700 },
  { month: "Sep", income: 3900, expenses: 1950, profit: 1950 },
  { month: "Oct", income: 7200, expenses: 2400, profit: 4800 },
  { month: "Nov", income: 6100, expenses: 2800, profit: 3300 },
  { month: "Dec", income: 8400, expenses: 3100, profit: 5300 },
  { month: "Jan", income: 7800, expenses: 2650, profit: 5150 },
];

const expenseCategories = [
  { name: "Software & Tools", value: 1240, color: "hsl(0 0% 18%)", budget: 1500 },
  { name: "Marketing", value: 860, color: "hsl(220 14% 38%)", budget: 1000 },
  { name: "Contractors", value: 1450, color: "hsl(200 50% 45%)", budget: 2000 },
  { name: "Office", value: 420, color: "hsl(150 40% 40%)", budget: 500 },
  { name: "Other", value: 280, color: "hsl(35 60% 50%)", budget: 400 },
];

const incomeSources = [
  { name: "Client Projects", value: 5200, percentage: 67, color: "hsl(0 0% 18%)" },
  { name: "Retainers", value: 1800, percentage: 23, color: "hsl(220 14% 38%)" },
  { name: "Consulting", value: 540, percentage: 7, color: "hsl(200 50% 45%)" },
  { name: "Other", value: 260, percentage: 3, color: "hsl(150 40% 40%)" },
];

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  category: string;
  method: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 1, description: "Payment from Acme Corp", amount: 3200, type: "income", date: "Jan 28", category: "Client Projects", method: "Bank Transfer" },
  { id: 2, description: "Figma Subscription", amount: -15, type: "expense", date: "Jan 27", category: "Software & Tools", method: "Credit Card" },
  { id: 3, description: "Payment from StartupXYZ", amount: 1800, type: "income", date: "Jan 25", category: "Retainers", method: "Stripe" },
  { id: 4, description: "Google Ads Campaign", amount: -340, type: "expense", date: "Jan 24", category: "Marketing", method: "Credit Card" },
  { id: 5, description: "Contractor - Alex M.", amount: -750, type: "expense", date: "Jan 23", category: "Contractors", method: "Bank Transfer" },
  { id: 6, description: "Consulting — Fintech Co", amount: 540, type: "income", date: "Jan 20", category: "Consulting", method: "Stripe" },
  { id: 7, description: "AWS Hosting", amount: -189, type: "expense", date: "Jan 19", category: "Software & Tools", method: "Credit Card" },
  { id: 8, description: "Retainer — BrandCo", amount: 1800, type: "income", date: "Jan 15", category: "Retainers", method: "Bank Transfer" },
  { id: 9, description: "Facebook Ads", amount: -220, type: "expense", date: "Jan 14", category: "Marketing", method: "Credit Card" },
  { id: 10, description: "Office Supplies", amount: -95, type: "expense", date: "Jan 12", category: "Office", method: "Credit Card" },
];

const weeklySpending = [
  { day: "Mon", amount: 120 }, { day: "Tue", amount: 45 }, { day: "Wed", amount: 340 },
  { day: "Thu", amount: 80 }, { day: "Fri", amount: 210 }, { day: "Sat", amount: 15 }, { day: "Sun", amount: 0 },
];

const METHODS = ["Bank Transfer", "Credit Card", "Stripe", "PayPal", "Cash"];
const CATEGORIES_EXPENSE = ["Software & Tools", "Marketing", "Contractors", "Office", "Other"];
const CATEGORIES_INCOME = ["Client Projects", "Retainers", "Consulting", "Other"];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

// ── Preview ──

export const FinancesPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const tier = getSizeTier(pixelSize);

  if (tier === "compact") return null;

  if (tier === "standard") {
    return (
      <div className="flex flex-col h-full gap-1.5 mt-1">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight leading-none">$7.8k</p>
          <p className="text-[10px] text-muted-foreground">revenue</p>
        </div>
        <div className="flex items-end gap-[3px] flex-1 h-[28px]">
          {monthlyData.map((d, i) => (
            <div key={i} className="flex-1 rounded-sm bg-foreground/15" style={{ height: `${(d.income / 8400) * 100}%` }} />
          ))}
        </div>
        <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-auto">
          <span>$2.7k expenses</span>
          <span>+28%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-2 mt-1">
      <div className="flex items-start justify-between">
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight leading-none">$7.8k</p>
          <p className="text-xs text-muted-foreground">revenue</p>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">+28% ↑</span>
      </div>
      <div className="flex items-end gap-[3px] h-[32px]">
        {monthlyData.map((d, i) => (
          <div key={i} className="flex-1 rounded-sm bg-foreground/15" style={{ height: `${(d.income / 8400) * 100}%` }} />
        ))}
      </div>
      <div className="space-y-1">
        {INITIAL_TRANSACTIONS.slice(0, 3).map((t) => (
          <div key={t.id} className="flex items-center justify-between">
            <span className="text-[9px] truncate flex-1">{t.description}</span>
            <span className={cn("text-[9px] font-medium", t.amount > 0 ? "text-foreground" : "text-muted-foreground")}>
              {t.amount > 0 ? "+" : ""}{t.amount > 0 ? `$${t.amount}` : `-$${Math.abs(t.amount)}`}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-auto pt-1 border-t border-foreground/8">
        <span>$5.2k profit</span>
        <span>$2.7k expenses</span>
      </div>
    </div>
  );
};

// ── Expanded (full page) ──

export const FinancesExpanded = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");
  const [newCategory, setNewCategory] = useState("");
  const [newMethod, setNewMethod] = useState("Credit Card");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [transactions, filterType, filterCategory, searchQuery]);

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
  const profit = totalIncome - totalExpenses;
  const prevIncome = 6100;
  const incomeChange = Math.round(((totalIncome - prevIncome) / prevIncome) * 100);

  const addTransaction = () => {
    if (!newDesc.trim() || !newAmount) return;
    const amount = parseFloat(newAmount);
    if (isNaN(amount)) return;
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const t: Transaction = {
      id: Date.now(),
      description: newDesc.trim(),
      amount: newType === "expense" ? -Math.abs(amount) : Math.abs(amount),
      type: newType,
      date: dateStr,
      category: newCategory || (newType === "expense" ? "Other" : "Other"),
      method: newMethod,
    };
    setTransactions((prev) => [t, ...prev]);
    setNewDesc("");
    setNewAmount("");
    setNewCategory("");
    setShowAddForm(false);
  };

  const deleteTransaction = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const allCategories = [...new Set(transactions.map((t) => t.category))];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-foreground text-background rounded-xl px-3 py-2 text-xs shadow-lg">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="opacity-80">{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="rounded-xl">
          {showAddForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          {showAddForm ? "Cancel" : "Add Transaction"}
        </Button>
      </div>

      {/* Add transaction form */}
      {showAddForm && (
        <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold">New Transaction</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setNewType("expense")}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-medium transition-all",
                newType === "expense" ? "bg-foreground text-background shadow-md" : "bg-muted/40 text-muted-foreground"
              )}
            >
              Expense
            </button>
            <button
              onClick={() => setNewType("income")}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-medium transition-all",
                newType === "income" ? "bg-foreground text-background shadow-md" : "bg-muted/40 text-muted-foreground"
              )}
            >
              Income
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="h-9 rounded-xl bg-background/60 border-border/30"
            />
            <Input
              placeholder="Amount"
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="h-9 rounded-xl bg-background/60 border-border/30"
            />
            <Select value={newCategory} onValueChange={setNewCategory}>
              <SelectTrigger className="h-9 rounded-xl bg-background/60 border-border/30">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {(newType === "expense" ? CATEGORIES_EXPENSE : CATEGORIES_INCOME).map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newMethod} onValueChange={setNewMethod}>
              <SelectTrigger className="h-9 rounded-xl bg-background/60 border-border/30">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addTransaction} size="sm" className="rounded-xl" disabled={!newDesc.trim() || !newAmount}>
            Add {newType === "income" ? "Income" : "Expense"}
          </Button>
        </div>
      )}

      {/* ── Overview Tab ── */}
      <TabsContent value="overview" className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Revenue", value: totalIncome, icon: <TrendingUp className="w-4 h-4" />, change: `+${incomeChange}%`, positive: true },
            { label: "Expenses", value: totalExpenses, icon: <CreditCard className="w-4 h-4" />, change: "+12%", positive: false },
            { label: "Profit", value: profit, icon: <Wallet className="w-4 h-4" />, change: "+34%", positive: true },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
                <span className="text-muted-foreground/50">{kpi.icon}</span>
              </div>
              <p className="text-2xl font-bold tracking-tight">{formatCurrency(kpi.value)}</p>
              <div className="flex items-center gap-1 mt-1">
                {kpi.positive ? (
                  <ArrowUpRight className="w-3 h-3 text-foreground/60" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-muted-foreground" />
                )}
                <span className="text-[10px] text-muted-foreground">{kpi.change} from last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm">
          <h4 className="text-sm font-semibold mb-4">Revenue vs Expenses</h4>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="hsl(var(--foreground))" fill="hsl(var(--foreground) / 0.08)" strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground) / 0.05)" strokeWidth={2} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly spending bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm">
            <h4 className="text-sm font-semibold mb-4">This Week's Spending</h4>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySpending}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" name="Spent" fill="hsl(var(--foreground))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent transactions preview */}
          <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm">
            <h4 className="text-sm font-semibold mb-3">Recent Transactions</h4>
            <div className="space-y-2">
              {transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/20 transition-colors">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                    t.type === "income" ? "bg-foreground/10" : "bg-muted/40"
                  )}>
                    {t.type === "income" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{t.description}</p>
                    <p className="text-[10px] text-muted-foreground">{t.date}</p>
                  </div>
                  <span className={cn("text-xs font-semibold", t.amount > 0 ? "text-foreground" : "text-muted-foreground")}>
                    {t.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(t.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>

      {/* ── Transactions Tab ── */}
      <TabsContent value="transactions" className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-xl bg-card/60 border-border/30"
            />
          </div>
          <div className="flex items-center gap-1 rounded-full bg-muted/40 p-1">
            {(["all", "income", "expense"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize",
                  filterType === t ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground/70"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-9 rounded-xl bg-card/60 border-border/30 w-40">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{filteredTransactions.length} transactions</span>
          <span>Total: {formatCurrency(filteredTransactions.reduce((s, t) => s + t.amount, 0))}</span>
        </div>

        {/* Transaction list */}
        <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 shadow-sm overflow-hidden">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-border/20">
              {filteredTransactions.map((t) => (
                <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/10 transition-colors group">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                    t.type === "income" ? "bg-foreground/10" : "bg-muted/40"
                  )}>
                    {t.type === "income" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span>{t.date}</span>
                      <span>·</span>
                      <span>{t.category}</span>
                      <span>·</span>
                      <span>{t.method}</span>
                    </div>
                  </div>
                  <span className={cn("text-sm font-semibold shrink-0", t.amount > 0 ? "text-foreground" : "text-muted-foreground")}>
                    {t.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(t.amount))}
                  </span>
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted-foreground">No transactions found</div>
          )}
        </div>
      </TabsContent>

      {/* ── Expenses Tab ── */}
      <TabsContent value="expenses" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pie chart */}
          <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm">
            <h4 className="text-sm font-semibold mb-4">Expense Breakdown</h4>
            <div className="h-[220px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
                  >
                    {expenseCategories.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {expenseCategories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                  <span className="text-[10px] text-muted-foreground">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget vs actual */}
          <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm">
            <h4 className="text-sm font-semibold mb-4">Budget vs Actual</h4>
            <div className="space-y-4">
              {expenseCategories.map((cat) => {
                const pct = Math.round((cat.value / cat.budget) * 100);
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{cat.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatCurrency(cat.value)} / {formatCurrency(cat.budget)}
                      </span>
                    </div>
                    <Progress value={Math.min(pct, 100)} className="h-2 rounded-full" />
                    <div className="flex items-center justify-between">
                      <span className={cn("text-[10px]", pct > 90 ? "text-destructive" : "text-muted-foreground")}>
                        {pct}% used
                      </span>
                      {pct > 90 && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-destructive border-destructive/30">
                          Near limit
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category totals */}
        <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm">
          <h4 className="text-sm font-semibold mb-3">Category Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {expenseCategories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/15 border border-border/10">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: cat.color + "22" }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                </div>
                <div>
                  <p className="text-xs font-medium">{cat.name}</p>
                  <p className="text-sm font-bold">{formatCurrency(cat.value)}</p>
                </div>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {Math.round((cat.value / totalExpenses) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      {/* ── Income Tab ── */}
      <TabsContent value="income" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Income by source */}
          <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm">
            <h4 className="text-sm font-semibold mb-4">Income Sources</h4>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeSources}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
                  >
                    {incomeSources.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {incomeSources.map((src) => (
                <div key={src.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: src.color }} />
                  <span className="text-[10px] text-muted-foreground">{src.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Income details list */}
          <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm">
            <h4 className="text-sm font-semibold mb-4">Source Breakdown</h4>
            <div className="space-y-4">
              {incomeSources.map((src) => (
                <div key={src.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: src.color }} />
                      <span className="text-xs font-medium">{src.name}</span>
                    </div>
                    <span className="text-sm font-bold">{formatCurrency(src.value)}</span>
                  </div>
                  <Progress value={src.percentage} className="h-2 rounded-full" />
                  <span className="text-[10px] text-muted-foreground">{src.percentage}% of total income</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly income trend */}
        <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm">
          <h4 className="text-sm font-semibold mb-4">Monthly Income Trend</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Income" fill="hsl(var(--foreground))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income transactions */}
        <div className="rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 p-5 shadow-sm">
          <h4 className="text-sm font-semibold mb-3">Recent Income</h4>
          <div className="space-y-2">
            {transactions.filter((t) => t.type === "income").slice(0, 6).map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/15 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-foreground/8 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-foreground/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.description}</p>
                  <p className="text-[10px] text-muted-foreground">{t.date} · {t.method}</p>
                </div>
                <span className="text-sm font-semibold">+{formatCurrency(t.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
