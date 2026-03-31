import { BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface BedUsageProps {
  icuUsed: number;
  icuAvailable: number;
  normalUsed: number;
  normalAvailable: number;
  waiting: number;
}

const BedUsageChart = ({ icuUsed, icuAvailable, normalUsed, normalAvailable, waiting }: BedUsageProps) => {
  const totalBeds = icuUsed + icuAvailable + normalUsed + normalAvailable;

  const chartData = [
    { name: "ICU Occupied", value: icuUsed, color: "hsl(0, 100%, 60%)" },
    { name: "Normal Occupied", value: normalUsed, color: "hsl(210, 100%, 65%)" },
    { name: "Beds Available", value: icuAvailable + normalAvailable, color: "hsl(150, 100%, 45%)" },
    { name: "Waiting List", value: waiting, color: "hsl(40, 100%, 55%)" },
  ].filter((d) => d.value > 0);

  const formatTooltip = (value: number) => {
    const percent = totalBeds > 0 ? Math.round((value / totalBeds) * 100) : 0;
    return [`${value} Patients (${percent}%)`, "Count"];
  };

  return (
    <div className="stat-card h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <BarChart3 className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        </div>
        <h2 className="text-lg font-semibold text-foreground tracking-wide uppercase">Occupancy Matrix</h2>
      </div>

      <div className="flex-1 min-h-[260px] relative">
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
              stroke="currentColor"
              className="stroke-background"
              strokeWidth={2}
              animationBegin={0}
              animationDuration={1200}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{ filter: `drop-shadow(0px 0px 4px ${entry.color}44)` }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                borderRadius: "1rem",
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--popover))",
                backdropFilter: "blur(10px)",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                fontSize: "0.875rem",
                padding: "10px 14px",
                color: "hsl(var(--popover-foreground))"
              }}
              itemStyle={{ color: "hsl(var(--popover-foreground))" }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value, entry: any) => {
                const { payload } = entry;
                const percent = totalBeds > 0 ? Math.round((payload.value / totalBeds) * 100) : 0;
                return <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase ml-1">{value} ({percent}%)</span>;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-3xl font-black text-foreground drop-shadow-sm">{icuUsed + normalUsed}</div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Total<br />Occupied</div>
        </div>
      </div>
    </div>
  );
};

export default BedUsageChart;
