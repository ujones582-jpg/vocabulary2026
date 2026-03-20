import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, BookmarkPlus, ArrowRight, Loader2, LogOut as LeaveIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { WordBank } from "@/lib/vocabulary";
import { getRandomWord, getRoleForBank, getRandomScene, getScoreCategories } from "@/lib/vocabulary";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "ai" | "user" | "feedback";
  content: string;
  feedbackType?: "correct" | "incorrect";
}

export default function ConversationPractice() {
  const [searchParams] = useSearchParams();
  const bank = (searchParams.get("bank") || "academic") as WordBank;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const roleInfo = getRoleForBank(bank);
  const [currentWord, setCurrentWord] = useState(() => getRandomWord(bank));
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roundCount, setRoundCount] = useState(1);
  const [showScoring, setShowScoring] = useState(false);
  const [scores, setScores] = useState<Record<string, number> | null>(null);
  const [scoringLoading, setScoringLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateScene = useCallback(async (word: typeof currentWord) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("vocab-chat", {
        body: { type: "generate_scene", bank, role: roleInfo.label, word },
      });
      if (error) throw error;
      setMessages([{ id: Date.now().toString(), role: "ai", content: data?.scene || getRandomScene(roleInfo.role) }]);
    } catch {
      setMessages([{ id: Date.now().toString(), role: "ai", content: getRandomScene(roleInfo.role) }]);
    } finally {
      setIsLoading(false);
    }
  }, [bank, roleInfo]);

  useEffect(() => {
    generateScene(currentWord);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      const aiScene = messages.find(m => m.role === "ai")?.content || "";
      const { data, error } = await supabase.functions.invoke("vocab-chat", {
        body: { type: "evaluate", bank, role: roleInfo.label, word: currentWord, userInput: userText, conversationHistory: aiScene },
      });
      if (error) throw error;
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "feedback",
        content: data?.feedback || "Unable to evaluate.", feedbackType: data?.correct ? "correct" : "incorrect",
      }]);
      setShowActions(true);
    } catch (e: any) {
      toast({ variant: "destructive", title: "AI Error", description: e?.message || "Failed to get feedback." });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, bank, roleInfo, currentWord, toast]);

  const handleNextRound = useCallback(async () => {
    const newWord = getRandomWord(bank, currentWord.word);
    setCurrentWord(newWord);
    setShowActions(false);
    setRoundCount(r => r + 1);
    await generateScene(newWord);
  }, [bank, currentWord.word, generateScene]);

  const handleSaveError = useCallback(async () => {
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    const lastFeedback = [...messages].reverse().find(m => m.role === "feedback");
    if (!lastUser || !lastFeedback || !user) return;

    const { error } = await supabase.from("user_errors").insert({
      user_id: user.id,
      word: currentWord.word,
      bank,
      user_sentence: lastUser.content,
      correction: lastFeedback.content,
    });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save." });
    } else {
      toast({ title: "Saved!", description: `"${currentWord.word}" added to your error bank.` });
    }
    handleNextRound();
  }, [messages, currentWord, bank, user, handleNextRound, toast]);

  const handleLeaveAndScore = useCallback(async () => {
    if (roundCount < 2) {
      navigate(`/learn?bank=${bank}`);
      return;
    }
    setScoringLoading(true);
    setShowScoring(true);

    try {
      const categories = getScoreCategories(bank);
      const conversationLog = messages.map(m => `[${m.role}]: ${m.content}`).join("\n");

      const { data, error } = await supabase.functions.invoke("vocab-chat", {
        body: {
          type: "score_conversation",
          bank,
          role: roleInfo.label,
          categories: categories.map(c => c.key),
          conversationLog,
          roundCount,
        },
      });

      if (error) throw error;
      setScores(data?.scores || null);

      if (user && data?.scores) {
        await supabase.from("conversation_scores").insert({
          user_id: user.id,
          bank,
          scores: data.scores,
          rounds_completed: roundCount,
        });
      }
    } catch {
      setScores(null);
    } finally {
      setScoringLoading(false);
    }
  }, [roundCount, bank, messages, roleInfo, user, navigate]);

  const categories = getScoreCategories(bank);

  // Scoring overlay
  if (showScoring) {
    return (
      <div className="min-h-screen flex flex-col max-w-md mx-auto items-center justify-center px-6 py-8">
        {scoringLoading ? (
          <div className="flex flex-col items-center gap-4 opacity-0 animate-fade-up">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">AI is scoring your conversation…</p>
          </div>
        ) : (
          <div className="w-full opacity-0 animate-fade-up">
            <h2 className="text-xl font-bold text-foreground text-center mb-2">Conversation Score</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">{roundCount} rounds completed</p>

            <div className="space-y-4 mb-8">
              {categories.map((cat, i) => {
                const score = scores?.[cat.key] ?? 0;
                return (
                  <div key={cat.key} className="opacity-0 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                      <span className="text-sm font-bold text-primary">{score}/10</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{cat.description}</p>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${score * 10}%`, transitionDelay: `${200 + i * 100}ms` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate(`/learn?bank=${bank}`)}
              className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-all active:scale-[0.97]"
            >
              Continue Learning
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate(`/learn?bank=${bank}`)} className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{roleInfo.label}</p>
          <p className="text-xs text-muted-foreground">Round {roundCount}</p>
        </div>
        <button
          onClick={handleLeaveAndScore}
          className="text-xs font-medium text-primary px-3 py-1.5 rounded-md bg-accent transition-colors active:scale-95 flex items-center gap-1"
        >
          <LeaveIcon className="w-3 h-3" />
          Leave & Score
        </button>
      </div>

      {/* Target word */}
      <div className="px-4 py-3 bg-accent/50 border-b border-border animate-fade-up">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Target Word</p>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-foreground">{currentWord.word}</span>
          <span className="text-xs text-muted-foreground italic">{currentWord.partOfSpeech}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{currentWord.definition}</p>
      </div>

      {/* Chat area */}
      <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={msg.id} className={`opacity-0 ${msg.role === "user" ? "animate-slide-in-right" : "animate-slide-in-left"}`} style={{ animationDelay: `${i * 60}ms` }}>
            {msg.role === "ai" && (
              <div className="max-w-[85%]">
                <p className="text-xs font-medium text-muted-foreground mb-1">{roleInfo.label}</p>
                <div className="bg-card rounded-lg rounded-tl-sm p-3.5 card-shadow">
                  <p className="text-sm text-foreground leading-relaxed">{msg.content}</p>
                </div>
              </div>
            )}
            {msg.role === "user" && (
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-primary rounded-lg rounded-tr-sm p-3.5">
                  <p className="text-sm text-primary-foreground leading-relaxed">{msg.content}</p>
                </div>
              </div>
            )}
            {msg.role === "feedback" && (
              <div className={`max-w-[90%] rounded-lg p-3.5 border ${msg.feedbackType === "correct" ? "bg-success/10 border-success/20" : "bg-destructive/10 border-destructive/20"}`}>
                <p className="text-sm leading-relaxed">
                  <span className="mr-1">{msg.feedbackType === "correct" ? "✅" : "❌"}</span>
                  {msg.content}
                </p>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground animate-fade-up">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">AI is thinking…</span>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-2 opacity-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <button onClick={handleNextRound} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97]">
              <ArrowRight className="w-4 h-4" /> Next Round
            </button>
            <button onClick={handleSaveError} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-card text-foreground text-sm font-medium card-shadow transition-all active:scale-[0.97]">
              <BookmarkPlus className="w-4 h-4" /> Save Error
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!showActions && (
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border px-4 py-3">
          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              placeholder={`Use "${currentWord.word}" in a sentence…`}
              className="flex-1 bg-card rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground card-shadow outline-none focus:ring-2 focus:ring-ring transition-shadow disabled:opacity-50"
            />
            <button type="submit" disabled={!input.trim() || isLoading} className={`p-3 rounded-lg transition-all active:scale-95 ${input.trim() && !isLoading ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
