import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Mail, Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We sent you a verification link. Please confirm your email to continue.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 max-w-md mx-auto">
      <div className="w-full opacity-0 animate-fade-up">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <BookOpen className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold text-foreground">Vocabulary Master</span>
        </div>

        <div className="bg-card rounded-xl p-6 card-shadow">
          <h1 className="text-xl font-bold text-foreground mb-1 text-center">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {isLogin ? "Sign in to continue learning" : "Start your vocabulary journey"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full bg-background rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full bg-background rounded-lg pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none ring-1 ring-border focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary font-medium hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
