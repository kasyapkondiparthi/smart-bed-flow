import { Bed, HeartPulse, Users, Clock } from "lucide-react";

interface StatsProps {
  icuAvailable: number;
  icuTotal: number;
  normalAvailable: number;
  normalTotal: number;
  waitingCount: number;
}

const StatsCards = ({ icuAvailable, icuTotal, normalAvailable, normalTotal, waitingCount }: StatsProps) => {
  const icuUsed = icuTotal - icuAvailable;
  const icuUsagePercent = Math.round((icuUsed / icuTotal) * 100);
  const normalUsed = normalTotal - normalAvailable;
  const normalUsagePercent = Math.round((normalUsed / normalTotal) * 100);

  const icuFull = icuAvailable === 0;
  const icuWarning = icuUsagePercent >= 80 && !icuFull;

  const stats = [
    {
      label: "ICU Beds Available",
      value: icuAvailable,
      total: icuTotal,
      percentage: icuUsagePercent,
      icon: HeartPulse,
      iconBg: icuFull ? "bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "bg-red-500/10",
      iconColor: "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]",
      badge: icuFull ? "full" : icuWarning ? "warning" : "available",
      alert: icuFull ? "ICU FULL – Critical Condition" : icuWarning ? "ICU Usage > 80%" : null,
    },
    {
      label: "Normal Beds Available",
      value: normalAvailable,
      total: normalTotal,
      percentage: normalUsagePercent,
      icon: Bed,
      iconBg: "bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
      iconColor: "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]",
      badge: normalAvailable > 0 ? "available" : "full",
    },
    {
      label: "Patients Waiting",
      value: waitingCount,
      total: undefined,
      icon: Users,
      iconBg: "bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]",
      iconColor: "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]",
      badge: waitingCount > 0 ? "waiting" : "available",
    },
    {
      label: "Global Occupancy",
      value: Math.round(((icuUsed + normalUsed) / (icuTotal + normalTotal)) * 100),
      total: undefined,
      icon: Clock,
      iconBg: "bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.2)]",
      iconColor: "text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]",
      badge: undefined,
      suffix: "%",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className={`stat-card relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
              stat.alert && stat.badge === 'full' ? 'ring-2 ring-destructive ring-offset-2' : 
              stat.alert && stat.badge === 'warning' ? 'ring-2 ring-yellow-500 ring-offset-2' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              {stat.badge && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  stat.badge === 'full' ? 'bg-destructive text-destructive-foreground' :
                  stat.badge === 'warning' ? 'bg-yellow-500 text-white' :
                  stat.badge === 'waiting' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                }`}>
                  {stat.badge === "available" ? "Available" : stat.badge === "full" ? "Full" : stat.badge === "warning" ? "High Usage" : "Waiting"}
                </span>
              )}
            </div>
            
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] tracking-tight">
                {stat.value}{stat.suffix}
              </div>
              {stat.percentage !== undefined && (
                <div className="text-xs font-bold text-slate-400">
                  ({stat.percentage}%)
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-wider">
              {stat.label}
              {stat.total !== undefined && (
                <span className="text-[10px] ml-1 opacity-70"> / {stat.total} total</span>
              )}
            </p>

            {stat.alert && (
              <div className={`absolute bottom-0 left-0 right-0 py-1.5 text-[10px] font-bold text-center uppercase tracking-widest ${
                stat.badge === 'full' ? 'bg-red-500/20 text-red-500 border-t border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-yellow-500/20 text-yellow-500 border-t border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.5)]'
              }`}>
                {stat.alert}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
