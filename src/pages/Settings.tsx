import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Sparkles } from "lucide-react";
import type { WordBank } from "@/lib/vocabulary";
import { useUserPreference } from "@/hooks/useUserPreference";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import PlacementAssessment from "@/components/PlacementAssessment";

const banks: { id: WordBank; label: string; tag: string }[] = [
  { id: "beginner", label: "Beginner EFL", tag: "A1" },
  { id: "intermediate", label: "Upper Primary & Middle School", tag: "B1" },
  { id: "everyday", label: "Everyday Conversational", tag: "B2" },
  { id: "academic", label: "Advanced Academic", tag: "C1" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { bank: currentBank, saveBank } = useUserPreference();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);

  const handleBankSelect = async (b: WordBank) => {
    if (b === currentBank || saving) return;
    setSaving(true);
    const error = await saveBank(b);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to update preference.", variant: "destructive" });
    } else {
      toast({ title: "Switched", description: `Now using ${banks.find(x => x.id === b)?.label}.` });
      navigate(`/learn?bank=${b}`);
    }
  };

  const handleAssessmentSelect = async (bank: WordBank) => {
    setSaving(true);
    const error = await saveBank(bank);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to update preference.", variant: "destructive" });
    } else {
      toast({ title: "Switched", description: `Now using ${banks.find(x => x.id === bank)?.label}.` });
      setShowAssessment(false);
      navigate(`/learn?bank=${bank}`);
    }
  };

  if (showAssessment) {
    return (
      <PlacementAssessment
        onSelect={handleAssessmentSelect}
        onBack={() => setShowAssessment(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded hover:bg-muted transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <p className="text-sm font-semibold text-foreground">Settings</p>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6">
        <section>
          <h2 className="font-display text-lg text-foreground mb-1">Word Bank</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Your progress is saved separately for each level. Switching won't erase anything.
          </p>

          <button
            onClick={() => setShowAssessment(true)}
            className="w-full mb-3 py-2.5 rounded-lg text-sm font-medium border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Retake placement assessment
          </button>

          <div className="space-y-2">
            {banks.map(b => (
              <button
                key={b.id}
                onClick={() => handleBankSelect(b.id)}
                disabled={b.id === currentBank || saving}
                className={`w-full text-left rounded-lg p-4 transition-all active:scale-[0.98] border ${
                  b.id === currentBank
                    ? "border-primary/30 bg-primary/5 cursor-default"
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
