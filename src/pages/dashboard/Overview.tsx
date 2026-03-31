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

  const icuUsagePercent = Math.round((icuUsed / ICU_TOTAL) * 100);

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
      {/* Professional Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 border border-white/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-all duration-1000" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tighter mb-2 border-b-4 border-white/30 pb-2 inline-block">Command Center</h1>
          <p className="text-blue-100/90 text-sm font-bold mt-2 max-w-md leading-relaxed">
            Real-time occupancy monitoring and <span className="text-emerald-300">predictive neural allocation</span> for critical care environments.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-inner">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300">Neurolink Live</span>
          </div>
        </div>
      </div>

      {/* Smart Alerts Section */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        {icuAvailable === 0 ? (
          <Alert variant="destructive" className="border-red-500/50 bg-red-500/5 backdrop-blur-md shadow-2xl rounded-2xl border-l-8">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-xl font-black text-red-600 dark:text-red-400 uppercase tracking-tighter italic mb-1">CRITICAL: ICU CAPACITY EXHAUSTED</AlertTitle>
            <AlertDescription className="text-gray-800 dark:text-gray-200 font-bold text-sm leading-relaxed">
              Immediate triage redirect active. All new high-acuity cases are being buffered in the priority waiting registry. <span className="underline decoration-red-500/50 underline-offset-4">Emergency resource reallocation required.</span>
            </AlertDescription>
          </Alert>
        ) : icuUsed / ICU_TOTAL > 0.8 ? (
          <Alert className="border-amber-500/50 bg-amber-500/5 backdrop-blur-md shadow-xl rounded-2xl border-l-8">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-xl font-black text-amber-600 dark:text-amber-400 uppercase tracking-tighter italic mb-1">High Occupancy Threshold</AlertTitle>
            <AlertDescription className="text-gray-800 dark:text-gray-200 font-bold text-sm leading-relaxed">
              ICU telemetry indicates <span className="text-amber-600 dark:text-amber-400">{icuUsagePercent}% load</span>. Pre-emptive discharge screening for stable patients is highly recommended.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md shadow-sm rounded-2xl py-4">
             <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <div>
                 <AlertTitle className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] m-0">Neural Core Operating Nominal</AlertTitle>
                 <AlertDescription className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                   Sufficient capacity across all wards. System executing predictive triage.
                 </AlertDescription>
               </div>
             </div>
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
        <div className="glass-panel flex flex-col min-h-[450px] border-t-4 border-t-primary">
          <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
            <div>
              <h2 className="font-black text-sm text-foreground uppercase tracking-[0.15em] flex items-center gap-2 mb-1">
                Clinical Audit Log
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Real-time Telemetry Stream</span>
              </div>
            </div>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="p-0 flex-1 overflow-auto max-h-[500px] custom-scrollbar">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic leading-relaxed">
                  Awaiting triage events...<br/>Neural registry initializing
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {[...history].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15).map((entry, idx) => (
                  <div key={`${entry.timestamp}-${idx}`} className="p-5 hover:bg-muted/30 transition-all flex items-start gap-4 group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5 bg-transparent group-hover:bg-primary/30" />
                    <div className={cn(
                      "mt-1 w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_12px_currentColor] transition-transform group-hover:scale-150",
                      entry.actionType === 'Added' ? 'bg-emerald-500 text-emerald-500' :
                      entry.actionType === 'Updated' ? 'bg-blue-500 text-blue-500' :
                      'bg-rose-500 text-rose-500'
                    )} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <p className="font-bold text-sm text-foreground tracking-tight group-hover:text-primary transition-colors">{entry.name}</p>
                        <span className="text-[9px] text-muted-foreground font-black px-2 py-0.5 rounded-md bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-all uppercase tracking-tighter shrink-0">{formatDistanceToNow(new Date(entry.timestamp))} ago</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border leading-none shadow-sm",
                          entry.actionType === 'Added' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          entry.actionType === 'Updated' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                          'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        )}>
                          {entry.actionType}
                        </span>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
                          Allocated to <span className="text-foreground/90">{entry.assignedBed}</span>
                          {entry.bedNumber && <span className="h-4 w-[1px] bg-border mx-0.5" />}
                          {entry.bedNumber && <span className="text-primary font-black tracking-normal">[{entry.bedNumber}] Floor {entry.floorNumber}</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-border bg-muted/5">
            <p className="text-[9px] font-black text-center text-muted-foreground uppercase tracking-[0.25em] opacity-60">System Core Pulse Active • End of Stream</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Overview;
