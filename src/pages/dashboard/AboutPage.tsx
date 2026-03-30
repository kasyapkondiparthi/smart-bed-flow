import { 
  Bed, 
  ShieldCheck, 
  Zap, 
  Database, 
  Activity, 
  LayoutDashboard, 
  MessageSquare, 
  Mic, 
  History, 
  FileDown, 
  Clock, 
  Settings, 
  AlertTriangle,
  HeartPulse,
  Brain,
  Globe,
  Monitor
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const AboutPage = () => {
  const features = [
    { icon: <Zap className="w-5 h-5" />, title: "Priority Allocation", desc: "Critical > Moderate > Low logic" },
    { icon: <Bed className="w-5 h-5" />, title: "Bed/Floor Mapping", desc: "Automated ICU & Ward routing" },
    { icon: <LayoutDashboard className="w-5 h-5" />, title: "Live Analytics", desc: "Real-time occupancy telemetry" },
    { icon: <MessageSquare className="w-5 h-5" />, title: "AI Assistant", desc: "Rule-based natural language parsing" },
    { icon: <Mic className="w-5 h-5" />, title: "Voice Control", desc: "Full STT/TTS clinical interface" },
    { icon: <History className="w-5 h-5" />, title: "Audit History", desc: "Time-slot based event tracking" },
    { icon: <FileDown className="w-5 h-5" />, title: "CSV Data Export", desc: "Shift-based reporting & archiving" },
    { icon: <Clock className="w-5 h-5" />, title: "Shift Management", desc: "Live clock & atomic end-shift reset" },
    { icon: <Settings className="w-5 h-5" />, title: "Patient Lifecycle", desc: "Search, Edit, & Delete management" },
    { icon: <AlertTriangle className="w-5 h-5" />, title: "Critical Alerts", desc: "Automated ICU capacity warnings" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20">
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="mx-auto h-24 w-24 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.4)] relative group group">
          <HeartPulse className="w-12 h-12 text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse" />
          <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-400 to-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] tracking-tight uppercase">
            Hospital Command Center
          </h1>
          <p className="text-xs font-black text-primary/60 uppercase tracking-[0.6em] ml-2">
            The Neural Engine of Patient Care
          </p>
        </div>
      </motion.div>

      {/* OVERVIEW CARD */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="glass-panel p-10 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Globe className="w-32 h-32 text-primary" />
        </div>
        <div className="relative z-10 space-y-4 max-w-3xl">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <Monitor className="w-6 h-6 text-primary" />
            Project Overview
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed font-medium">
            This system is a real-time hospital command center designed to optimize patient allocation and resource management using intelligent logic, deep analytics, and interactive triage tools. Built for high-stakes medical environments, it ensures that every patient is routed to the appropriate level of care with millisecond precision.
          </p>
        </div>
      </motion.div>

      {/* FEATURES GRID */}
      <div className="space-y-8">
        <h2 className="text-xl font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-4">
          <Zap className="w-5 h-5" />
          Key Features
          <div className="h-px flex-1 bg-white/5" />
        </h2>
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              variants={item}
              className="glass-panel p-6 space-y-4 hover:border-primary/50 transition-all hover:-translate-y-1 cursor-default"
            >
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-inner">
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white tracking-wide">{f.title}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SYSTEM MODULES */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-8 space-y-6"
        >
          <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            System Modules
          </h2>
          <div className="space-y-4">
            {[
              { label: "Dashboard", desc: "Real-time monitoring and predictive analytics" },
              { label: "Allocation Engine", desc: "Priority-based patient intake and ward routing" },
              { label: "Audit History", desc: "Immutable event logging and shift reporting" },
              { label: "Triage Assistant", desc: "Intelligent chatbot with full voice integration" }
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                <div className="flex-1">
                  <span className="text-sm font-black text-white uppercase tracking-widest block">{m.label}</span>
                  <span className="text-[11px] font-bold text-slate-500">{m.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* TECHNOLOGY STACK */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-8 space-y-6"
        >
          <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            <Database className="w-6 h-6 text-primary" />
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "React", icon: "⚛", color: "bg-blue-500/10 text-blue-400" },
              { label: "Supabase", icon: "🗄", color: "bg-green-500/10 text-green-400" },
              { label: "Tailwind", icon: "🎨", color: "bg-cyan-500/10 text-cyan-400" },
              { label: "Recharts", icon: "📊", color: "bg-orange-500/10 text-orange-400" }
            ].map((t, i) => (
              <div key={i} className={cn("flex items-center gap-4 p-4 rounded-2xl border border-white/5 group", t.color)}>
                <span className="text-2xl group-hover:scale-125 transition-transform">{t.icon}</span>
                <span className="text-xs font-black uppercase tracking-widest">{t.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* REAL-WORLD IMPACT */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-10 border-primary/20 bg-primary/5 shadow-[0_0_40px_rgba(59,130,246,0.1)] text-center relative overflow-hidden"
      >
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">Real-World Impact</h2>
          <p className="text-lg text-slate-400 leading-relaxed font-bold">
            This system improves hospital efficiency by <span className="text-white italic underline underline-offset-4 decoration-primary">automating patient prioritization</span>, enabling real-time infrastructure monitoring, and supporting high-velocity clinical decisions, ultimately enhancing patient care outcomes and hospital resource utilization.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </motion.div>
    </div>
  );
};

export default AboutPage;
