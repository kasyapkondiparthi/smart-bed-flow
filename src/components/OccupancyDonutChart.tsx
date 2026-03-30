import { BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface OccupancyDonutChartProps {
  icuUsed: number;
  icuAvailable: number;
  normalUsed: number;
  normalAvailable: number;
}

const OccupancyDonutChart = ({ icuUsed, icuAvailable, normalUsed, normalAvailable }: OccupancyDonutChartProps) => {
  const totalBeds = icuUsed + icuAvailable + normalUsed + normalAvailable;
  
  const chartData = [
    { name: "ICU Occupied", value: icuUsed, color: "hsl(0, 100%, 65%)" }, // Red
    { name: "Normal Occupied", value: normalUsed, color: "hsl(210, 100%, 65%)" }, // Blue
    { name: "Available Beds", value: icuAvailable + normalAvailable, color: "hsl(145, 100%, 45%)" }, // Green
  ].filter((d) => d.value > 0);

  const formatTooltip = (value: number) => {
    const percent = totalBeds > 0 ? Math.round((value / totalBeds) * 100) : 0;
    return [`${value} Beds (${percent}%)`, "Count"];
  };

  return (
    <div className="glass-panel p-6 h-full flex flex-col min-h-[350px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <BarChart3 className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-widest uppercase mb-0.5">Occupancy Matrix</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time bed telemetry</p>
        </div>
      </div>

      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={5}
              dataKey="value"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={2}
              animationBegin={0}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  style={{ filter: `drop-shadow(0px 0px 8px ${entry.color}44)` }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                borderRadius: "1rem",
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 10px 40px -5px rgba(0,0,0,0.8)",
                fontSize: "0.75rem",
                padding: "10px 14px"
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value, entry: any) => {
                const { payload } = entry;
                const percent = totalBeds > 0 ? Math.round((payload.value / totalBeds) * 100) : 0;
                return <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase ml-1">{value} ({percent}%)</span>;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label */}
        <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{icuUsed + normalUsed}</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total<br/>Occupied</div>
        </div>
      </div>
    </div>
  );
};

export default OccupancyDonutChart;
