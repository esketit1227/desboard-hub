import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
import { getSizeTier } from "./WidgetCard";

const revenueData = [
  { month: "Sep", revenue: 8200 },
  { month: "Oct", revenue: 12400 },
  { month: "Nov", revenue: 9800 },
  { month: "Dec", revenue: 15600 },
  { month: "Jan", revenue: 18200 },
  { month: "Feb", revenue: 24500 },
];

const projectStatusData = [
  { name: "Completed", value: 8, color: "hsl(var(--success))" },
  { name: "In Progress", value: 4, color: "hsl(var(--primary))" },
  { name: "On Hold", value: 2, color: "hsl(var(--warning))" },
];

const weeklyHours = [
  { day: "Mon", hours: 6.5 },
  { day: "Tue", hours: 8 },
  { day: "Wed", hours: 7.5 },
  { day: "Thu", hours: 9 },
  { day: "Fri", hours: 5 },
  { day: "Sat", hours: 3 },
  { day: "Sun", hours: 0 },
];

const clientRevenue = [
  { client: "Flux Labs", revenue: 12500 },
  { client: "Mono Studio", revenue: 18200 },
  { client: "Nextwave", revenue: 9400 },
  { client: "Acme Corp", revenue: 6800 },
];

/** Compact preview — growth % + sparkline */
export const AnalyticsPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const tier = getSizeTier(pixelSize);

  if (tier === "compact") {
    return (
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl font-bold tracking-tight leading-none">+42%</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Growth</p>
          </div>
          <TrendingUp className="w-5 h-5 text-muted-foreground/40" />
        </div>
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-muted-foreground">$24.5k this month</span>
            <span className="text-[9px] text-muted-foreground">14 clients</span>
          </div>
          <div className="flex items-end gap-[3px] h-[24px]">
            {revenueData.map((d, i) => (
              <div key={i} className="flex-1 rounded-sm bg-foreground/15" style={{ height: `${(d.revenue / 24500) * 100}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tier === "standard") {
    return (
      <div className="flex flex-col h-full gap-1.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight leading-none">+42%</p>
            <p className="text-[10px] text-muted-foreground">Growth Rate</p>
          </div>
          <TrendingUp className="w-4 h-4 text-muted-foreground/40" />
        </div>
        <div className="flex items-center gap-3 mt-1">
          <div className="text-center">
            <p className="text-xs font-bold">$24.5k</p>
            <p className="text-[8px] text-muted-foreground">Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold">39h</p>
            <p className="text-[8px] text-muted-foreground">This week</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold">14</p>
            <p className="text-[8px] text-muted-foreground">Projects</p>
          </div>
        </div>
        <div className="flex items-end gap-[3px] mt-auto h-[28px]">
          {revenueData.map((d, i) => (
            <div key={i} className="flex-1 rounded-sm bg-foreground/15" style={{ height: `${(d.revenue / 24500) * 100}%` }} />
          ))}
        </div>
      </div>
    );
  }

  // expanded
  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-start justify-between">
        <p className="text-lg font-bold leading-none">+42% <span className="text-sm font-normal text-muted-foreground">growth</span></p>
        <TrendingUp className="w-4 h-4 text-success" />
      </div>
      <div className="grid grid-cols-4 gap-1.5 mt-1">
        {[
          { label: "Revenue", value: "$24.5k" },
          { label: "Avg. Value", value: "$6.3k" },
          { label: "Hours", value: "39h" },
          { label: "Retention", value: "92%" },
        ].map(s => (
          <div key={s.label} className="bg-muted/30 rounded-lg p-1.5 text-center">
            <p className="text-[10px] font-bold">{s.value}</p>
            <p className="text-[7px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 flex items-end gap-[3px] min-h-[40px]">
        {revenueData.map((d, i) => (
          <div key={i} className="flex-1 rounded-sm bg-foreground/15" style={{ height: `${(d.revenue / 24500) * 100}%` }} />
        ))}
      </div>
      <div className="flex items-center justify-between text-[8px] text-muted-foreground">
        {revenueData.map((d, i) => <span key={i}>{d.month}</span>)}
      </div>
      <div className="flex items-center gap-2 pt-1 border-t border-border/30">
        {projectStatusData.map(s => (
          <div key={s.name} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[8px] text-muted-foreground">{s.value} {s.name.toLowerCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Full expanded view */
export const AnalyticsExpanded = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: "$88.7k", sub: "Last 6 months" },
          { label: "Avg. Project Value", value: "$6.3k", sub: "14 projects" },
          { label: "Hours This Week", value: "39h", sub: "+4h vs last week" },
          { label: "Client Retention", value: "92%", sub: "12 of 13 clients" },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-xl bg-secondary/30">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-bold mt-1">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-secondary/20">
          <p className="text-sm font-semibold mb-3">Revenue Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 12 }} formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 rounded-xl bg-secondary/20">
          <p className="text-sm font-semibold mb-3">Project Status</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                  {projectStatusData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {projectStatusData.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs">{s.name}</span>
                  <span className="text-xs font-bold ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-secondary/20">
          <p className="text-sm font-semibold mb-3">Weekly Hours</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 12 }} />
              <Bar dataKey="hours" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 rounded-xl bg-secondary/20">
          <p className="text-sm font-semibold mb-3">Revenue by Client</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={clientRevenue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="client" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 12 }} formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="hsl(var(--success))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};