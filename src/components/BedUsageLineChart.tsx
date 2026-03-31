import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface BedUsageLineChartProps {
  patients: any[];
}

const BedUsageLineChart = ({ patients }: BedUsageLineChartProps) => {
  // Aggregate patient admissions by hour/minute to show a trend
  const sortedPatients = [...patients].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let cumulativeCount = 0;
  const chartData = sortedPatients.map(p => {
    cumulativeCount++;
    return {
      time: format(new Date(p.createdAt), "HH:mm"),
      fullTime: format(new Date(p.createdAt), "MMM d, HH:mm"),
      count: cumulativeCount,
      name: p.name
    };
  });

  // If no patients, show empty state with a single zero point
  const displayData = chartData.length > 0 ? chartData : [{ time: "00:00", count: 0 }];

  return (
    <div className="glass-panel p-6 h-full flex flex-col min-h-[350px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <TrendingUp className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground tracking-widest uppercase mb-0.5">Admission Velocity</h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Cumulative Patient Influx</p>
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "currentColor", fontSize: 10, fontWeight: "bold" }} 
              className="text-muted-foreground/60"
              interval={Math.ceil(displayData.length / 5)}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "currentColor", fontSize: 10, fontWeight: "bold" }} 
              className="text-muted-foreground/60"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-border bg-popover/95 backdrop-blur-xl p-3 shadow-xl">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{data.fullTime}</p>
                      <p className="text-lg font-black text-popover-foreground">{data.count} <span className="text-[10px] text-muted-foreground uppercase tracking-tighter ml-1">Total Patients</span></p>
                      {data.name && <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase italic">Joined: {data.name}</p>}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCount)" 
              animationDuration={2000}
              dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
              activeDot={{ r: 6, fill: "hsl(var(--background))", stroke: "hsl(var(--primary))", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BedUsageLineChart;
