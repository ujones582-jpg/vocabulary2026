import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";
import type { WordBank, VocabWord } from "@/lib/vocabulary";
import { getWordSets } from "@/lib/vocabulary";

export default function FlashcardStudy() {
  const [searchParams] = useSearchParams();
  const bank = (searchParams.get("bank") || "academic") as WordBank;
  const setIdx = parseInt(searchParams.get("set") || "0", 10);
  const navigate = useNavigate();

  const sets = getWordSets(bank);
  const words = sets[setIdx] || sets[0];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [studied, setStudied] = useState<Set<number>>(new Set());

  const word = words[currentIndex];

  const handleNext = useCallback(() => {
    setStudied(prev => new Set(prev).add(currentIndex));
    setFlipped(false);
    if (currentIndex < words.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex, words.length]);

  const handlePrev = useCallback(() => {
    setFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  }, [currentIndex]);

  const allStudied = studied.size >= words.length || (studied.size === words.length - 1 && !studied.has(currentIndex));
  const isLast = currentIndex === words.length - 1;

  const handleFinish = () => {
    setStudied(prev => new Set(prev).add(currentIndex));
    navigate(`/quiz?bank=${bank}&set=${setIdx}`);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate(`/learn?bank=${bank}`)} className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Study Set {setIdx + 1}</p>
          <p className="text-xs text-muted-foreground">{currentIndex + 1} / {words.length} words</p>
        </div>
        <div className="text-xs font-medium text-primary bg-accent px-2.5 py-1 rounded-md">
          {studied.size} learned
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <button
          onClick={() => setFlipped(!flipped)}
          className="w-full aspect-[3/4] max-h-[400px] perspective-1000"
        >
          <div className={`
            relative w-full h-full transition-transform duration-500 preserve-3d
            ${flipped ? "rotate-y-180" : ""}
          `}>
            {/* Front - Word */}
            <div className="absolute inset-0 backface-hidden bg-card rounded-2xl card-shadow flex flex-col items-center justify-center p-8">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">
                {word.partOfSpeech}
              </span>
              <h2 className="text-3xl font-bold text-foreground mb-3">{word.word}</h2>
              <p className="text-sm text-muted-foreground">Tap to see definition</p>
            </div>

            {/* Back - Definition */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-primary rounded-2xl card-shadow flex flex-col items-center justify-center p-8 text-center">
              <span className="text-xs uppercase tracking-widest text-primary-foreground/60 font-medium mb-4">
                Definition
              </span>
              <p className="text-lg font-semibold text-primary-foreground leading-relaxed mb-4">
                {word.definition}
              </p>
              {word.example && (
                <div className="bg-primary-foreground/10 rounded-lg px-4 py-3 w-full">
                  <p className="text-xs text-primary-foreground/60 font-medium mb-1">Example</p>
                  <p className="text-sm text-primary-foreground italic">"{word.example}"</p>
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-8 space-y-3">
        <div className="flex gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 py-3.5 rounded-lg bg-card text-foreground text-sm font-medium card-shadow transition-all active:scale-[0.97] disabled:opacity-30 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {isLast ? (
            <button
              onClick={handleFinish}
              className="flex-1 py-3.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Take Quiz
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 py-3.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => { setFlipped(false); setCurrentIndex(0); setStudied(new Set()); }}
          className="w-full py-2.5 text-sm text-muted-foreground font-medium flex items-center justify-center gap-1.5 hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restart set
        </button>
      </div>
    </div>
  );
}
