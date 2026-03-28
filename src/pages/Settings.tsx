import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, LogOut } from "lucide-react";
import type { WordBank } from "@/lib/vocabulary";
import { useUserPreference } from "@/hooks/useUserPreference";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const banks: { id: WordBank; label: string; emoji: string }[] = [
  { id: "beginner", label: "Beginner EFL", emoji: "🌱" },
  { id: "intermediate", label: "Upper Primary & Middle School", emoji: "📚" },
  { id: "everyday", label: "Everyday Conversational", emoji: "✈️" },
  { id: "academic", label: "Advanced Academic", emoji: "🎓" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { bank: currentBank, saveBank, clearProgress } = useUserPreference();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [newBank, setNewBank] = useState<WordBank | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleBankSelect = (b: WordBank) => {
    if (b === currentBank) return;
    setNewBank(b);
    setShowWarning(true);
  };

  const confirmChange = async () => {
    if (!newBank) return;
    setSaving(true);
    await clearProgress();
    const error = await saveBank(newBank);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to update preference.", variant: "destructive" });
    } else {
      toast({ title: "Word bank changed", description: "All progress has been reset." });
      setShowWarning(false);
      navigate("/learn");
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/learn")} className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <p className="text-sm font-semibold text-foreground">Settings</p>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6">
        <section>
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-1">Current Word Bank</h2>
          <p className="text-xs text-muted-foreground mb-4">
            {currentBank ? `${banks.find(b => b.id === currentBank)?.emoji} ${banks.find(b => b.id === currentBank)?.label}` : "None selected"}
          </p>

          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Change Word Bank</h2>
          <div className="space-y-2">
            {banks.map(b => (
              <button
                key={b.id}
                onClick={() => handleBankSelect(b.id)}
                disabled={b.id === currentBank}
                className={`w-full text-left rounded-lg p-4 transition-all active:scale-[0.97] ${
                  b.id === currentBank
                    ? "bg-primary/10 border-2 border-primary opacity-60 cursor-default"
                    : "bg-card card-shadow hover:card-shadow-hover"
                }`}
              >
                <span className="text-lg mr-3">{b.emoji}</span>
                <span className={`font-semibold text-sm ${b.id === currentBank ? "text-primary" : "text-foreground"}`}>
                  {b.label}
                </span>
                {b.id === currentBank && <span className="text-xs text-primary ml-2">(current)</span>}
              </button>
            ))}
          </div>
        </section>

        {/* Warning modal */}
        {showWarning && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-card rounded-2xl p-6 card-shadow max-w-sm w-full space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Change Word Bank?</h3>
                  <p className="text-xs text-muted-foreground">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-destructive/5 border-2 border-destructive/30 rounded-lg p-4">
                <p className="text-sm font-bold text-destructive mb-1">⚠️ ALL PROGRESS WILL BE DELETED</p>
                <p className="text-xs text-destructive/80">
                  Your flashcard progress, quiz scores, conversation history, and error bank will be permanently erased.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowWarning(false); setNewBank(null); }}
                  className="flex-1 py-3 rounded-lg bg-muted text-foreground text-sm font-medium transition-all active:scale-[0.97]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmChange}
                  disabled={saving}
                  className="flex-1 py-3 rounded-lg bg-destructive text-destructive-foreground text-sm font-bold transition-all active:scale-[0.97]"
                >
                  {saving ? "Resetting…" : "Confirm & Reset"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-6">
        <button
          onClick={async () => { await signOut(); navigate("/auth"); }}
          className="w-full py-2.5 text-sm text-muted-foreground font-medium flex items-center justify-center gap-1.5 hover:text-foreground transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );
}
