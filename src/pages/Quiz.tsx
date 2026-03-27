import { useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, RotateCcw, MessageSquare } from "lucide-react";
import type { WordBank } from "@/lib/vocabulary";
import { getWordSets, getWordBank } from "@/lib/vocabulary";

interface QuizQuestion {
  word: string;
  options: { definition: string; isCorrect: boolean }[];
}

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const bank = (searchParams.get("bank") || "academic") as WordBank;
  const setIdx = parseInt(searchParams.get("set") || "0", 10);
  const navigate = useNavigate();

  const sets = getWordSets(bank);
  const setWords = sets[setIdx] || sets[0];
  const allWords = getWordBank(bank);

  const questions = useMemo<QuizQuestion[]>(() => {
    return setWords.map(w => ({
      word: w.word,
      options: generateQuizOptions(w, allWords),
    }));
  }, [setWords, allWords]);

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<(boolean | null)[]>(new Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = questions[currentQ];
  const correctCount = results.filter(r => r === true).length;
  const incorrectCount = results.filter(r => r === false).length;
  const weakWords = questions.filter((_, i) => results[i] === false).map(q => q.word);

  const handleSelect = useCallback((idx: number) => {
    if (showResult) return;
    setSelected(idx);
    const isCorrect = question.options[idx].isCorrect;
    setResults(prev => {
      const next = [...prev];
      next[currentQ] = isCorrect;
      return next;
    });
    setShowResult(true);
  }, [showResult, question, currentQ]);

  const handleNext = useCallback(() => {
    setSelected(null);
    setShowResult(false);
    if (currentQ < questions.length - 1) {
      setCurrentQ(i => i + 1);
    } else {
      setFinished(true);
    }
  }, [currentQ, questions.length]);

  const handleRetryWeak = () => {
    // Restart quiz with only weak words
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setFinished(false);
    setResults(new Array(questions.length).fill(null));
  };

  if (finished) {
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 70;

    return (
      <div className="min-h-screen flex flex-col max-w-md mx-auto">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-border">
          <button onClick={() => navigate(`/learn?bank=${bank}`)} className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <p className="text-sm font-semibold text-foreground">Quiz Results</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 opacity-0 animate-fade-up">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${passed ? "bg-success/10" : "bg-destructive/10"}`}>
            <span className="text-4xl">{passed ? "🎉" : "💪"}</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">{score}%</h2>
          <p className="text-sm text-muted-foreground mb-8">
            {correctCount} correct · {incorrectCount} incorrect
          </p>

          {weakWords.length > 0 && (
            <div className="w-full bg-card rounded-lg p-4 card-shadow mb-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Words to review</p>
              <div className="flex flex-wrap gap-2">
                {weakWords.map(w => (
                  <span key={w} className="text-sm bg-destructive/10 text-destructive px-2.5 py-1 rounded-md font-medium">{w}</span>
                ))}
              </div>
            </div>
          )}

          <div className="w-full space-y-3">
            {weakWords.length > 0 && (
              <button
                onClick={() => navigate(`/flashcards?bank=${bank}&set=${setIdx}`)}
                className="w-full py-3.5 rounded-lg bg-card text-foreground text-sm font-medium card-shadow transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Re-study weak words
              </button>
            )}

            {passed && (
              <button
                onClick={() => navigate(`/practice?bank=${bank}`)}
                className="w-full py-3.5 rounded-lg bg-accent text-foreground text-sm font-medium card-shadow transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Try Conversation Practice
              </button>
            )}

            <button
              onClick={handleRetryWeak}
              className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            >
              Retry Quiz
            </button>

            <button
              onClick={() => navigate(`/learn?bank=${bank}`)}
              className="w-full py-2.5 text-sm text-muted-foreground font-medium hover:text-foreground transition-colors"
            >
              Back to Learning
            </button>
          </div>
        </div>
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
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Quiz — Set {setIdx + 1}</p>
          <p className="text-xs text-muted-foreground">Question {currentQ + 1} / {questions.length}</p>
        </div>
        <div className="flex gap-1.5">
          <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded">✓ {correctCount}</span>
          <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded">✗ {incorrectCount}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="flex-1 px-6 py-8 flex flex-col">
        <div className="mb-8 opacity-0 animate-fade-up">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">What does this word mean?</p>
          <h2 className="text-3xl font-bold text-foreground">{question.word}</h2>
        </div>

        <div className="space-y-3 flex-1">
          {question.options.map((opt, i) => {
            let variant = "bg-card card-shadow";
            if (showResult && selected === i) {
              variant = opt.isCorrect
                ? "bg-success/10 border-2 border-success"
                : "bg-destructive/10 border-2 border-destructive";
            } else if (showResult && opt.isCorrect) {
              variant = "bg-success/10 border-2 border-success/30";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showResult}
                className={`
                  w-full text-left rounded-lg p-4 transition-all active:scale-[0.97] opacity-0 animate-fade-up
                  ${variant}
                  ${!showResult ? "hover:ring-2 hover:ring-ring" : ""}
                `}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">{opt.definition}</p>
                  {showResult && opt.isCorrect && <CheckCircle2 className="w-5 h-5 text-success shrink-0" />}
                  {showResult && selected === i && !opt.isCorrect && <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <button
            onClick={handleNext}
            className="w-full py-3.5 mt-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97] flex items-center justify-center gap-2 opacity-0 animate-fade-up"
          >
            {currentQ < questions.length - 1 ? "Next Question" : "See Results"}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
