import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BedDouble, Activity, ShieldCheck, ArrowRight, Layers, LayoutDashboard, Database, Zap, Clock, User, AlertCircle, CheckCircle2, X, Sun, Moon, Monitor } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { usePatients } from "@/context/PatientContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { applyTheme, getTheme } from "../utils/theme.ts";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const { fetchPatientsList, patients } = usePatients();
  const [currentTheme, setCurrentTheme] = useState(getTheme());

  // Auto-Allocation Sync (Neural Engine)
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      // Re-trigger global reallocation to promote waiting patients
      await fetchPatientsList(true);
    }, 20000); // 20s sync
    return () => clearInterval(syncInterval);
  }, [fetchPatientsList]);

  const [selfBooking, setSelfBooking] = useState({
    name: "",
    severity: "Low" as any,
    needsICU: false
  });
  
  const [inQueue, setInQueue] = useState(false);
  const [queueTime, setQueueTime] = useState(0);
  const [bookingStatus, setBookingStatus] = useState<"Queue" | "Waiting" | "Confirmed" | "Idle">("Idle");
  const [showPanel, setShowPanel] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [allocationDetails, setAllocationDetails] = useState<{ bedNumber: string; floorNumber: number; roomNumber: string } | null>(null);

  const handleThemeChange = (newTheme: any) => {
    applyTheme(newTheme);
    setCurrentTheme(newTheme);
  };

  const checkBeds = async () => {
    const { data } = await supabase.from("patients").select("assigned_bed");
    const icuUsed = (data || []).filter(p => p.assigned_bed === "ICU").length;
    const normalUsed = (data || []).filter(p => p.assigned_bed === "Normal").length;

    return {
      icuAvailable: 10 - icuUsed,
      normalAvailable: 30 - normalUsed
    };
  };

  const processBooking = async (patient: any) => {
    setIsProcessing(true);

    if (patient.severity === "Critical") {
      // Critical: Instant allocation — no waiting
      const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
      const bedNumber = `ICU-${shortId}`;
      const floorNumber = 1;
      const roomNumber = `Room ${101 + Math.floor(Math.random() * 10)}`;

      const { error } = await supabase.from("patients").insert([{
        name: patient.name as string,
        severity: "Critical" as "Critical",
        needs_icu: true,
        assigned_bed: "ICU" as "ICU",
        bed_number: bedNumber,
        floor_number: floorNumber,
        status: "Confirmed"
      }] as any);

      if (error) {
        console.error("[Hospital OS] CRITICAL DISPATCH ERROR:", error.code, error.message);
        toast.error("Emergency Admission Failed", { description: error.message });
        setIsProcessing(false);
        return;
      }

      setAllocationDetails({ bedNumber, floorNumber, roomNumber });
      setBookingStatus("Confirmed");
      toast.success(`🚨 Emergency Bed Assigned — ${bedNumber}`, {
        description: `Floor ${floorNumber} • ${roomNumber}. Proceed immediately.`
      });
      setIsProcessing(false);
      return;
    }

    // Non-critical: Goes to Pending Triage Review
    const { error } = await supabase.from("patients").insert([{
      name: patient.name as string,
      severity: patient.severity as "Low" | "Moderate" | "Critical",
      needs_icu: patient.needsICU as boolean,
      assigned_bed: "Waiting" as "Waiting"
    }] as any);

    if (error) {
      console.error("[Hospital OS] REGISTRY INSERTION ERROR:", error.code, error.message, error.details);
      toast.error("Registry Insertion Failed", {
        description: error.message || ("Code: " + error.code)
      });
      setIsProcessing(false);
      return;
    }

    setBookingStatus("Waiting");
    toast.info("Added to Pending Triage Review", {
      description: `${patient.name} is now in the queue. Staff will allocate a bed via Batch Allocate.`
    });
    setIsProcessing(false);
  };

  const handleBooking = async (patient: any) => {
    if (!patient.name.trim()) {
      toast.error("Clinical identification required.");
      return;
    }

    setIsProcessing(true);
    setBookingStatus("Idle"); 
    
    // Duplicate Trace
    const { data: exists } = await supabase
      .from("patients")
      .select("id")
      .eq("name", patient.name);

    if (exists && exists.length > 0) {
      toast.error("Patient Record Found", {
        description: "An active registry entry already exists for this identification."
      });
      setIsProcessing(false);
      return;
    }

    // Clinical Processing Delay (Simulating Neural Verification)
    setBookingStatus("Idle");
    
    setTimeout(async () => {
      // Immediate Internal Dispatch (Direct to Waiting/Confirmed status)
      await processBooking(patient);
    }, 5000); // 5-second medical sync delay
  };


  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 relative overflow-hidden font-jakarta flex flex-col transition-all duration-500">
      {/* Dynamic Grid Overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)] opacity-50" />
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" 
        style={{ 
          backgroundImage: 'linear-gradient(#4a90e2 1px, transparent 1px), linear-gradient(90deg, #4a90e2 1px, transparent 1px)',
          backgroundSize: '40px 40px' 
        }} 
      />

      {/* Premium Background Gradient */}
      <div className="absolute inset-0 z-[-1] bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-900 dark:via-blue-800 dark:to-black transition-all duration-700" />

      <header className="relative z-20 border-b border-gray-200 dark:border-white/5 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter italic text-gray-900 dark:text-white line-height-1">SMART BED <span className="text-blue-500">FLOW</span></h1>
            <p className="text-[10px] font-bold text-gray-500 dark:text-slate-500 uppercase tracking-widest leading-none">Global Allocation Engine • v2.4</p>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          {/* Premium Theme Switcher Toggle */}
          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-200 dark:border-white/10 items-center backdrop-blur-sm">
            <button 
              onClick={() => handleThemeChange("light")}
              className={cn(
                "p-2 rounded-xl transition-all duration-300", 
                currentTheme === "light" 
                  ? "bg-white dark:bg-blue-600 shadow-md text-blue-600 dark:text-white scale-110" 
                  : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              )}
              title="Light Mode"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleThemeChange("dark")}
              className={cn(
                "p-2 rounded-xl transition-all duration-300", 
                currentTheme === "dark" 
                  ? "bg-white dark:bg-blue-600 shadow-md text-blue-600 dark:text-white scale-110" 
                  : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              )}
              title="Dark Mode"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleThemeChange("system")}
              className={cn(
                "p-2 rounded-xl transition-all duration-300", 
                currentTheme === "system" 
                  ? "bg-white dark:bg-blue-600 shadow-md text-blue-600 dark:text-white scale-110" 
                  : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              )}
              title="System Default"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">System Live</span>
          </div>
          <Button 
            onClick={() => navigate("/login")} 
            variant="ghost" 
            className="text-xs font-bold uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
          >
            Staff Login
          </Button>
        </div>
      </header>

      <main className="relative z-10 pt-20 pb-20 px-6 font-primary">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Enterprise Ready</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-gray-900 dark:text-white leading-[0.9]">
                  Smart <span className="text-blue-600 italic">Hospital</span> <br />
                  Bed Allocation.
                </h1>
                <p className="text-lg text-gray-600 dark:text-slate-400 font-medium max-w-lg leading-relaxed">
                  The next generation of triage management. Real-time neural bed tracking and priority-based patient routing for mission-critical medical environments.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => navigate("/login")}
                  className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.5)] transition-all group border-0"
                >
                  Enter Command Center
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="ghost"
                  className="h-14 px-8 text-gray-500 dark:text-slate-500 font-bold hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Technical Specs
                </Button>
              </div>
            </div>

            <div className="relative animate-in zoom-in duration-1000 hidden lg:block">
              <div className="relative overflow-hidden rounded-[2.5rem] border-[12px] border-white/50 dark:border-slate-800 shadow-2xl bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl aspect-[4/3] flex items-center justify-center p-8 group">
                <div className="grid grid-cols-2 gap-6 w-full opacity-60 group-hover:opacity-100 transition-all duration-700 scale-95 group-hover:scale-100">
                   <div className="h-40 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex flex-col items-center justify-center gap-3">
                      <Layers className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      <span className="font-bold text-xs uppercase tracking-widest text-blue-800 dark:text-blue-300">Bed Analytics</span>
                   </div>
                   <div className="h-40 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 flex flex-col items-center justify-center gap-3">
                      <LayoutDashboard className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-xs uppercase tracking-widest text-emerald-800 dark:text-emerald-300">Real-time Map</span>
                   </div>
                   <div className="h-40 rounded-3xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 flex flex-col items-center justify-center gap-3">
                      <Database className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      <span className="font-bold text-xs uppercase tracking-widest text-purple-800 dark:text-purple-300">Neural Sync</span>
                   </div>
                   <div className="h-40 rounded-3xl bg-blue-600 flex flex-col items-center justify-center gap-3 text-white">
                      <Zap className="w-8 h-8 fill-current" />
                      <span className="font-bold text-xs uppercase tracking-widest">Instant Triage</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Hook */}
          <div id="features" className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-100 dark:border-white/5 shadow-sm transition-all group hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <BedDouble className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Hospital Command</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                A comprehensive dashboard for medical staff to manage real-time bed allocations and patient flow.
              </p>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-100 dark:border-white/5 shadow-sm transition-all group hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Real-time Triage</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                Dynamic patient prioritization based on clinical severity, ensuring critical cases get immediate care.
              </p>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-100 dark:border-white/5 shadow-sm transition-all group hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Neural Allocation</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                Advanced algorithms that automatically route patients to the most suitable floors and wards.
              </p>
            </div>
          </div>

          {/* Tech Section */}
          <div id="tech" className="mt-40 text-center space-y-16">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Mission Critical Stack</h2>
              <p className="text-gray-500 dark:text-slate-500 font-medium tracking-wide">Enterprise-grade architecture for zero-downtime medical operations.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-blue-500/30 transition-all">
                 <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">Supabase</h3>
                 <p className="text-gray-500 dark:text-slate-500 text-sm leading-relaxed font-medium">
                    Real-time PostgreSQL engine for instant data synchronization across all medical terminals.
                 </p>
              </div>
              <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-sky-500/30 transition-all">
                 <h3 className="text-xl font-bold text-sky-600 dark:text-sky-400 mb-2">React 18</h3>
                 <p className="text-gray-500 dark:text-slate-500 text-sm leading-relaxed font-medium">
                    High-performance UI layer ensuring medical staff aren't slowed down by latency or lag.
                 </p>
              </div>
              <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-indigo-500/30 transition-all">
                 <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Edge Routing</h3>
                 <p className="text-gray-500 dark:text-slate-500 text-sm leading-relaxed font-medium">
                    Optimized allocation logic running on global edge network for sub-millisecond response times.
                 </p>
              </div>
              <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-blue-800/30 transition-all">
                 <h3 className="text-xl font-bold text-blue-800 dark:text-blue-600 mb-2">Medical Edge</h3>
                 <p className="text-gray-500 dark:text-slate-500 text-sm leading-relaxed font-medium">
                    Designed for clinicians, with a focus on speed, reliability, and human-centric design.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-12 py-8 mt-auto flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex gap-8 text-gray-900 dark:text-white">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Active Floors</span>
               <span className="text-sm font-bold italic">02 Clinical Wings</span>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Live Sensors</span>
               <span className="text-sm font-bold italic">Active Monitoring</span>
            </div>
         </div>
         <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-center md:text-right">
           © 2026 Smart Bed Flow • Built for Mission Critical Healthcare <br />
           Authorized Personnel Only • Privacy Policy • HIPAA Compliant
         </p>
      </footer>

      {/* High-Priority Booking Side Panel */}
  <div 
    className={`fixed top-0 right-0 h-full w-[350px] sm:w-[400px] bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-50 z-[100] shadow-[0_0_50px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-in-out p-8 flex flex-col ${showPanel ? 'translate-x-0' : 'translate-x-full'}`}
  >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-black uppercase tracking-tighter italic">Patient Portal</h2>
          </div>
          <button 
            onClick={() => setShowPanel(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="mb-8">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Self Booking</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
              Register into the triage system immediately. Your case will be evaluated based on clinical priority.
            </p>
          </div>


          {bookingStatus === "Waiting" ? (
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-[2.5rem] p-8 border border-amber-200/50 dark:border-amber-900/30 text-center space-y-5 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg">Pending Triage Review</p>
                <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed font-medium">
                  You are now in the triage queue. Medical staff will review your case and assign a bed using <strong>Batch Allocate</strong>.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 text-left">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-800/30">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Status: Awaiting Staff Allocation</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-800/30">
                  <Zap className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Use Batch Allocate in Patient Allocation</span>
                </div>
              </div>
              <Button
                onClick={() => { setBookingStatus("Idle"); setSelfBooking({ name: "", severity: "Low", needsICU: false }); }}
                variant="outline"
                className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
              >
                Book Another Patient
              </Button>
            </div>
          ) : bookingStatus === "Confirmed" ? (
            <div className="bg-red-50 dark:bg-red-900/10 rounded-[2.5rem] p-8 border border-red-200/50 dark:border-red-900/30 text-center space-y-5 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Critical — Emergency Admission</span>
                </div>
                <p className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-xl">Bed Assigned</p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">Proceed immediately to your assigned location.</p>
              </div>
              {allocationDetails && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-2xl bg-white dark:bg-black/30 border border-gray-100 dark:border-white/5 space-y-1">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Bed No.</p>
                    <p className="text-sm font-black text-red-600 dark:text-red-400">{allocationDetails.bedNumber}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-black/30 border border-gray-100 dark:border-white/5 space-y-1">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Floor</p>
                    <p className="text-sm font-black text-red-600 dark:text-red-400">Floor {allocationDetails.floorNumber}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-black/30 border border-gray-100 dark:border-white/5 space-y-1">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Room</p>
                    <p className="text-sm font-black text-red-600 dark:text-red-400">{allocationDetails.roomNumber}</p>
                  </div>
                </div>
              )}
              <Button 
                onClick={() => { setBookingStatus("Idle"); setAllocationDetails(null); setSelfBooking({ name: "", severity: "Low", needsICU: false }); }}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest h-12 rounded-2xl border-0"
              >
                New Booking
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 ml-1">Patient Trace Name</Label>
                <Input 
                  placeholder="Legal Full Name"
                  value={selfBooking.name}
                  onChange={(e) => setSelfBooking(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white h-14 rounded-2xl focus:ring-blue-600 font-bold"
                  disabled={inQueue || isProcessing}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 ml-1">Clinical Severity Level</Label>
                <Select 
                  value={selfBooking.severity} 
                  onValueChange={(v) => setSelfBooking(prev => ({ ...prev, severity: v as any }))}
                  disabled={inQueue || isProcessing}
                >
                  <SelectTrigger className="bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white h-14 rounded-2xl font-bold">
                    <SelectValue placeholder="Select Severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold rounded-2xl z-[200]">
                    <SelectItem value="Low" className="font-bold">🟢 Low Priority</SelectItem>
                    <SelectItem value="Moderate" className="font-bold">🟡 Moderate Trace</SelectItem>
                    <SelectItem value="Critical" className="font-bold">🔴 Critical Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="space-y-0.5">
                  <Label className="font-bold text-gray-700 dark:text-slate-300">Admission to ICU</Label>
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Override normal ward</p>
                </div>
                <Switch 
                  checked={selfBooking.needsICU} 
                  onCheckedChange={(v) => setSelfBooking(prev => ({ ...prev, needsICU: v }))}
                  disabled={inQueue || isProcessing}
                />
              </div>

              <Button 
                onClick={() => handleBooking(selfBooking)}
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 group transition-all active:scale-95 border-0"
                disabled={inQueue || isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-3 text-white">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-black uppercase tracking-widest animate-pulse">⏳ Processing booking...</span>
                  </div>
                ) : (
                  <>
                    Book Medical Space
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-tight">
            Encrypted Health Data <br /> HIPAA / GDPR Compliant Registry
          </p>
        </div>
      </div>

      {/* Floating Reopen Button */}
      {!showPanel && (
        <button
          onClick={() => setShowPanel(true)}
          className="fixed bottom-10 right-10 z-[90] bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest shadow-2xl shadow-blue-500/40 flex items-center gap-3 animate-in slide-in-from-right-10 duration-500 group border-0"
        >
          <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Book Patient
        </button>
      )}
    </div>
  );
};

export default Welcome;
