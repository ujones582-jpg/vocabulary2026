import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Brain, MessageSquare, LogOut } from "lucide-react";
import type { WordBank } from "@/lib/vocabulary";
import { getWordSets, getRoleForBank } from "@/lib/vocabulary";
import { useAuth } from "@/hooks/useAuth";

export default function LearnDashboard() {
  const [searchParams] = useSearchParams();
  const bank = (searchParams.get("bank") || "academic") as WordBank;
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const sets = getWordSets(bank);
  const roleInfo = getRoleForBank(bank);

  const bankLabels: Record<WordBank, string> = {
    academic: "🎓 Advanced Academic",
    beginner: "🌱 Beginner EFL",
    everyday: "✈️ Everyday Conversational",
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/")} className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{bankLabels[bank]}</p>
          <p className="text-xs text-muted-foreground">{sets.length} sets · {sets.length * 10} words</p>
        </div>
        <button
          onClick={() => navigate("/errors")}
          className="text-xs font-medium text-primary px-2.5 py-1 rounded-md bg-accent transition-colors active:scale-95"
        >
          Error Bank
        </button>
      </div>

      {/* Learning path */}
      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Flashcard Sets */}
        <section className="opacity-0 animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Study Flashcards</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Learn the words first. Tap a set to start studying.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {sets.map((set, i) => (
              <button
                key={i}
                onClick={() => navigate(`/flashcards?bank=${bank}&set=${i}`)}
                className="bg-card rounded-lg p-4 card-shadow text-left transition-all hover:card-shadow-hover active:scale-[0.97] opacity-0 animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <p className="text-lg font-bold text-foreground">Set {i + 1}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {set.slice(0, 3).map(w => w.word).join(", ")}…
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Quiz */}
        <section className="opacity-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Quick Quiz</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Test yourself on any set. Wrong answers will be flagged for review.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {sets.map((_, i) => (
              <button
                key={i}
                onClick={() => navigate(`/quiz?bank=${bank}&set=${i}`)}
                className="bg-card rounded-lg p-4 card-shadow text-left transition-all hover:card-shadow-hover active:scale-[0.97]"
              >
                <p className="text-sm font-semibold text-foreground">Quiz Set {i + 1}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Conversation Practice */}
        <section className="opacity-0 animate-fade-up" style={{ animationDelay: "400ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Conversation Practice</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Practice using words in real conversations with AI as your {roleInfo.label.toLowerCase()}.
          </p>
          <button
            onClick={() => navigate(`/practice?bank=${bank}`)}
            className="w-full bg-primary text-primary-foreground rounded-lg p-4 text-sm font-semibold transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Start Conversation
          </button>
        </section>
      </div>

      {/* Sign out */}
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
