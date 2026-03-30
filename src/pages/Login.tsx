import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, BedDouble, ShieldCheck, Mail, Lock, UserPlus } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Orbs for Premium feel */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse opacity-60" />
      <div className="absolute bottom-0 -right-4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700 opacity-50" />
      
      <div className="w-full max-w-md p-4 relative z-10">
        <div className="flex flex-col items-center mb-10 gap-3">
          <div className="h-14 w-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(59,130,246,0.3)] backdrop-blur-xl">
            <BedDouble className="w-7 h-7 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">Hospital OS</h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/5">Secure Medical Access</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/50 border border-white/10 p-1 rounded-xl shadow-inner backdrop-blur-md">
            <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all font-bold">Sign In</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all font-bold">Register Staff</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-0">
            <Card className="border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-slate-900/60 backdrop-blur-2xl rounded-2xl">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-xl text-white font-bold tracking-wide">Login Console</CardTitle>
                <CardDescription className="text-slate-400 font-medium">
                  Enter your credentials to access the allocation system
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email-login" className="text-slate-300 font-semibold text-xs uppercase tracking-wider">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="email-login" 
                        type="email" 
                        placeholder="name@hospital.com" 
                        className="pl-10 h-11 bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-primary focus-visible:border-primary transition-all rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-login" className="text-slate-300 font-semibold text-xs uppercase tracking-wider">Password</Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="password-login" 
                        type="password" 
                        className="pl-10 h-11 bg-black/40 border-white/10 text-white focus-visible:ring-primary focus-visible:border-primary transition-all rounded-xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-5 pt-6">
                  <Button type="submit" className="w-full h-12 text-sm font-bold tracking-widest uppercase bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] border border-primary/50 transition-all rounded-xl" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
                    Authenticate
                  </Button>
                  <div className="text-center w-full">
                    <Link to="/" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
                      ← Back to System Hub
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="mt-0">
            <Card className="border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-slate-900/60 backdrop-blur-2xl rounded-2xl">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-xl text-white font-bold tracking-wide">Register Terminal</CardTitle>
                <CardDescription className="text-slate-400 font-medium">
                  Create a new secure account for medical personnel
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email-register" className="text-slate-300 font-semibold text-xs uppercase tracking-wider">Staff Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="email-register" 
                        type="email" 
                        placeholder="staff@hospital.com" 
                        className="pl-10 h-11 bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-primary focus-visible:border-primary transition-all rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-register" className="text-slate-300 font-semibold text-xs uppercase tracking-wider">Create Password</Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="password-register" 
                        type="password" 
                        placeholder="Minimum 6 characters"
                        className="pl-10 h-11 bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-primary focus-visible:border-primary transition-all rounded-xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        minLength={6}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-5 pt-6">
                  <Button type="submit" variant="secondary" className="w-full h-12 text-sm font-bold tracking-widest uppercase bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all rounded-xl" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                    Initialize Account
                  </Button>
                  <div className="text-center w-full">
                    <Link to="/" className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
                      ← Back to System Hub
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <p className="mt-12 text-center text-xs font-bold tracking-widest text-slate-600 uppercase">
          © 2026 Smart Hospital Bed Allocation System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
