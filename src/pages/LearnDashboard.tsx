import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Brain, MessageSquare, Settings, LogOut, List } from "lucide-react";
import type { WordBank } from "@/lib/vocabulary";
import { getWordBank, getRoleForBank } from "@/lib/vocabulary";
import { useAuth } from "@/hooks/useAuth";
import { useWordStatus } from "@/hooks/useWordStatus";
import WordStatusPortal from "@/components/WordStatusPortal";
import WordDetailsModal from "@/components/WordDetailsModal";

export default function LearnDashboard() {
  const [searchParams] = useSearchParams();
  const bank = (searchParams.get("bank") || "academic") as WordBank;
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { counts, getStatus, loading } = useWordStatus(bank);

  const allWords = getWordBank(bank);
  const totalWords = allWords.length;
  const roleInfo = getRoleForBank(bank);

  const bankLabels: Record<WordBank, string> = {
    academic: "🎓 Advanced Academic",
    beginner: "🌱 Beginner EFL",
    everyday: "✈️ Everyday Conversational",
    intermediate: "📚 Intermediate School",
  };

  const seenPlus = counts.seen + counts.learnt + counts.mastered;
  const [detailsOpen, setDetailsOpen] = useState(false);

  const portalWords = allWords.map((w) => ({ word: w.word, status: getStatus(w.word) }));

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate("/")} className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{bankLabels[bank]}</p>
          <p className="text-xs text-muted-foreground">{totalWords} words total</p>
        </div>
        <button onClick={() => navigate("/settings")} className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
        <button onClick={() => navigate("/errors")} className="text-xs font-medium text-primary px-2.5 py-1 rounded-md bg-accent transition-colors active:scale-95">
          Error Bank
        </button>
      </div>

      {/* Progress summary */}
      {!loading && (
        <div className="px-4 pt-4">
          <div className="grid grid-cols-4 gap-2 bg-card rounded-lg p-3 card-shadow">
            <div className="text-center">
              <p className="text-lg font-bold text-muted-foreground">{counts.unseen}</p>
              <p className="text-[10px] text-muted-foreground">Unseen</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{counts.seen}</p>
              <p className="text-[10px] text-muted-foreground">Seen</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{counts.learnt}</p>
              <p className="text-[10px] text-muted-foreground">Learnt</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{counts.mastered}</p>
              <p className="text-[10px] text-muted-foreground">Mastered</p>
            </div>
          </div>
          <button
            onClick={() => setDetailsOpen(true)}
            className="w-full mt-2 py-2 text-xs font-medium text-primary flex items-center justify-center gap-1.5 hover:bg-accent rounded-md transition-colors"
          >
            <List className="w-3.5 h-3.5" />
            See Details
          </button>
        </div>
      )}

      <div className="flex-1 px-4 py-6 space-y-6">
        <section className="opacity-0 animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Study Flashcards</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Each session picks 10 random words. Tap to flip and learn.</p>
          <button onClick={() => navigate(`/flashcards?bank=${bank}`)} className="w-full bg-card rounded-lg p-5 card-shadow text-left transition-all hover:card-shadow-hover active:scale-[0.97]">
            <p className="text-lg font-bold text-foreground">Start Flashcards</p>
            <p className="text-xs text-muted-foreground mt-1">10 random words · words you see become "Seen"</p>
          </button>
        </section>

        <section className="opacity-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Quick Quiz</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Quiz yourself on words you've already seen. MCQ + spelling.
          </p>
          <button
            onClick={() => navigate(`/quiz?bank=${bank}`)}
            disabled={seenPlus === 0}
            className="w-full bg-card rounded-lg p-5 card-shadow text-left transition-all hover:card-shadow-hover active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <p className="text-lg font-bold text-foreground">Start Quiz</p>
            <p className="text-xs text-muted-foreground mt-1">
              {seenPlus === 0 ? "Study flashcards first to unlock" : `${seenPlus} words available for quiz`}
            </p>
          </button>
        </section>

        <section className="opacity-0 animate-fade-up" style={{ animationDelay: "400ms" }}>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Conversation Practice</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Practice using words in real conversations with AI as your {roleInfo.label.toLowerCase()}.
          </p>
          <button onClick={() => navigate(`/practice?bank=${bank}`)} className="w-full bg-primary text-primary-foreground rounded-lg p-4 text-sm font-semibold transition-all active:scale-[0.97] flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Start Conversation
          </button>
        </section>
      </div>

      <div className="px-4 pb-6">
        <button onClick={async () => { await signOut(); navigate("/auth"); }} className="w-full py-2.5 text-sm text-muted-foreground font-medium flex items-center justify-center gap-1.5 hover:text-foreground transition-colors">
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>

      <WordStatusPortal counts={counts} words={portalWords} />
      <WordDetailsModal open={detailsOpen} onClose={() => setDetailsOpen(false)} words={allWords} getStatus={getStatus} counts={counts} />
    </div>
  );
}
