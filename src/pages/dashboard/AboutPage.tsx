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
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Priority Allocation",
      desc: "Intelligent triage engine that routes patients by severity — Critical first, then Moderate, then Low — ensuring life-critical cases never wait.",
      accent: "from-yellow-500/20 to-amber-500/5",
      iconBg: "bg-amber-500/15 border-amber-500/30 text-amber-400",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.25)]",
      bar: "bg-amber-500",
    },
    {
      icon: <Bed className="w-5 h-5" />,
      title: "Bed & Floor Mapping",
      desc: "Automated assignment of ICU and ward beds with real-time tracking of bed numbers and floor location across the entire facility.",
      accent: "from-blue-500/20 to-blue-500/5",
      iconBg: "bg-blue-500/15 border-blue-500/30 text-blue-400",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.25)]",
      bar: "bg-blue-500",
    },
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      title: "Live Analytics",
      desc: "Real-time occupancy telemetry with dynamic charts showing ICU vs. Ward utilization, wait queues, and severity breakdowns.",
      accent: "from-sky-500/20 to-sky-500/5",
      iconBg: "bg-sky-500/15 border-sky-500/30 text-sky-400",
      glow: "shadow-[0_0_20px_rgba(14,165,233,0.25)]",
      bar: "bg-sky-500",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "AI Triage Assistant",
      desc: "Rule-based NLP chatbot that interprets clinical queries, answers capacity questions, and guides staff through patient intake workflows.",
      accent: "from-violet-500/20 to-violet-500/5",
      iconBg: "bg-violet-500/15 border-violet-500/30 text-violet-400",
      glow: "shadow-[0_0_20px_rgba(139,92,246,0.25)]",
      bar: "bg-violet-500",
    },
    {
      icon: <Mic className="w-5 h-5" />,
      title: "Voice Control",
      desc: "Full speech-to-text and text-to-speech integration for hands-free clinical operation — critical in sterile or high-pressure environments.",
      accent: "from-rose-500/20 to-rose-500/5",
      iconBg: "bg-rose-500/15 border-rose-500/30 text-rose-400",
      glow: "shadow-[0_0_20px_rgba(244,63,94,0.25)]",
      bar: "bg-rose-500",
    },
    {
      icon: <History className="w-5 h-5" />,
      title: "Audit History",
      desc: "Immutable, time-stamped event log of every patient action — admissions, updates, and discharges — filterable by date and shift slot.",
      accent: "from-teal-500/20 to-teal-500/5",
      iconBg: "bg-teal-500/15 border-teal-500/30 text-teal-400",
      glow: "shadow-[0_0_20px_rgba(20,184,166,0.25)]",
      bar: "bg-teal-500",
    },
    {
      icon: <FileDown className="w-5 h-5" />,
      title: "CSV Data Export",
      desc: "One-click shift reports exported as structured CSV files — ready for compliance archiving, administrative review, or BI analysis.",
      accent: "from-emerald-500/20 to-emerald-500/5",
      iconBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.25)]",
      bar: "bg-emerald-500",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Shift Management",
      desc: "Live shift clock with atomic end-of-shift resets that archive all data, clear active state, and prepare the system for the next shift.",
      accent: "from-orange-500/20 to-orange-500/5",
      iconBg: "bg-orange-500/15 border-orange-500/30 text-orange-400",
      glow: "shadow-[0_0_20px_rgba(249,115,22,0.25)]",
      bar: "bg-orange-500",
    },
    {
      icon: <Settings className="w-5 h-5" />,
      title: "Patient Lifecycle",
      desc: "Full CRUD management — search, edit vitals, reassign severity, and safely remove patients with automatic bed reallocation on change.",
      accent: "from-indigo-500/20 to-indigo-500/5",
      iconBg: "bg-indigo-500/15 border-indigo-500/30 text-indigo-400",
      glow: "shadow-[0_0_20px_rgba(99,102,241,0.25)]",
      bar: "bg-indigo-500",
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "Critical Alerts",
      desc: "Automated ICU capacity warnings trigger when thresholds are breached — ensuring staff are notified before a crisis becomes catastrophic.",
      accent: "from-red-500/20 to-red-500/5",
      iconBg: "bg-red-500/15 border-red-500/30 text-red-400",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.25)]",
      bar: "bg-red-500",
    },
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
        {/* Section header */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-widest">Key Features</h2>
              <p className="text-[10px] font-black text-primary/50 uppercase tracking-[0.4em]">What powers this system</p>
            </div>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent ml-4" />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={item}
              className={cn(
                "group relative flex gap-5 p-5 rounded-2xl border border-white/[0.06] bg-gradient-to-br overflow-hidden cursor-default",
                "transition-all duration-300 hover:-translate-y-1 hover:border-white/10",
                f.accent,
                f.glow
              )}
            >
              {/* Left accent bar */}
              <div className={cn("absolute left-0 top-4 bottom-4 w-[3px] rounded-full opacity-70 group-hover:opacity-100 transition-opacity", f.bar)} />

              {/* Icon */}
              <div className={cn(
                "shrink-0 h-11 w-11 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                f.iconBg
              )}>
                {f.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pr-8">
                <h3 className="font-black text-sm text-white tracking-wide leading-tight">{f.title}</h3>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1.5">{f.desc}</p>
              </div>

              {/* Number badge */}
              <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-[9px] font-black text-slate-500">{String(i + 1).padStart(2, "0")}</span>
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
