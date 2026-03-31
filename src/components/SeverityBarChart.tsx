import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Activity } from "lucide-react";

interface SeverityBarChartProps {
  data: {
    critical: number;
    moderate: number;
    low: number;
  };
}

const SeverityBarChart = ({ data }: SeverityBarChartProps) => {
  const chartData = [
    { name: "Critical", count: data.critical, color: "hsl(0, 100%, 65%)" },
    { name: "Moderate", count: data.moderate, color: "hsl(45, 100%, 60%)" },
    { name: "Low", count: data.low, color: "hsl(145, 100%, 45%)" },
  ];

  return (
    <div className="glass-panel p-6 h-full flex flex-col min-h-[350px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <Activity className="w-5 h-5 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground tracking-widest uppercase mb-0.5">Clinical Severity</h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Awaiting Triage Distribution</p>
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "currentColor", fontSize: 10, fontWeight: "bold" }} 
              className="text-muted-foreground/60"
              padding={{ left: 20, right: 20 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "currentColor", fontSize: 10, fontWeight: "bold" }} 
              className="text-muted-foreground/60"
            />
            <Tooltip
              cursor={{ fill: "currentColor", opacity: 0.1 }}
              contentStyle={{
                borderRadius: "1rem",
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--popover))",
                backdropFilter: "blur(20px)",
                boxShadow: "0 10px 40px -5px rgba(0,0,0,0.1)",
                fontSize: "0.75rem",
                padding: "10px 14px",
                color: "hsl(var(--popover-foreground))"
              }}
              itemStyle={{ color: "hsl(var(--popover-foreground))" }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40} animationDuration={1800}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  style={{ filter: `drop-shadow(0px 0px 4px ${entry.color}33)` }} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SeverityBarChart;
