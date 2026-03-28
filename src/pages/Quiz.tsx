import { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, RotateCcw, MessageSquare, Keyboard, AlertTriangle } from "lucide-react";
import type { WordBank, VocabWord } from "@/lib/vocabulary";
import { getWordBank } from "@/lib/vocabulary";
import { useWordStatus } from "@/hooks/useWordStatus";
import WordStatusPortal from "@/components/WordStatusPortal";

interface MCQQuestion {
  type: "mcq";
  word: string;
  options: { id: number; definition: string; isCorrect: boolean }[];
}

interface SpellingQuestion {
  type: "spelling";
  definition: string;
  partOfSpeech: string;
  answer: string;
}

type QuizQuestion = MCQQuestion | SpellingQuestion;

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const bank = (searchParams.get("bank") || "academic") as WordBank;
  const navigate = useNavigate();
  const allWords = getWordBank(bank);
  const { getQuizWords, getStatus, counts, recordQuizAnswer, loading } = useWordStatus(bank);

  const [quizWords, setQuizWords] = useState<VocabWord[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [noWords, setNoWords] = useState(false);

  // Initialize quiz words once loading finishes
  if (!loading && !initialized) {
    const words = getQuizWords(10);
    if (words.length === 0) {
      setNoWords(true);
    } else {
      setQuizWords(words);
    }
    setInitialized(true);
  }

  const questions = useMemo<QuizQuestion[]>(() => {
    if (quizWords.length === 0) return [];
    return quizWords.map((w, idx) => {
      if (idx % 2 === 0) {
        const wrongWords = allWords.filter((aw) => aw.word !== w.word);
        const shuffled = [...wrongWords].sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [
          { id: 0, definition: w.definition, isCorrect: true },
          ...shuffled.map((sw, i) => ({ id: i + 1, definition: sw.definition, isCorrect: false })),
        ].sort(() => Math.random() - 0.5);
        return { type: "mcq" as const, word: w.word, options };
      } else {
        return { type: "spelling" as const, definition: w.definition, partOfSpeech: w.partOfSpeech, answer: w.word };
      }
    });
  }, [quizWords, allWords]);

  const [currentQ, setCurrentQ] = useState(0);
  const [mcqSelected, setMcqSelected] = useState<number | null>(null);
  const [spellingInput, setSpellingInput] = useState("");
  const [results, setResults] = useState<(boolean | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  // Init results array when questions change
  if (questions.length > 0 && results.length === 0) {
    setResults(new Array(questions.length).fill(null));
  }

  const question = questions[currentQ];
  const correctCount = results.filter((r) => r === true).length;
  const incorrectCount = results.filter((r) => r === false).length;

  const handleMCQSelect = useCallback(
    async (idx: number) => {
      if (showResult || !question || question.type !== "mcq") return;
      setMcqSelected(idx);
      const isCorrect = question.options[idx].isCorrect;
      setResults((prev) => {
        const n = [...prev];
        n[currentQ] = isCorrect;
        return n;
      });
      setShowResult(true);
      await recordQuizAnswer(question.word, "mcq", isCorrect);
    },
    [showResult, question, currentQ, recordQuizAnswer]
  );

  const handleSpellingSubmit = useCallback(async () => {
    if (showResult || !question || question.type !== "spelling") return;
    const isCorrect = spellingInput.trim().toLowerCase() === question.answer.toLowerCase();
    setResults((prev) => {
      const n = [...prev];
      n[currentQ] = isCorrect;
      return n;
    });
    setShowResult(true);
    await recordQuizAnswer(question.answer, "spelling", isCorrect);
  }, [showResult, question, currentQ, spellingInput, recordQuizAnswer]);

  const handleNext = useCallback(() => {
    setMcqSelected(null);
    setSpellingInput("");
    setShowResult(false);
    if (currentQ < questions.length - 1) {
      setCurrentQ((i) => i + 1);
    } else {
      setFinished(true);
    }
  }, [currentQ, questions.length]);

  const handleRetry = () => {
    const words = getQuizWords(10);
    setQuizWords(words);
    setCurrentQ(0);
    setMcqSelected(null);
    setSpellingInput("");
    setShowResult(false);
    setFinished(false);
    setResults([]);
  };

  const weakWords = questions
    .map((q, i) => ({ q, correct: results[i] }))
    .filter((x) => x.correct === false)
    .map((x) => (x.q.type === "mcq" ? x.q.word : x.q.answer));

  // Build portal word list from quiz words
  const portalWords = quizWords.map((w) => ({ word: w.word, status: getStatus(w.word) }));

  // No words available screen
  if (noWords) {
    return (
      <div className="min-h-screen flex flex-col max-w-md mx-auto">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-border">
          <button onClick={() => navigate(`/learn?bank=${bank}`)} className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <p className="text-sm font-semibold text-foreground">Quiz</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">No words to quiz yet!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            You need to study flashcards first so words become "Seen" before you can be quizzed on them.
          </p>
          <button
            onClick={() => navigate(`/flashcards?bank=${bank}`)}
            className="py-3.5 px-8 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97]"
          >
            Study Flashcards First
          </button>
        </div>
      </div>
    );
  }

  if (loading || !initialized || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          <p className="text-sm text-muted-foreground mb-8">{correctCount} correct · {incorrectCount} incorrect</p>

          {weakWords.length > 0 && (
            <div className="w-full bg-card rounded-lg p-4 card-shadow mb-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Words to review</p>
              <div className="flex flex-wrap gap-2">
                {weakWords.map((w) => (
                  <span key={w} className="text-sm bg-destructive/10 text-destructive px-2.5 py-1 rounded-md font-medium">{w}</span>
                ))}
              </div>
            </div>
          )}

          <div className="w-full space-y-3">
            <button onClick={() => navigate(`/flashcards?bank=${bank}`)} className="w-full py-3.5 rounded-lg bg-card text-foreground text-sm font-medium card-shadow transition-all active:scale-[0.97] flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Continue Studying
            </button>
            {passed && (
              <button onClick={() => navigate(`/practice?bank=${bank}`)} className="w-full py-3.5 rounded-lg bg-accent text-foreground text-sm font-medium card-shadow transition-all active:scale-[0.97] flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" /> Try Conversation Practice
              </button>
            )}
            <button onClick={handleRetry} className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97] flex items-center justify-center gap-2">
              Retry Quiz
            </button>
            <button onClick={() => navigate(`/learn?bank=${bank}`)} className="w-full py-2.5 text-sm text-muted-foreground font-medium hover:text-foreground transition-colors">
              Back to Learning
            </button>
          </div>
        </div>
        <WordStatusPortal counts={counts} words={portalWords} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-border">
        <button onClick={() => navigate(`/learn?bank=${bank}`)} className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Quiz</p>
          <p className="text-xs text-muted-foreground">Question {currentQ + 1} / {questions.length}</p>
        </div>
        <div className="flex gap-1.5">
          <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded">✓ {correctCount}</span>
          <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded">✗ {incorrectCount}</span>
        </div>
      </div>

      <div className="h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="flex-1 px-6 py-8 flex flex-col">
        {question.type === "mcq" ? (
          <>
            <div className="mb-8 opacity-0 animate-fade-up">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">What does this word mean?</p>
              <h2 className="text-3xl font-bold text-foreground">{question.word}</h2>
            </div>
            <div className="space-y-3 flex-1">
              {question.options.map((opt, i) => {
                let variant = "bg-card card-shadow";
                if (showResult && mcqSelected === i) {
                  variant = opt.isCorrect ? "bg-success/10 border-2 border-success" : "bg-destructive/10 border-2 border-destructive";
                } else if (showResult && opt.isCorrect) {
                  variant = "bg-success/10 border-2 border-success/30";
                }
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleMCQSelect(i)}
                    disabled={showResult}
                    className={`w-full text-left rounded-lg p-4 transition-all active:scale-[0.97] opacity-0 animate-fade-up ${variant} ${!showResult ? "hover:ring-2 hover:ring-ring" : ""}`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <p className="text-sm text-foreground leading-relaxed">{opt.definition}</p>
                      {showResult && opt.isCorrect && <CheckCircle2 className="w-5 h-5 text-success shrink-0" />}
                      {showResult && mcqSelected === i && !opt.isCorrect && <XCircle className="w-5 h-5 text-destructive shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="mb-8 opacity-0 animate-fade-up">
              <div className="flex items-center gap-2 mb-2">
                <Keyboard className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Spell the word</p>
              </div>
              <p className="text-lg font-semibold text-foreground leading-relaxed mb-2">{question.definition}</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{question.partOfSpeech}</span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <input
                type="text"
                value={spellingInput}
                onChange={(e) => setSpellingInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && spellingInput.trim()) handleSpellingSubmit();
                }}
                disabled={showResult}
                placeholder="Type the word…"
                className={`w-full text-center text-2xl font-bold py-4 px-6 rounded-xl border-2 bg-card outline-none transition-all ${
                  showResult
                    ? results[currentQ]
                      ? "border-success bg-success/5 text-success"
                      : "border-destructive bg-destructive/5 text-destructive"
                    : "border-border focus:border-primary text-foreground"
                }`}
                autoFocus
              />
              {showResult && !results[currentQ] && (
                <p className="text-center mt-3 text-sm">
                  <span className="text-muted-foreground">Correct answer: </span>
                  <span className="font-bold text-success">{question.answer}</span>
                </p>
              )}
              {showResult && results[currentQ] && (
                <p className="text-center mt-3 text-sm text-success font-medium">✓ Correct!</p>
              )}
            </div>

            {!showResult && (
              <button
                onClick={handleSpellingSubmit}
                disabled={!spellingInput.trim()}
                className="w-full py-3.5 mt-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-30 flex items-center justify-center gap-2"
              >
                Check Answer
              </button>
            )}
          </>
        )}

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

      <WordStatusPortal counts={counts} words={portalWords} />
    </div>
  );
}
