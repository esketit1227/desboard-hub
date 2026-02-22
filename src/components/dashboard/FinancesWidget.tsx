import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jul", revenue: 4200 },
  { month: "Aug", revenue: 5800 },
  { month: "Sep", revenue: 3900 },
  { month: "Oct", revenue: 7200 },
  { month: "Nov", revenue: 6100 },
  { month: "Dec", revenue: 8400 },
  { month: "Jan", revenue: 7800 },
];

const FinancesWidget = () => {
  return (
    <div className="space-y-4">
      <div className="flex gap-6">
        <div>
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="text-xl font-semibold tracking-tight">$8,420</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Expenses</p>
          <p className="text-xl font-semibold tracking-tight">$2,150</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Profit</p>
          <p className="text-xl font-semibold tracking-tight text-success">$6,270</p>
        </div>
      </div>

      <div className="h-[140px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(228 68% 55%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(228 68% 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(228 10% 48%)" }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "hsl(0 0% 100% / 0.8)",
                backdropFilter: "blur(12px)",
                border: "1px solid hsl(228 15% 90% / 0.5)",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 8px 32px -8px hsl(228 25% 8% / 0.1)",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(228 68% 55%)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancesWidget;
