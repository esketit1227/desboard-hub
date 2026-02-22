import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

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

/** Compact preview */
export const AnalyticsPreview = ({ pixelSize }: { pixelSize?: { width: number; height: number } }) => {
  const h = pixelSize?.height ?? 140;
  const w = pixelSize?.width ?? 300;

  const titleSize = h > 300 ? "text-4xl" : h > 200 ? "text-3xl" : "text-2xl";
  const labelSize = h > 300 ? "text-sm" : h > 200 ? "text-xs" : "text-[11px]";
  const statSize = w > 400 ? "text-sm" : "text-[11px]";

  const showStats = h > 160;
  const showChart = h > 200;

  return (
    <div>
      <p className={`${titleSize} font-bold tracking-tight`}>+42%</p>
      <p className={`${labelSize} text-muted-foreground mt-1`}>Revenue growth</p>
      {showStats && !showChart && (
        <div className={`flex gap-4 mt-2 ${statSize}`}>
          <span className="opacity-60">This month <span className="font-semibold opacity-100">$24.5k</span></span>
          <span className="opacity-60">Clients <span className="font-semibold opacity-100">14</span></span>
        </div>
      )}
      {showChart && (
        <div className="mt-3">
          <div className={`flex gap-4 mb-2 ${statSize}`}>
            <span className="opacity-60">Revenue <span className="font-semibold opacity-100">$24.5k</span></span>
            <span className="opacity-60">Avg. <span className="font-semibold opacity-100">$6.3k</span></span>
            {w > 350 && <span className="opacity-60">Clients <span className="font-semibold opacity-100">14</span></span>}
          </div>
          <ResponsiveContainer width="100%" height={Math.min(h - 120, 160)}>
            <BarChart data={revenueData}>
              <Bar dataKey="revenue" fill="currentColor" radius={[3, 3, 0, 0]} opacity={0.25} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

/** Full expanded view */
export const AnalyticsExpanded = () => {
  return (
    <div className="space-y-6">
      {/* Summary cards */}
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
        {/* Revenue chart */}
        <div className="p-4 rounded-xl bg-secondary/20">
          <p className="text-sm font-semibold mb-3">Revenue Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  fontSize: 12,
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project status */}
        <div className="p-4 rounded-xl bg-secondary/20">
          <p className="text-sm font-semibold mb-3">Project Status</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                  {projectStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
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

        {/* Weekly hours */}
        <div className="p-4 rounded-xl bg-secondary/20">
          <p className="text-sm font-semibold mb-3">Weekly Hours</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="hours" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by client */}
        <div className="p-4 rounded-xl bg-secondary/20">
          <p className="text-sm font-semibold mb-3">Revenue by Client</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={clientRevenue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="client" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  fontSize: 12,
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="hsl(var(--success))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
