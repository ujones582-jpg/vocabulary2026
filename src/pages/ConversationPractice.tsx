import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, BookmarkPlus, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { WordBank, ErrorEntry } from "@/lib/vocabulary";
import { getRandomWord, getRoleForBank, getRandomScene } from "@/lib/vocabulary";
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

  const roleInfo = getRoleForBank(bank);
  const [currentWord, setCurrentWord] = useState(() => getRandomWord(bank));
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showActions, setShowActions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roundCount, setRoundCount] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate initial scene via AI
  const generateScene = useCallback(async (word: typeof currentWord) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("vocab-chat", {
        body: {
          type: "generate_scene",
          bank,
          role: roleInfo.label,
          word,
        },
      });

      if (error) throw error;

      const scene = data?.scene || getRandomScene(roleInfo.role);
      setMessages([{
        id: Date.now().toString(),
        role: "ai",
        content: scene,
      }]);
    } catch (e) {
      console.error("Scene generation failed:", e);
      // Fallback to local scene
      setMessages([{
        id: Date.now().toString(),
        role: "ai",
        content: getRandomScene(roleInfo.role),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [bank, roleInfo]);

  // Generate first scene on mount
  useEffect(() => {
    generateScene(currentWord);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const aiScene = messages.find(m => m.role === "ai")?.content || "";
      const { data, error } = await supabase.functions.invoke("vocab-chat", {
        body: {
          type: "evaluate",
          bank,
          role: roleInfo.label,
          word: currentWord,
          userInput: userText,
          conversationHistory: aiScene,
        },
      });

      if (error) throw error;

      const feedbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "feedback",
        content: data?.feedback || "Unable to evaluate. Try again.",
        feedbackType: data?.correct ? "correct" : "incorrect",
      };

      setMessages(prev => [...prev, feedbackMsg]);
      setShowActions(true);
    } catch (e: any) {
      console.error("Evaluation failed:", e);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: e?.message || "Failed to get feedback. Please try again.",
      });
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

  const handleSaveError = useCallback(() => {
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    const lastFeedback = [...messages].reverse().find(m => m.role === "feedback");
    if (!lastUser || !lastFeedback) return;

    const entry: ErrorEntry = {
      id: Date.now().toString(),
      word: currentWord.word,
      userSentence: lastUser.content,
      correction: lastFeedback.content,
      timestamp: Date.now(),
    };

    const existing = JSON.parse(localStorage.getItem("vocab-errors") || "[]");
    localStorage.setItem("vocab-errors", JSON.stringify([entry, ...existing]));

    toast({ title: "Saved!", description: `"${currentWord.word}" added to your error bank.` });
    handleNextRound();
  }, [messages, currentWord, handleNextRound, toast]);

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => navigate("/")}
          className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{roleInfo.label}</p>
          <p className="text-xs text-muted-foreground">Round {roundCount}</p>
        </div>
        <button
          onClick={() => navigate("/errors")}
          className="text-xs font-medium text-primary px-3 py-1.5 rounded-md bg-accent transition-colors active:scale-95"
        >
          Error Bank
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
          <div
            key={msg.id}
            className={`
              opacity-0
              ${msg.role === "user" ? "animate-slide-in-right" : "animate-slide-in-left"}
            `}
            style={{ animationDelay: `${i * 60}ms` }}
          >
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
              <div className={`
                max-w-[90%] rounded-lg p-3.5 border
                ${msg.feedbackType === "correct"
                  ? "bg-success/10 border-success/20"
                  : "bg-destructive/10 border-destructive/20"
                }
              `}>
                <p className="text-sm leading-relaxed">
                  <span className="mr-1">{msg.feedbackType === "correct" ? "✅" : "❌"}</span>
                  {msg.content}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground animate-fade-up">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">AI is thinking…</span>
          </div>
        )}

        {/* Action buttons after feedback */}
        {showActions && (
          <div className="flex gap-2 pt-2 opacity-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <button
              onClick={handleNextRound}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97]"
            >
              <ArrowRight className="w-4 h-4" />
              Next Round
            </button>
            <button
              onClick={handleSaveError}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-card text-foreground text-sm font-medium card-shadow transition-all active:scale-[0.97]"
            >
              <BookmarkPlus className="w-4 h-4" />
              Save to Review
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!showActions && (
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border px-4 py-3">
          <form
            onSubmit={e => { e.preventDefault(); handleSubmit(); }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              placeholder={`Use "${currentWord.word}" in a sentence…`}
              className="flex-1 bg-card rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground card-shadow outline-none focus:ring-2 focus:ring-ring transition-shadow disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`
                p-3 rounded-lg transition-all active:scale-95
                ${input.trim() && !isLoading
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
                }
              `}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}