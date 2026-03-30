import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BedDouble, Activity, ShieldCheck, ArrowRight, Layers, LayoutDashboard, Database, Zap } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden font-sans">
      {/* Decorative blobs for modern medical feel */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-70" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px] opacity-50" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <BedDouble className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">SmartAllocation</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#tech" className="hover:text-white transition-colors">Technology</a>
        </div>
        <Button 
          onClick={() => navigate("/login")} 
          className="text-sm font-semibold text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all rounded-full px-6 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
        >
          Medical Staff Log In
        </Button>
      </nav>

      <main className="relative z-10 pt-20 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Enterprise Ready</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-lg">
                Optimize Patient <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] italic">Bed Allocation</span> with AI.
              </h1>
              
              <p className="text-xl text-slate-400 leading-relaxed max-w-xl font-medium">
                A mission-critical system designed for hospitals to manage ICU and Normal beds in real-time. 
                Prioritize patients based on clinical severity, oxygen levels, and heart rate.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={() => navigate("/login")} 
                  size="lg" 
                  className="h-14 px-8 text-lg font-bold shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_45px_rgba(59,130,246,0.7)] hover:bg-primary/90 transition-all gap-2 group rounded-full"
                >
                  Get Started Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <div className="flex items-center gap-4 px-4 py-2">
                   <div className="flex -space-x-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                          <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="Staff" />
                        </div>
                      ))}
                   </div>
                   <div className="text-xs text-slate-400 font-medium">
                     <span className="block font-bold text-slate-200">Join 500+ Staff</span>
                     Already optimizing clinics
                   </div>
                </div>
              </div>
            </div>

            {/* Illustration/Dashboard Preview mockup */}
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000">
               <div className="relative z-10 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-slate-900/60 backdrop-blur-xl overflow-hidden aspect-square md:aspect-video flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 p-8 w-full">
                     <div className="col-span-2 h-12 bg-black/40 rounded-lg border border-white/5 flex items-center px-4 gap-2 shadow-inner">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                        <div className="w-20 h-2 bg-slate-700/50 rounded" />
                     </div>
                     <div className="h-32 bg-primary/10 rounded-xl border border-primary/20 flex flex-col items-center justify-center gap-2 p-4 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                        <Activity className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        <div className="w-full h-2 bg-primary/30 rounded" />
                        <div className="w-2/3 h-2 bg-primary/20 rounded" />
                     </div>
                     <div className="h-32 bg-purple-500/10 rounded-xl border border-purple-500/20 flex flex-col items-center justify-center gap-2 p-4 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                        <LayoutDashboard className="w-6 h-6 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                        <div className="w-full h-2 bg-purple-500/30 rounded" />
                        <div className="w-2/3 h-2 bg-purple-500/20 rounded" />
                     </div>
                     <div className="col-span-2 h-40 bg-black/30 rounded-xl border border-white/5 p-4 space-y-3">
                        <div className="flex gap-2 items-center">
                          <div className="w-4 h-4 rounded-full bg-slate-700" />
                          <div className="w-32 h-3 bg-slate-700/50 rounded" />
                        </div>
                        <div className="w-full h-24 bg-white/5 rounded-lg border border-white/10 shadow-sm" />
                     </div>
                  </div>
               </div>
               {/* Floating elements */}
               <div className="absolute -bottom-6 -left-6 z-20 bg-slate-900/80 p-4 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.2)] border border-green-500/20 flex items-center gap-3 animate-bounce backdrop-blur-xl">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 border border-green-500/30">
                    <ShieldCheck className="w-5 h-5 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-green-400/70">Status</span>
                    <span className="text-sm font-bold text-white tracking-wide">Secure & Verified</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Features Hook */}
          <div id="features" className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(249,115,22,0.15)] hover:border-orange-500/30 transition-all group">
               <div className="h-12 w-12 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                 <Zap className="w-6 h-6 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Smart Allocation</h3>
               <p className="text-slate-400 text-sm leading-relaxed font-medium">
                 Priority-based routing ensures critical patients receive beds instantly without manual triage.
               </p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)] hover:border-blue-500/30 transition-all group">
               <div className="h-12 w-12 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                 <Database className="w-6 h-6 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Real-time Data</h3>
               <p className="text-slate-400 text-sm leading-relaxed font-medium">
                 Full Supabase integration provides instantaneous feedback and persistent state storage.
               </p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(34,197,94,0.15)] hover:border-green-500/30 transition-all group">
               <div className="h-12 w-12 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                 <Activity className="w-6 h-6 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Medical Edge</h3>
               <p className="text-slate-400 text-sm leading-relaxed font-medium">
                 Designed for clinicians, with a focus on speed, reliability, and human-centric design.
               </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-20 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            <span className="font-bold text-white tracking-widest uppercase">SmartAllocation</span>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Built for mission-critical hospital environments.
          </div>
          <div className="flex gap-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
