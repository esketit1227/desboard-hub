import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  CreditCard, Wallet, Receipt, Filter, Download, Search, DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getSizeTier } from "./WidgetCard";

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
  { name: "Software & Tools", value: 1240, color: "hsl(220 10% 20%)" },
  { name: "Marketing", value: 860, color: "hsl(220 10% 40%)" },
  { name: "Contractors", value: 1450, color: "hsl(220 10% 55%)" },
  { name: "Office", value: 420, color: "hsl(220 10% 70%)" },
  { name: "Other", value: 280, color: "hsl(220 10% 85%)" },
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
];

const weeklySpending = [
  { day: "Mon", amount: 120 }, { day: "Tue", amount: 45 }, { day: "Wed", amount: 340 },
  { day: "Thu", amount: 80 }, { day: "Fri", amount: 210 }, { day: "Sat", amount: 15 }, { day: "Sun", amount: 0 },
];

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
        {transactions.slice(0, 3).map((t) => (
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

export const FinancesExpanded = () => {
  const totalIncome = monthlyData[monthlyData.length - 1].income;
  const totalExpenses = monthlyData[monthlyData.length - 1].expenses;
  const profit = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Revenue", value: `$${(totalIncome / 1000).toFixed(1)}k`, sub: "+28%" },
          { label: "Expenses", value: `$${(totalExpenses / 1000).toFixed(1)}k`, sub: "+12%" },
          { label: "Profit", value: `$${(profit / 1000).toFixed(1)}k`, sub: "+34%" },
        ].map(s => (
          <div key={s.label} className="bg-secondary/30 rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
      <div>
        <h4 className="text-sm font-medium mb-3">Revenue Trend</h4>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 10% 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220 10% 60%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 60%)" />
              <Tooltip />
              <Area type="monotone" dataKey="income" stroke="hsl(220 10% 30%)" fill="hsl(220 10% 30% / 0.1)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="hsl(220 10% 60%)" fill="hsl(220 10% 60% / 0.1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium mb-3">Recent Transactions</h4>
        <div className="space-y-2">
          {transactions.map(t => (
            <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/20">
              <div>
                <p className="text-sm font-medium">{t.description}</p>
                <p className="text-[10px] text-muted-foreground">{t.date} · {t.category}</p>
              </div>
              <span className={cn("text-sm font-semibold", t.amount > 0 ? "text-foreground" : "text-muted-foreground")}>
                {t.amount > 0 ? "+" : ""}{t.amount > 0 ? `$${t.amount}` : `-$${Math.abs(t.amount)}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
