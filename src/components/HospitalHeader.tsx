import { LogOut, Bell, Menu, Clock as ClockIcon, Calendar as CalendarIcon, ShieldCheck, Sun, Moon, Monitor } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { usePatients, ICU_TOTAL, NORMAL_TOTAL } from "@/context/PatientContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { applyTheme, getTheme, Theme } from "@/utils/theme";

const HospitalHeader = () => {
  const navigate = useNavigate();
  const { icuUsed, normalUsed } = usePatients();
  const [time, setTime] = useState(new Date());
  const [currentTheme, setCurrentTheme] = useState<Theme>("system");

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
    setCurrentTheme(getTheme());
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

  const handleThemeChange = (newTheme: Theme) => {
    applyTheme(newTheme);
    setCurrentTheme(newTheme);
    toast.success(`Theme switched to ${newTheme}`);
  };

  return (
    <header className="sticky top-0 z-50 h-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0 shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all">
      <div className="h-full px-6 flex items-center justify-between">
        
        {/* LEFT: Live Clock & Date */}
        <div className="flex items-center gap-6 min-w-[200px]">
          <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-2xl border border-border shadow-inner">
            <ClockIcon className="w-4 h-4 text-primary animate-pulse" />
            <div className="flex flex-col">
              <span className="text-lg font-black font-mono text-foreground tracking-widest leading-none">
                {format(time, "hh:mm:ss a")}
              </span>
              <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">
                Triage Heartbeat
              </span>
            </div>
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3 text-muted-foreground/60" />
              {format(time, "MMMM dd, yyyy")}
            </span>
          </div>
        </div>
        
        {/* CENTER: Branding */}
        <div className="hidden md:flex flex-col items-center">
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheck className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <h1 className="text-lg font-black text-foreground dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-slate-400 uppercase tracking-[0.2em] drop-shadow-sm">
              Hospital Command Center
            </h1>
          </div>
          <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.4em] ml-6">
            Bed Allocation Intelligence
          </p>
        </div>

        {/* RIGHT: Shift Controls & Theme Switcher */}
        <div className="flex items-center gap-4 min-w-[240px] justify-end">
          {/* Theme Switcher Toggle */}
          <div className="flex bg-muted/80 p-1 rounded-xl border border-border items-center">
            <button 
              onClick={() => handleThemeChange("light")}
              className={cn("p-1.5 rounded-lg transition-all", currentTheme === "light" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => handleThemeChange("dark")}
              className={cn("p-1.5 rounded-lg transition-all", currentTheme === "dark" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => handleThemeChange("system")}
              className={cn("p-1.5 rounded-lg transition-all", currentTheme === "system" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
              title="System Default"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-8 bg-border mx-1" />

          <div className={cn("hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500", status.bg, status.border, status.shadow)}>
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]", status.label === 'STABLE' ? 'bg-green-500' : status.label === 'WARNING' ? 'bg-yellow-500' : 'bg-red-500')} />
            <span className={cn("text-[9px] font-black tracking-widest uppercase", status.color)}>Shift: {status.label}</span>
          </div>
          
          <Button
            onClick={handleLogout}
            className="h-10 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white border border-destructive/30 hover:border-destructive rounded-xl px-5 font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] gap-2 group"
          >
            <LogOut className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default HospitalHeader;
