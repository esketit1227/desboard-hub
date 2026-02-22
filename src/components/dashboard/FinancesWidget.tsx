import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  CreditCard, Wallet, Receipt, Filter, Download, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// --- Data ---

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
  { name: "Software & Tools", value: 1240, color: "hsl(220 13% 18%)" },
  { name: "Marketing", value: 860, color: "hsl(220 10% 46%)" },
  { name: "Contractors", value: 1450, color: "hsl(150 40% 50%)" },
  { name: "Office", value: 420, color: "hsl(220 10% 72%)" },
  { name: "Other", value: 280, color: "hsl(220 10% 86%)" },
];

const incomeSources = [
  { name: "Client Projects", value: 5200, percentage: 67 },
  { name: "Retainers", value: 1800, percentage: 23 },
  { name: "Consulting", value: 540, percentage: 7 },
  { name: "Other", value: 260, percentage: 3 },
];

const transactions = [
  { id: 1, description: "Payment from Acme Corp", amount: 3200, type: "income" as const, date: "Jan 28", category: "Client Projects", method: "Bank Transfer" },
  { id: 2, description: "Figma Subscription", amount: -15, type: "expense" as const, date: "Jan 27", category: "Software & Tools", method: "Credit Card" },
  { id: 3, description: "Payment from StartupXYZ", amount: 1800, type: "income" as const, date: "Jan 25", category: "Retainers", method: "Stripe" },
  { id: 4, description: "Google Ads Campaign", amount: -340, type: "expense" as const, date: "Jan 24", category: "Marketing", method: "Credit Card" },
  { id: 5, description: "Contractor - Alex M.", amount: -750, type: "expense" as const, date: "Jan 23", category: "Contractors", method: "Bank Transfer" },
  { id: 6, description: "Payment from Bright Inc", amount: 2400, type: "income" as const, date: "Jan 22", category: "Client Projects", method: "Stripe" },
  { id: 7, description: "Adobe Creative Cloud", amount: -55, type: "expense" as const, date: "Jan 21", category: "Software & Tools", method: "Credit Card" },
  { id: 8, description: "Consulting - Brand Strategy", amount: 540, type: "income" as const, date: "Jan 20", category: "Consulting", method: "Invoice" },
  { id: 9, description: "Co-working Space", amount: -200, type: "expense" as const, date: "Jan 18", category: "Office", method: "Bank Transfer" },
  { id: 10, description: "Webflow Hosting", amount: -24, type: "expense" as const, date: "Jan 17", category: "Software & Tools", method: "Credit Card" },
];

const weeklySpending = [
  { day: "Mon", amount: 120 },
  { day: "Tue", amount: 45 },
  { day: "Wed", amount: 340 },
  { day: "Thu", amount: 80 },
  { day: "Fri", amount: 210 },
  { day: "Sat", amount: 15 },
  { day: "Sun", amount: 0 },
];

// --- Preview ---

export const FinancesPreview = () => {
  const totalIncome = 7800;
  const totalExpenses = 2650;
  const profit = totalIncome - totalExpenses;

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold tracking-tight">${(totalIncome / 1000).toFixed(1)}k</p>
          <p className="text-xs text-muted-foreground mt-0.5">Revenue this month</p>
        </div>
        <div className="flex items-center gap-1 text-success text-xs font-medium">
          <TrendingUp className="w-3 h-3" />
          +28%
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground rounded-full"
            style={{ width: `${(profit / totalIncome) * 100}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">
          ${(profit / 1000).toFixed(1)}k profit
        </span>
      </div>

      <div className="h-[48px] mt-3 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <Bar dataKey="income" fill="hsl(var(--foreground))" radius={[3, 3, 0, 0]} opacity={0.15} />
            <Bar dataKey="profit" fill="hsl(var(--foreground))" radius={[3, 3, 0, 0]} opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Stat Card ---

const StatCard = ({ label, value, trend, trendUp, icon: Icon }: {
  label: string; value: string; trend: string; trendUp: boolean; icon: React.ElementType;
}) => (
  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
    <div className="flex items-center justify-between mb-2">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div className={cn("flex items-center gap-0.5 text-xs font-medium", trendUp ? "text-success" : "text-destructive")}>
        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trend}
      </div>
    </div>
    <p className="text-2xl font-bold tracking-tight">{value}</p>
    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
  </div>
);

// --- Expanded ---

export const FinancesExpanded = () => {
  const [txFilter, setTxFilter] = useState<"all" | "income" | "expense">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const totalExpenses = expenseCategories.reduce((s, c) => s + c.value, 0);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = txFilter === "all" || tx.type === txFilter;
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Revenue" value="$7,800" trend="+28%" trendUp icon={Wallet} />
        <StatCard label="Expenses" value="$2,650" trend="+8%" trendUp={false} icon={CreditCard} />
        <StatCard label="Profit" value="$5,150" trend="+34%" trendUp icon={TrendingUp} />
        <StatCard label="Invoices Due" value="$3,420" trend="3 pending" trendUp icon={Receipt} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/40 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg text-xs">Overview</TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-lg text-xs">Transactions</TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-lg text-xs">Expenses</TabsTrigger>
          <TabsTrigger value="income" className="rounded-lg text-xs">Income</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 space-y-5">
          <div>
            <h4 className="text-sm font-semibold mb-3">Revenue vs Profit</h4>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "12px" }}
                    formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === "income" ? "Revenue" : "Profit"]}
                  />
                  <Area type="monotone" dataKey="income" stroke="hsl(var(--foreground))" strokeWidth={2} fill="url(#incGrad)" />
                  <Area type="monotone" dataKey="profit" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#profGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly spending mini chart */}
          <div>
            <h4 className="text-sm font-semibold mb-3">This Week's Spending</h4>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySpending}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "12px" }}
                    formatter={(value: number) => [`$${value}`, "Spent"]}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} opacity={0.2} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-1 min-w-[180px] bg-muted/30 border border-border/50 rounded-xl px-3 py-2">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-1">
              {(["all", "income", "expense"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTxFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
                    txFilter === f ? "bg-foreground text-background" : "bg-muted/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <button className="rounded-lg p-2 hover:bg-muted/40 transition-colors">
              <Download className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Transaction List */}
          <div className="space-y-1">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-muted/20 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    tx.type === "income" ? "bg-success/10" : "bg-muted/50"
                  )}>
                    {tx.type === "income"
                      ? <ArrowDownRight className="w-3.5 h-3.5 text-success" />
                      : <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">{tx.date}</span>
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className="text-[11px] text-muted-foreground">{tx.method}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px] rounded-md font-normal hidden sm:inline-flex">
                    {tx.category}
                  </Badge>
                  <span className={cn("text-sm font-semibold tabular-nums", tx.type === "income" ? "text-success" : "text-foreground")}>
                    {tx.type === "income" ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-4 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie chart */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Breakdown</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "12px" }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category list */}
            <div>
              <h4 className="text-sm font-semibold mb-3">By Category</h4>
              <div className="space-y-3">
                {expenseCategories.map((cat) => {
                  const pct = Math.round((cat.value / totalExpenses) * 100);
                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-sm">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium tabular-nums">${cat.value.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-sm font-bold">${totalExpenses.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Income Tab */}
        <TabsContent value="income" className="mt-4 space-y-5">
          <div>
            <h4 className="text-sm font-semibold mb-3">Revenue Sources</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {incomeSources.map((source) => (
                <div key={source.name} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{source.name}</span>
                    <span className="text-xs text-muted-foreground">{source.percentage}%</span>
                  </div>
                  <p className="text-xl font-bold tracking-tight">${source.value.toLocaleString()}</p>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-foreground/60 rounded-full" style={{ width: `${source.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly income trend */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Monthly Income Trend</h4>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "10px", fontSize: "12px" }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Income"]}
                  />
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
