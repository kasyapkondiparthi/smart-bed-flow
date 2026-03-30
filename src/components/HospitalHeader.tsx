import { LogOut, Bell, Menu, Clock as ClockIcon, Calendar as CalendarIcon, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { usePatients, ICU_TOTAL, NORMAL_TOTAL } from "@/context/PatientContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const HospitalHeader = () => {
  const navigate = useNavigate();
  const { handleReset, history, icuUsed, normalUsed } = usePatients();
  const [time, setTime] = useState(new Date());

  const totalUsed = icuUsed + normalUsed;
  const totalCapacity = ICU_TOTAL + NORMAL_TOTAL;
  const occupancyRate = (totalUsed / totalCapacity) * 100;

  const getShiftStatus = () => {
    if (icuUsed === ICU_TOTAL || occupancyRate > 90) return { label: "CRITICAL", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30", shadow: "shadow-[0_0_15px_rgba(239,68,68,0.3)]" };
    if (occupancyRate > 70) return { label: "WARNING", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", shadow: "shadow-[0_0_15px_rgba(234,179,8,0.2)]" };
    return { label: "STABLE", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30", shadow: "shadow-[0_0_15px_rgba(34,197,94,0.15)]" };
  };

  const status = getShiftStatus();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed");
    } else {
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  const handleEndShift = async () => {
    const confirmed = window.confirm("ATTENTION: Are you sure you want to end the shift? This will generate a shift report and CLEAR the current active patient registry.");
    if (!confirmed) return;

    try {
      // 1. Export History before reset
      if (history.length > 0) {
        const headers = ["Patient Name", "Action", "Severity", "Bed", "Floor", "Time"];
        const rows = history.map(h => [
          `"${h.name}"`, h.actionType, h.severity, h.bedNumber || "N/A", h.floorNumber || "N/A", format(new Date(h.timestamp), "yyyy-MM-dd HH:mm:ss")
        ]);
        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `shift_end_audit_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
        link.click();
      }

      // 2. Reset System
      await handleReset();
      toast.success("Shift ended successfully. Administrative audit log preserved.");
    } catch (error) {
      toast.error("Shift termination failed");
    }
  };

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-border bg-slate-900/60 backdrop-blur-2xl shrink-0 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
      <div className="h-full px-6 flex items-center justify-between">
        
        {/* LEFT: Live Clock & Date */}
        <div className="flex items-center gap-6 min-w-[240px]">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 shadow-inner">
            <ClockIcon className="w-4 h-4 text-primary animate-pulse" />
            <div className="flex flex-col">
              <span className="text-lg font-black font-mono text-white tracking-widest leading-none">
                {format(time, "hh:mm:ss a")}
              </span>
              <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500">
                Triage Heartbeat
              </span>
            </div>
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3 text-slate-500" />
              {format(time, "MMMM dd, yyyy")}
            </span>
          </div>
        </div>
        
        {/* CENTER: Branding */}
        <div className="hidden md:flex flex-col items-center">
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheck className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 uppercase tracking-[0.2em] drop-shadow-sm">
              Hospital Command Center
            </h1>
          </div>
          <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.4em] ml-6">
            Bed Allocation Intelligence
          </p>
        </div>

        {/* RIGHT: Shift Controls */}
        <div className="flex items-center gap-4 min-w-[240px] justify-end">
          <div className={cn("hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500", status.bg, status.border, status.shadow)}>
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]", status.label === 'STABLE' ? 'bg-green-500' : status.label === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500')} />
            <span className={cn("text-[9px] font-black tracking-widest uppercase", status.color)}>Shift: {status.label}</span>
          </div>

          <div className="w-px h-8 bg-white/10 mx-2" />
          
          <Button
            onClick={handleEndShift}
            className="h-10 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white border border-destructive/30 hover:border-destructive rounded-xl px-5 font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] gap-2 group"
          >
            <LogOut className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            End Shift
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HospitalHeader;
