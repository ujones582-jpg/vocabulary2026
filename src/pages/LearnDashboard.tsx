import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Brain, MessageSquare, Settings, LogOut, List, History, Plus, Flame } from "lucide-react";
import type { WordBank } from "@/lib/vocabulary";
import { getWordBank, getRoleForBank } from "@/lib/vocabulary";
import { useAuth } from "@/hooks/useAuth";
import { useWordStatus } from "@/hooks/useWordStatus";
import { useCustomWords } from "@/hooks/useCustomWords";
import { supabase } from "@/integrations/supabase/client";
import WordStatusPortal from "@/components/WordStatusPortal";
import WordDetailsModal from "@/components/WordDetailsModal";
import AddWordModal from "@/components/AddWordModal";

export default function LearnDashboard() {
  const [searchParams] = useSearchParams();
  const bank = (searchParams.get("bank") || "academic") as WordBank;
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { customWords, addWord } = useCustomWords(bank);
  const { counts, getStatus, loading, manualPromote } = useWordStatus(bank, customWords);

  const allWords = [...getWordBank(bank), ...customWords];
  const totalWords = allWords.length;
  const roleInfo = getRoleForBank(bank);

  const bankLabels: Record<WordBank, string> = {
    academic: "Advanced Academic",
    beginner: "Beginner EFL",
    everyday: "Everyday Conversational",
    intermediate: "Upper Primary & Middle School",
    native: "Native & University / Work",
  };

  const seenPlus = counts.seen + counts.developing + counts.learnt + counts.mastered;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addWordOpen, setAddWordOpen] = useState(false);

  // Daily stats
  const [todayCount, setTodayCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Words touched today
    supabase
      .from("word_status")
      .select("word", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("bank", bank)
      .gte("updated_at", todayISO)
      .then(({ count }) => setTodayCount(count || 0));

    // Error count
    supabase
      .from("user_errors")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .then(({ count }) => setErrorCount(count || 0));
  }, [user, bank, counts]);

  const portalWords = allWords.map((w) => ({ word: w.word, status: getStatus(w.word) }));

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{bankLabels[bank]}</p>
          <p className="text-xs text-muted-foreground">{totalWords} words</p>
        </div>
        <button onClick={() => setAddWordOpen(true)} className="p-1.5 rounded hover:bg-muted transition-colors active:scale-95" title="Add a word">
          <Plus className="w-5 h-5 text-muted-foreground" />
        </button>
        <button onClick={() => navigate("/settings")} className="p-1.5 rounded hover:bg-muted transition-colors active:scale-95">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
        {errorCount > 0 && (
          <button onClick={() => navigate(`/errors?bank=${bank}`)} className="text-xs font-medium text-foreground px-2.5 py-1 rounded border border-border hover:bg-muted transition-colors active:scale-95">
            Errors ({errorCount})
          </button>
        )}
      </div>

      {/* Daily stat + Progress */}
      {!loading && (
        <div className="px-4 pt-4 space-y-3">
          {/* Today's activity */}
          <div className="flex items-center gap-2.5 bg-card rounded-lg px-3.5 py-2.5 border border-border">
            <Flame className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm text-foreground flex-1">
              <span className="font-bold">{todayCount}</span>{" "}
              <span className="text-muted-foreground">words touched today</span>
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2 bg-card rounded-lg p-3 border border-border">
            <div className="text-center">
              <p className="text-lg font-bold text-muted-foreground">{counts.unseen}</p>
              <p className="text-[10px] text-muted-foreground">Unseen</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-700">{counts.seen}</p>
              <p className="text-[10px] text-muted-foreground">Seen</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-orange-700">{counts.developing}</p>
              <p className="text-[10px] text-muted-foreground">Growing</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-700">{counts.learnt}</p>
              <p className="text-[10px] text-muted-foreground">Learnt</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-700">{counts.mastered}</p>
              <p className="text-[10px] text-muted-foreground">Mastered</p>
            </div>
          </div>
          <button
            onClick={() => setDetailsOpen(true)}
            className="w-full mt-2 py-2 text-xs font-medium text-primary flex items-center justify-center gap-1.5 hover:bg-muted rounded transition-colors"
          >
            <List className="w-3.5 h-3.5" />
            See all words
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex-1 px-4 py-6 space-y-5">
        <section>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg text-foreground">Flashcards</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">10 random words per session. Flip to reveal definitions.</p>
          <button onClick={() => navigate(`/flashcards?bank=${bank}`)} className="w-full bg-card rounded-lg p-4 border border-border text-left transition-all hover:card-shadow-hover active:scale-[0.98]">
            <p className="text-base font-semibold text-foreground">Start studying</p>
            <p className="text-xs text-muted-foreground mt-0.5">Words you see become "Seen"</p>
          </button>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg text-foreground">Quiz</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Multiple choice and spelling questions on words you've seen.</p>
          <button
            onClick={() => navigate(`/quiz?bank=${bank}`)}
            disabled={seenPlus === 0}
            className="w-full bg-card rounded-lg p-4 border border-border text-left transition-all hover:card-shadow-hover active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <p className="text-base font-semibold text-foreground">Take a quiz</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {seenPlus === 0 ? "Study flashcards first" : `${seenPlus} words available`}
            </p>
          </button>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h2 className="font-display text-lg text-foreground">Conversation</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Practice using words in context with your {roleInfo.label.toLowerCase()}.</p>
          <button onClick={() => navigate(`/practice?bank=${bank}`)} className="w-full bg-primary text-primary-foreground rounded-lg p-3.5 text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Start conversation
          </button>
          <button
            onClick={() => navigate(`/chat-history?bank=${bank}`)}
            className="w-full mt-1.5 py-2 text-xs font-medium text-primary flex items-center justify-center gap-1.5 hover:bg-muted rounded transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            Past conversations
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
      <WordDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        words={allWords}
        getStatus={getStatus}
        counts={counts}
        onPromote={(word, status) => manualPromote(word, status)}
      />
      <AddWordModal open={addWordOpen} onClose={() => setAddWordOpen(false)} onAdd={addWord} bank={bank} />
    </div>
  );
}
