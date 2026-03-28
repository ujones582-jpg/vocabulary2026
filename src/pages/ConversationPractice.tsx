import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, Loader2, LogOut as LeaveIcon, Star, TrendingUp, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { WordBank } from "@/lib/vocabulary";
import { getRoleForBank, getScoreCategories } from "@/lib/vocabulary";
import { useToast } from "@/hooks/use-toast";
import ConversationTopicPicker, { type ConversationTopic } from "@/components/ConversationTopicPicker";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
}

export default function ConversationPractice() {
  const [searchParams] = useSearchParams();
  const bank = (searchParams.get("bank") || "academic") as WordBank;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const roleInfo = getRoleForBank(bank);

  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roundCount, setRoundCount] = useState(0);
  const [showScoring, setShowScoring] = useState(false);
  const [scores, setScores] = useState<Record<string, number> | null>(null);
  const [feedback, setFeedback] = useState<{ strengths: string[]; improvements: string[]; summary: string } | null>(null);
  const [wordUsage, setWordUsage] = useState<{ impressiveWords: string[]; wordsToTry: string[] } | null>(null);
  const [scoringLoading, setScoringLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = useCallback(async (topic: ConversationTopic) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("vocab-chat", {
        body: {
          type: "chat_start",
          bank,
          role: roleInfo.label,
          topicType: topic.type,
          topicPrompt: topic.prompt === "free" ? undefined : topic.prompt,
          topicLabel: topic.label,
        },
      });
      if (error) throw error;
      setMessages([{ id: Date.now().toString(), role: "ai", content: data?.message || "Hi there! How are you doing today?" }]);
    } catch {
      setMessages([{ id: Date.now().toString(), role: "ai", content: "Hi there! How are you doing today?" }]);
    } finally {
      setIsLoading(false);
    }
  }, [bank, roleInfo]);

  const handleTopicSelect = useCallback((topic: ConversationTopic) => {
    setSelectedTopic(topic);
    startConversation(topic);
  }, [startConversation]);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: userText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setRoundCount(r => r + 1);

    try {
      const history = updatedMessages.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }));
      const { data, error } = await supabase.functions.invoke("vocab-chat", {
        body: {
          type: "chat_reply",
          bank,
          role: roleInfo.label,
          history,
          topicType: selectedTopic?.type,
          topicPrompt: selectedTopic?.prompt === "free" ? undefined : selectedTopic?.prompt,
          topicLabel: selectedTopic?.label,
        },
      });
      if (error) throw error;
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: "ai",
        content: data?.message || "I see, tell me more!",
      }]);
    } catch (e: any) {
      toast({ variant: "destructive", title: "AI Error", description: e?.message || "Failed to get response." });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, bank, roleInfo, selectedTopic, toast]);

  const handleLeaveAndScore = useCallback(async () => {
    if (roundCount < 2) {
      navigate(`/learn?bank=${bank}`);
      return;
    }
    setScoringLoading(true);
    setShowScoring(true);
    try {
      const categories = getScoreCategories(bank);
      const conversationLog = messages.map(m => `[${m.role === "ai" ? "AI" : "Student"}]: ${m.content}`).join("\n");
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
      setFeedback(data?.feedback || null);
      setWordUsage(data?.wordUsage || null);
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

  // Topic picker (before conversation starts)
  if (!selectedTopic) {
    return (
      <ConversationTopicPicker
        bank={bank}
        roleLabel={roleInfo.label}
        onSelect={handleTopicSelect}
        onBack={() => navigate(`/learn?bank=${bank}`)}
      />
    );
  }

  // Scoring overlay
  if (showScoring) {
    return (
      <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8 overflow-y-auto">
        {scoringLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-0 animate-fade-up">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">AI is scoring your conversation…</p>
          </div>
        ) : (
          <div className="w-full opacity-0 animate-fade-up">
            <h2 className="text-xl font-bold text-foreground text-center mb-2">Conversation Score</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">{roundCount} rounds completed</p>

            {/* Score bars */}
            <div className="space-y-4 mb-6">
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

            {/* AI Feedback Summary */}
            {feedback && (
              <div className="mb-6 opacity-0 animate-fade-up" style={{ animationDelay: "400ms" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">AI Feedback</h3>
                </div>

                {feedback.summary && (
                  <p className="text-sm text-foreground leading-relaxed mb-3 bg-card rounded-lg p-3 border border-border">
                    {feedback.summary}
                  </p>
                )}

                {feedback.strengths?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-success uppercase tracking-wider mb-1.5">Strengths</p>
                    <ul className="space-y-1">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-success mt-0.5">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback.improvements?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-1.5">Areas to Improve</p>
                    <ul className="space-y-1">
                      {feedback.improvements.map((s, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <TrendingUp className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Word Usage Report */}
            {wordUsage && (
              <div className="mb-8 opacity-0 animate-fade-up" style={{ animationDelay: "550ms" }}>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Word Usage</h3>
                </div>

                {wordUsage.impressiveWords?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Words you used well</p>
                    <div className="flex flex-wrap gap-1.5">
                      {wordUsage.impressiveWords.map((w) => (
                        <span key={w} className="text-sm bg-success/10 text-success px-2.5 py-1 rounded-md font-medium">{w}</span>
                      ))}
                    </div>
                  </div>
                )}

                {wordUsage.wordsToTry?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Try using these next time</p>
                    <div className="flex flex-wrap gap-1.5">
                      {wordUsage.wordsToTry.map((w) => (
                        <span key={w} className="text-sm bg-accent text-accent-foreground px-2.5 py-1 rounded-md font-medium border border-border">{w}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
          <p className="text-xs text-muted-foreground">
            {selectedTopic.label}{roundCount > 0 ? ` · ${roundCount} exchange${roundCount !== 1 ? "s" : ""}` : ""}
          </p>
        </div>
        <button
          onClick={handleLeaveAndScore}
          className="text-xs font-medium text-primary px-3 py-1.5 rounded-md bg-accent transition-colors active:scale-95 flex items-center gap-1"
        >
          <LeaveIcon className="w-3 h-3" />
          Leave & Score
        </button>
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
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground animate-fade-up">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">AI is thinking…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border px-4 py-3">
        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type your message…"
            className="flex-1 bg-card rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground card-shadow outline-none focus:ring-2 focus:ring-ring transition-shadow disabled:opacity-50"
          />
          <button type="submit" disabled={!input.trim() || isLoading} className={`p-3 rounded-lg transition-all active:scale-95 ${input.trim() && !isLoading ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
