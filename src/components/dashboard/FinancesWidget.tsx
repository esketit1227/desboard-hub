import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const data = [
  { month: "Jul", revenue: 4200 },
  { month: "Aug", revenue: 5800 },
  { month: "Sep", revenue: 3900 },
  { month: "Oct", revenue: 7200 },
  { month: "Nov", revenue: 6100 },
  { month: "Dec", revenue: 8400 },
  { month: "Jan", revenue: 7800 },
];

/** Compact preview */
export const FinancesPreview = () => (
  <div>
    <p className="text-3xl font-bold tracking-tight">$24.5k</p>
    <p className="text-xs text-muted-foreground mt-1">Total Revenue</p>
    <div className="h-[50px] mt-3 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <Bar dataKey="revenue" fill="hsl(72 95% 49%)" radius={[3, 3, 0, 0]} opacity={0.6} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

/** Full expanded view */
export const FinancesExpanded = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 rounded-xl bg-secondary/30">
        <p className="text-xs text-muted-foreground">Income</p>
        <p className="text-2xl font-bold tracking-tight mt-1">$8,420</p>
      </div>
      <div className="p-4 rounded-xl bg-secondary/30">
        <p className="text-xs text-muted-foreground">Expenses</p>
        <p className="text-2xl font-bold tracking-tight mt-1">$2,150</p>
      </div>
      <div className="p-4 rounded-xl bg-primary/10">
        <p className="text-xs text-muted-foreground">Profit</p>
        <p className="text-2xl font-bold tracking-tight text-success mt-1">$6,270</p>
      </div>
    </div>

    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(72 95% 49%)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(72 95% 49%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "hsl(0 0% 38%)" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "hsl(0 0% 38%)" }}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(0 0% 100% / 0.9)",
              backdropFilter: "blur(12px)",
              border: "1px solid hsl(65 10% 75% / 0.5)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(72 95% 49%)"
            strokeWidth={2}
            fill="url(#revGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);
