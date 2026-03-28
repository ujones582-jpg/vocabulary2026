import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Trash2, BookOpen, Loader2, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
interface ErrorEntry {
  id: string;
  word: string;
  bank: string;
  user_sentence: string;
  correction: string;
  created_time: string;
}
export default function ErrorBank() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bank = searchParams.get("bank") || "";
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<ErrorEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchErrors = async () => {
      const { data, error } = await supabase
        .from("user_errors")
        .select("*")
        .order("created_time", { ascending: false });

      if (error) console.error("Failed to fetch errors:", error);
      else setEntries(data || []);
      setLoading(false);
    };
    fetchErrors();
  }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("user_errors").delete().eq("id", id);
    if (error) toast({ variant: "destructive", title: "Error", description: "Failed to delete." });
    else setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleClear = async () => {
    if (!user) return;
    const { error } = await supabase.from("user_errors").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) toast({ variant: "destructive", title: "Error", description: "Failed to clear." });
    else setEntries([]);
  };

  const uniqueWords = [...new Set(entries.map(e => e.word))];

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded hover:bg-muted transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Errors</p>
          <p className="text-xs text-muted-foreground">{entries.length} saved</p>
        </div>
        {entries.length > 0 && (
          <button onClick={handleClear} className="text-xs font-medium text-destructive px-3 py-1.5 rounded border border-destructive/20 hover:bg-destructive/5 transition-colors active:scale-95">
            Clear all
          </button>
        )}
      </div>

      {/* Practice button */}
      {uniqueWords.length >= 2 && (
        <div className="px-4 pt-4">
          <button
            onClick={() => navigate(`/quiz?bank=${bank}&source=errors`)}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <Brain className="w-4 h-4" />
            Practice these mistakes ({uniqueWords.length} words)
          </button>
        </div>
      )}

      <div className="flex-1 px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No errors yet</p>
            <p className="text-xs text-muted-foreground max-w-[200px]">
              Words you get wrong during practice will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{entry.word}</h3>
                    <span className="text-xs text-muted-foreground">{entry.bank}</span>
                  </div>
                  <button onClick={() => handleDelete(entry.id)} className="p-1 rounded hover:bg-destructive/10 transition-colors active:scale-95">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="bg-destructive/5 rounded p-2.5 border border-destructive/10">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Your answer</p>
                    <p className="text-foreground leading-relaxed">{entry.user_sentence}</p>
                  </div>
                  <div className="bg-accent rounded p-2.5 border border-border">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Correction</p>
                    <p className="text-foreground leading-relaxed">{entry.correction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
