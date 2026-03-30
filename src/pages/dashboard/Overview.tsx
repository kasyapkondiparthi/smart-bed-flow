import { Loader2, AlertTriangle, AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StatsCards from "@/components/StatsCards";
import BedUsageChart from "@/components/BedUsageChart";
import SeverityBarChart from "@/components/SeverityBarChart";
import BedUsageLineChart from "@/components/BedUsageLineChart";
import { usePatients, ICU_TOTAL, NORMAL_TOTAL } from "@/context/PatientContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const Overview = () => {
  const { 
    icuAvailable, 
    normalAvailable, 
    waitingCount, 
    icuUsed, 
    normalUsed,
    initialLoading,
    patients,
    history
  } = usePatients();

  if (initialLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground font-mono uppercase tracking-widest">Initializing Neural Engine...</p>
        </div>
      </div>
    );
  }

  // Distribution Stats
  const severityStats = {
    critical: patients.filter(p => p.severity === "Critical").length,
    moderate: patients.filter(p => p.severity === "Moderate").length,
    low: patients.filter(p => p.severity === "Low").length
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-purple-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Command Center</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium font-mono uppercase tracking-wider">Real-time hospital monitoring & smart allocation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_rgba(236,72,153,1)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Live Telemetry</span>
          </div>
        </div>
      </div>

      {/* Smart Alerts */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        {icuAvailable === 0 ? (
          <Alert variant="destructive" className="border border-destructive/50 bg-destructive/10 shadow-[0_0_20px_rgba(239,68,68,0.3)] backdrop-blur-md">
            <AlertCircle className="h-5 w-5 text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <AlertTitle className="text-lg font-bold text-destructive drop-shadow-md">ICU FULL – CRITICAL CONDITION</AlertTitle>
            <AlertDescription className="text-slate-300 font-medium">
              System capacity exhausted. New critical patients will be placed on the prioritized waitlist immediately.
            </AlertDescription>
          </Alert>
        ) : icuUsed / ICU_TOTAL > 0.8 ? (
          <Alert className="border border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.2)] backdrop-blur-md transition-all">
            <AlertTriangle className="h-5 w-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
            <AlertTitle className="text-lg font-bold text-yellow-500 drop-shadow-md tracking-wider uppercase">ICU Usage Warning</AlertTitle>
            <AlertDescription className="text-slate-300 font-medium">
              ICU capacity is over 80%. Consider triage protocols and discharging stable patients.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border border-green-500/30 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.1)] backdrop-blur-md transition-all">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]" />
              <AlertTitle className="text-sm font-bold m-0 leading-none text-green-400 drop-shadow-sm uppercase tracking-widest">Neural System Stable</AlertTitle>
            </div>
            <AlertDescription className="text-xs text-slate-500 font-bold uppercase tracking-tighter">
              Sufficient beds available. Predictive allocation active for incoming triage.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Row 1: Global Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <StatsCards
          icuAvailable={icuAvailable}
          icuTotal={ICU_TOTAL}
          normalAvailable={normalAvailable}
          normalTotal={NORMAL_TOTAL}
          waitingCount={waitingCount}
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <BedUsageChart
          icuUsed={icuUsed}
          icuAvailable={icuAvailable}
          normalUsed={normalUsed}
          normalAvailable={normalAvailable}
          waiting={waitingCount}
        />
        <SeverityBarChart
          data={severityStats}
        />
      </motion.div>

      {/* Row 3: Admission Velocity & Recent Timeline */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Line Chart (2 cols) */}
        <div className="lg:col-span-2">
          <BedUsageLineChart patients={patients} />
        </div>

        {/* Recent Activity Timeline (1 col) - Now using HISTORY for a true Audit Log */}
        <div className="glass-panel flex flex-col min-h-[350px]">
          <div className="p-5 border-b border-white/5 bg-black/20 flex items-center justify-between">
            <h2 className="font-bold text-sm text-white uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary animate-pulse" />
              Shift Audit Log
            </h2>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Feed</span>
          </div>
          <div className="p-0 flex-1 overflow-auto max-h-[400px]">
            {history.length === 0 ? (
              <div className="p-12 text-center text-slate-600 text-sm font-bold uppercase tracking-widest italic leading-relaxed">
                Initial Shift State:<br/>Awaiting triage events...
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {[...history].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10).map(entry => (
                  <div key={entry.timestamp} className="p-4 hover:bg-white/5 transition-all flex items-start gap-3 group cursor-default">
                    <div className={cn(
                      "mt-1 w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]",
                      entry.actionType === 'Added' ? 'bg-green-500 text-green-500' :
                      entry.actionType === 'Updated' ? 'bg-blue-500 text-blue-500' :
                      'bg-red-500 text-red-500'
                    )} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-bold text-xs text-slate-200 group-hover:text-white transition-colors">{entry.name}</p>
                        <span className="text-[9px] text-slate-600 font-black uppercase tracking-tighter shrink-0">{formatDistanceToNow(new Date(entry.timestamp))} ago</span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                        {entry.actionType === 'Added' ? 'Admitted to ' : entry.actionType === 'Updated' ? 'Reassigned to ' : 'Discharged from '}
                        <span className="text-slate-300 font-bold">{entry.assignedBed}</span>
                        {entry.bedNumber && <span className="ml-1 text-primary">[{entry.bedNumber}]</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-3 border-t border-white/5 bg-black/10">
            <p className="text-[9px] font-black text-center text-slate-500 uppercase tracking-[0.2em]">Operational Pulse Stream Active</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Overview;
