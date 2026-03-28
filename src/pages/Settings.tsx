import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, LogOut } from "lucide-react";
import type { WordBank } from "@/lib/vocabulary";
import { useUserPreference } from "@/hooks/useUserPreference";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const banks: { id: WordBank; label: string; tag: string }[] = [
  { id: "beginner", label: "Beginner EFL", tag: "A1" },
  { id: "intermediate", label: "Upper Primary & Middle School", tag: "B1" },
  { id: "everyday", label: "Everyday Conversational", tag: "B2" },
  { id: "academic", label: "Advanced Academic", tag: "C1" },
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
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/learn")} className="p-1.5 rounded hover:bg-muted transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <p className="text-sm font-semibold text-foreground">Settings</p>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6">
        <section>
          <h2 className="font-display text-lg text-foreground mb-1">Current Word Bank</h2>
          <p className="text-xs text-muted-foreground mb-4">
            {currentBank ? `${banks.find(b => b.id === currentBank)?.tag} · ${banks.find(b => b.id === currentBank)?.label}` : "None selected"}
          </p>

          <h2 className="font-display text-lg text-foreground mb-3">Change Word Bank</h2>
          <div className="space-y-2">
            {banks.map(b => (
              <button
                key={b.id}
                onClick={() => handleBankSelect(b.id)}
                disabled={b.id === currentBank}
                className={`w-full text-left rounded-lg p-4 transition-all active:scale-[0.98] border ${
                  b.id === currentBank
                    ? "border-primary/30 bg-primary/5 opacity-60 cursor-default"
                    : "border-border bg-card hover:border-foreground/15"
                }`}
              >
                <span className="text-xs font-bold text-muted-foreground mr-2">{b.tag}</span>
                <span className={`font-semibold text-sm ${b.id === currentBank ? "text-primary" : "text-foreground"}`}>
                  {b.label}
                </span>
                {b.id === currentBank && <span className="text-xs text-primary ml-2">(current)</span>}
              </button>
            ))}
          </div>
        </section>

        {showWarning && (
          <div className="fixed inset-0 z-50 bg-foreground/20 flex items-center justify-center p-6">
            <div className="bg-card rounded-xl p-6 border border-border max-w-sm w-full space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Change word bank?</h3>
                  <p className="text-xs text-muted-foreground">This cannot be undone</p>
                </div>
              </div>

              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm font-semibold text-destructive mb-0.5">All progress will be deleted</p>
                <p className="text-xs text-destructive/80">
                  Flashcard progress, quiz scores, conversation history, and error bank will be permanently erased.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowWarning(false); setNewBank(null); }}
                  className="flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium transition-all active:scale-[0.97]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmChange}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold transition-all active:scale-[0.97]"
                >
                  {saving ? "Resetting…" : "Confirm"}
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
