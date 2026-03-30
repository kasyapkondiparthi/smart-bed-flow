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
          <h2 className="text-sm font-bold text-white tracking-widest uppercase mb-0.5">Admission Velocity</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Cumulative Patient Influx</p>
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} 
              interval={Math.ceil(displayData.length / 5)}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} 
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-3 shadow-2xl">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{data.fullTime}</p>
                      <p className="text-lg font-black text-white">{data.count} <span className="text-[10px] text-slate-500 uppercase tracking-tighter ml-1">Total Patients</span></p>
                      {data.name && <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase italic">Joined: {data.name}</p>}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCount)" 
              animationDuration={2000}
              dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#0f172a" }}
              activeDot={{ r: 6, fill: "#fff", stroke: "#3b82f6", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BedUsageLineChart;
