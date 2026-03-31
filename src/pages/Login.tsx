import { useState, useEffect } from "react";
import { applyTheme, getTheme } from "../utils/theme.ts";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, BedDouble, ShieldCheck, Mail, Lock, UserPlus, Sun, Moon, Monitor, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(getTheme());
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleThemeChange = (newTheme: any) => {
    applyTheme(newTheme);
    setCurrentTheme(newTheme);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else if (data.session) {
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else if (data.user) {
        toast.success("Staff account created! You can now log in.");
        // Clear fields so they can log in if needed, or if Supabase auto-logged them in:
        if (data.session) {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-foreground dark:text-white relative overflow-hidden transition-all duration-700">
      {/* Premium Background Architecture */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_50%)] opacity-70" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-950 z-[-1]" />
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse opacity-60" />
      <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[130px] animate-pulse delay-1000 opacity-50" />
      
      {/* Top Navigation / Theme Switcher */}
      <div className="absolute top-8 right-8 z-50 flex items-center gap-4">
        <div className="flex bg-muted/50 dark:bg-white/5 p-1 rounded-2xl border border-border dark:border-white/10 items-center backdrop-blur-md">
          <button 
            onClick={() => handleThemeChange("light")}
            className={cn("p-2 rounded-xl transition-all duration-300", currentTheme === "light" ? "bg-background shadow-md text-primary scale-110" : "text-muted-foreground hover:text-foreground")}
            title="Light Mode"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleThemeChange("dark")}
            className={cn("p-2 rounded-xl transition-all duration-300", currentTheme === "dark" ? "bg-background shadow-md text-primary scale-110" : "text-muted-foreground hover:text-foreground")}
            title="Dark Mode"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleThemeChange("system")}
            className={cn("p-2 rounded-xl transition-all duration-300", currentTheme === "system" ? "bg-background shadow-md text-primary scale-110" : "text-muted-foreground hover:text-foreground")}
            title="System Default"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-md p-6 relative z-10">
        <div className="flex flex-col items-center mb-12 gap-4">
          <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary shadow-2xl shadow-primary/20 backdrop-blur-xl group transition-all hover:scale-110">
            <BedDouble className="w-8 h-8 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black text-foreground dark:text-white tracking-tighter uppercase italic leading-none mb-1">Hospital <span className="text-primary">OS</span></h1>
            <p className="text-[10px] font-black text-muted-foreground dark:text-slate-500 uppercase tracking-[0.4em] bg-muted/30 dark:bg-black/20 px-4 py-1.5 rounded-full border border-border dark:border-white/5 inline-block">Secure Mission Console</p>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/40 dark:bg-black/30 border border-border dark:border-white/10 p-1.5 rounded-2xl shadow-inner backdrop-blur-md h-14">
            <TabsTrigger value="login" className="data-[state=active]:bg-background dark:data-[state=active]:bg-primary data-[state=active]:text-primary dark:data-[state=active]:text-white rounded-xl transition-all font-black uppercase tracking-widest text-[10px] data-[state=active]:shadow-lg">Sign In</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-background dark:data-[state=active]:bg-primary data-[state=active]:text-primary dark:data-[state=active]:text-white rounded-xl transition-all font-black uppercase tracking-widest text-[10px] data-[state=active]:shadow-lg">Deploy Staff</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-0 focus-visible:outline-none">
            <Card className="glass-panel border-t-4 border-t-primary overflow-hidden">
              <CardHeader className="space-y-2 pb-8 pt-10 px-10 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-3xl font-black text-foreground tracking-tighter uppercase">Authentication</CardTitle>
                <CardDescription className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] opacity-70">
                  Registry synchronization required
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-6 p-10">
                  <div className="space-y-2.5">
                    <Label htmlFor="email-login" className="text-muted-foreground font-black text-[9px] uppercase tracking-[0.2em] ml-1">Clinical ID / Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input 
                        id="email-login" 
                        type="email" 
                        placeholder="staff@medical.hub" 
                        className="pl-12 h-14 bg-muted/20 dark:bg-black/40 border-border dark:border-white/5 text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/40 transition-all rounded-2xl font-bold"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="password-login" className="text-muted-foreground font-black text-[9px] uppercase tracking-[0.2em] ml-1">Secure Passkey</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input 
                        id="password-login" 
                        type="password" 
                        placeholder="••••••••"
                        className="pl-12 h-14 bg-muted/20 dark:bg-black/40 border-border dark:border-white/5 text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/40 transition-all rounded-2xl font-bold"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-6 pb-10 px-10">
                  <Button type="submit" className="w-full h-14 text-[11px] font-black tracking-[0.2em] uppercase bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all rounded-2xl active:scale-95 flex items-center gap-2" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    Initialize Portal Access
                  </Button>
                  <div className="text-center w-full">
                    <Link to="/" className="text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2 group">
                      <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                      Back to System Hub
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="mt-0 focus-visible:outline-none">
            <Card className="glass-panel border-t-4 border-t-indigo-500 overflow-hidden">
              <CardHeader className="space-y-2 pb-8 pt-10 px-10 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-3xl font-black text-foreground tracking-tighter uppercase">Deployment</CardTitle>
                <CardDescription className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] opacity-70">
                   Initialize new medical staff trace
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-6 p-10">
                  <div className="space-y-2.5">
                    <Label htmlFor="email-register" className="text-muted-foreground font-black text-[9px] uppercase tracking-[0.2em] ml-1">Assigned Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-indigo-500" />
                      <Input 
                        id="email-register" 
                        type="email" 
                        placeholder="staff@medical.hub" 
                        className="pl-12 h-14 bg-muted/20 dark:bg-black/40 border-border dark:border-white/5 text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-indigo-500/40 transition-all rounded-2xl font-bold"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="password-register" className="text-muted-foreground font-black text-[9px] uppercase tracking-[0.2em] ml-1">New Secure Passkey</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-indigo-500" />
                      <Input 
                        id="password-register" 
                        type="password" 
                        placeholder="••••••••"
                        className="pl-12 h-14 bg-muted/20 dark:bg-black/40 border-border dark:border-white/5 text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-indigo-500/40 transition-all rounded-2xl font-bold"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        minLength={6}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-6 pb-10 px-10">
                  <Button type="submit" className="w-full h-14 text-[11px] font-black tracking-[0.2em] uppercase bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 transition-all rounded-2xl active:scale-95 flex items-center gap-2 border-0" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                    Initialize Account
                  </Button>
                  <div className="text-center w-full">
                    <Link to="/" className="text-[10px] font-black text-muted-foreground hover:text-indigo-500 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2 group">
                      <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                      Back to System Hub
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <p className="mt-16 text-center text-[10px] font-black tracking-[0.3em] text-muted-foreground/40 uppercase font-mono">
          © 2026 Smart Bed Flow • Built for Mission Critical Healthcare <br />
          Authorized Access Only • Neural Encryption Active
        </p>
      </div>
    </div>
  );
};

export default Login;
