import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle2, Zap } from "lucide-react";
import type { WordBank } from "@/lib/vocabulary";
import { getRandomWords } from "@/lib/vocabulary";
import { useWordStatus } from "@/hooks/useWordStatus";
import WordStatusPortal from "@/components/WordStatusPortal";

export default function FlashcardStudy() {
  const [searchParams] = useSearchParams();
  const bank = (searchParams.get("bank") || "academic") as WordBank;
  const navigate = useNavigate();

  const { markSeen, getStatus, counts, loading } = useWordStatus(bank);

  const [words, setWords] = useState(() => getRandomWords(bank, 10));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [studied, setStudied] = useState<Set<number>>(new Set());

  const word = words[currentIndex];
  const isLast = currentIndex === words.length - 1;

  useEffect(() => {
    if (word && !loading) markSeen(word.word);
  }, [currentIndex, word, loading, markSeen]);

  const handleNext = useCallback(() => {
    setStudied((prev) => new Set(prev).add(currentIndex));
    setFlipped(false);
    if (currentIndex < words.length - 1) setCurrentIndex((i) => i + 1);
  }, [currentIndex, words.length]);

  const handlePrev = useCallback(() => {
    setFlipped(false);
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  const handleFinish = () => {
    setStudied((prev) => new Set(prev).add(currentIndex));
    navigate(`/quiz?bank=${bank}`);
  };

  const handleRestart = () => {
    setWords(getRandomWords(bank, 10));
    setFlipped(false);
    setCurrentIndex(0);
    setStudied(new Set());
  };

  const allWordStatuses = words.map((w) => ({ word: w.word, status: getStatus(w.word) }));

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(`/learn?bank=${bank}`)} className="p-1.5 rounded hover:bg-muted transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Flashcards</p>
          <p className="text-xs text-muted-foreground">{currentIndex + 1} / {words.length}</p>
        </div>
        <div className="text-xs font-medium text-primary bg-accent px-2.5 py-1 rounded">
          {studied.size} studied
        </div>
      </div>

      <div className="h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <button onClick={() => setFlipped(!flipped)} className="w-full aspect-[3/4] max-h-[400px] perspective-1000">
          <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${flipped ? "rotate-y-180" : ""}`}>
            <div className="absolute inset-0 backface-hidden bg-card rounded-xl border border-border flex flex-col items-center justify-center p-8">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">{word.partOfSpeech}</span>
              <h2 className="font-display text-4xl text-foreground mb-3">{word.word}</h2>
              <p className="text-sm text-muted-foreground">Tap to see definition</p>
            </div>
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-primary rounded-xl flex flex-col items-center justify-center p-8 text-center">
              <span className="text-xs uppercase tracking-widest text-primary-foreground/50 font-medium mb-4">Definition</span>
              <p className="text-lg font-medium text-primary-foreground leading-relaxed mb-4">{word.definition}</p>
              {word.example && (
                <div className="bg-primary-foreground/10 rounded-lg px-4 py-3 w-full">
                  <p className="text-xs text-primary-foreground/50 font-medium mb-1">Example</p>
                  <p className="text-sm text-primary-foreground italic">"{word.example}"</p>
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

      <div className="px-6 pb-8 space-y-3">
        <div className="flex gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 py-3 rounded-lg bg-card border border-border text-foreground text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-30 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
          {isLast ? (
            <button onClick={handleFinish} className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97] flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Take Quiz
            </button>
          ) : (
            <button onClick={handleNext} className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97] flex items-center justify-center gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
        <button onClick={handleRestart} className="w-full py-2.5 text-sm text-muted-foreground font-medium flex items-center justify-center gap-1.5 hover:text-foreground transition-colors">
          <RotateCcw className="w-3.5 h-3.5" /> New set
        </button>
      </div>

      <WordStatusPortal counts={counts} words={allWordStatuses} />
    </div>
  );
}
