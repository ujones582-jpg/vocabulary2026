import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { WordBank } from "@/lib/vocabulary";
import { LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreference } from "@/hooks/useUserPreference";
import PlacementAssessment from "@/components/PlacementAssessment";

const banks = [
  { id: "beginner" as WordBank, label: "Beginner EFL", desc: "Start from zero — no English needed", tag: "A1" },
  { id: "elementary" as WordBank, label: "Elementary", desc: "Simple sentences · Daily life · Shopping · Travel", tag: "A2" },
  { id: "intermediate" as WordBank, label: "Upper Primary & Middle School", desc: "Grades 4–8 · Reading · Science · Social Studies", tag: "B1" },
  { id: "everyday" as WordBank, label: "Everyday Conversational", desc: "Travel · Idioms · Phone calls", tag: "B2" },
  { id: "academic" as WordBank, label: "Advanced Academic", desc: "TOEFL · IELTS · SAT", tag: "C1" },
  { id: "native" as WordBank, label: "Native & University / Work", desc: "Professional · Graduate-level · Nuanced expression", tag: "C2" },
];

export default function WordBankSelection() {
  const [selected, setSelected] = useState<WordBank | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { saveBank } = useUserPreference();

  const handleStart = async () => {
    if (!selected) return;
    setSaving(true);
    await saveBank(selected);
    setSaving(false);
    navigate(`/learn?bank=${selected}`);
  };

  const handleAssessmentSelect = async (bank: WordBank) => {
    setSaving(true);
    await saveBank(bank);
    setSaving(false);
    navigate(`/learn?bank=${bank}`);
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
    <div className="min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <div>
        <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1">Vocabulary</p>
        <h1 className="font-display text-2xl text-foreground leading-tight">
          Pick a word bank
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Choose a level that matches where you are right now.
        </p>
      </div>

      {/* Help me choose button */}
      <button
        onClick={() => setShowAssessment(true)}
        className="mt-4 w-full py-2.5 rounded-lg text-sm font-medium border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Not sure? Help me choose
      </button>

      <div className="flex-1 flex flex-col gap-2.5 mt-8">
        {banks.map((bank) => {
          const active = selected === bank.id;
          return (
            <button
              key={bank.id}
              onClick={() => setSelected(bank.id)}
              className={`relative w-full text-left rounded-lg p-4 transition-all border
                ${active ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border hover:border-foreground/15"} active:scale-[0.98]`}
            >
              <div className="flex items-start gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {bank.tag}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${active ? "text-primary-foreground" : "text-foreground"}`}>{bank.label}</p>
                  <p className={`text-xs mt-0.5 ${active ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{bank.desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${active ? "border-primary-foreground bg-primary-foreground" : "border-muted-foreground/30"}`}>
                  {active && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-6 space-y-3">
        <button
          disabled={!selected || saving}
          onClick={handleStart}
          className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-all active:scale-[0.97] ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
        >
          {saving ? "Saving…" : "Continue"}
        </button>
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
