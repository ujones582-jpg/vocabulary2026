import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, RotateCcw, MessageSquare, Keyboard } from "lucide-react";
import type { WordBank, VocabWord } from "@/lib/vocabulary";
import { getWordBank } from "@/lib/vocabulary";
import { useWordStatus } from "@/hooks/useWordStatus";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import WordStatusPortal from "@/components/WordStatusPortal";

interface MCQQuestion {
  type: "mcq";
  word: string;
  correctDefinition: string;
  options: { id: number; definition: string; isCorrect: boolean }[];
}

interface SpellingQuestion {
  type: "spelling";
  definition: string;
  partOfSpeech: string;
  answer: string;
  example?: string;
}

type QuizQuestion = MCQQuestion | SpellingQuestion;

function buildQuestions(quizWords: VocabWord[], allWords: VocabWord[]): QuizQuestion[] {
  return quizWords.map((w, idx) => {
    if (idx % 2 === 0) {
      const wrongWords = allWords.filter((aw) => aw.word !== w.word);
      const shuffled = [...wrongWords].sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [
        { id: 0, definition: w.definition, isCorrect: true },
        ...shuffled.map((sw, i) => ({ id: i + 1, definition: sw.definition, isCorrect: false })),
      ].sort(() => Math.random() - 0.5);
      return { type: "mcq" as const, word: w.word, correctDefinition: w.definition, options };
    } else {
      return { type: "spelling" as const, definition: w.definition, partOfSpeech: w.partOfSpeech, answer: w.word, example: w.example };
    }
  });
}

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const bank = (searchParams.get("bank") || "academic") as WordBank;
  const source = searchParams.get("source");
  const navigate = useNavigate();
  const { user } = useAuth();
  const allWords = useMemo(() => getWordBank(bank), [bank]);
  const { getQuizWords, getStatus, counts, recordQuizAnswer, loading } = useWordStatus(bank);

  const [quizWords, setQuizWords] = useState<VocabWord[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [noWords, setNoWords] = useState(false);

  // Fetch error words if source=errors
  useEffect(() => {
    if (source !== "errors" || !user || initialized) return;
    const fetchErrorWords = async () => {
      const { data } = await supabase
        .from("user_errors")
        .select("word")
        .eq("user_id", user.id);

      if (!data || data.length === 0) {
        setNoWords(true);
        setInitialized(true);
        return;
      }

      const errorWordNames = [...new Set(data.map(d => d.word))];
      const matched = allWords.filter(w => errorWordNames.includes(w.word));
      if (matched.length === 0) {
        setNoWords(true);
      } else {
        const selected = matched.sort(() => Math.random() - 0.5).slice(0, 10);
        setQuizWords(selected);
        setQuestions(buildQuestions(selected, allWords));
      }
      setInitialized(true);
    };
    fetchErrorWords();
  }, [source, user, initialized, allWords]);

  // Normal quiz init
  if (!loading && !initialized && source !== "errors") {
    const words = getQuizWords(10);
    if (words.length === 0) {
      setNoWords(true);
    } else {
      setQuizWords(words);
      setQuestions(buildQuestions(words, allWords));
    }
    setInitialized(true);
  }

  const [currentQ, setCurrentQ] = useState(0);
  const [mcqSelected, setMcqSelected] = useState<number | null>(null);
  const [spellingInput, setSpellingInput] = useState("");
  const [results, setResults] = useState<(boolean | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  if (questions.length > 0 && results.length === 0) {
    setResults(new Array(questions.length).fill(null));
  }

  const question = questions[currentQ];
  const correctCount = results.filter((r) => r === true).length;
  const incorrectCount = results.filter((r) => r === false).length;

  // Save an incorrect answer to the error bank
  const saveError = useCallback(async (word: string, userAnswer: string, correction: string) => {
    if (!user) return;
    await supabase.from("user_errors").insert({
      user_id: user.id,
      bank,
      word,
      user_sentence: userAnswer,
      correction,
    });
  }, [user, bank]);

  const handleMCQSelect = useCallback(
    async (idx: number) => {
      if (showResult || !question || question.type !== "mcq") return;
      setMcqSelected(idx);
      const isCorrect = question.options[idx].isCorrect;
      setResults((prev) => { const n = [...prev]; n[currentQ] = isCorrect; return n; });
      setShowResult(true);
      await recordQuizAnswer(question.word, "mcq", isCorrect);
      if (!isCorrect) {
        const chosenDef = question.options[idx].definition;
        const correctDef = question.options.find(o => o.isCorrect)?.definition || "";
        await saveError(question.word, `Chose: "${chosenDef}"`, `Correct: "${correctDef}"`);
      }
    },
    [showResult, question, currentQ, recordQuizAnswer, saveError]
  );

  const handleSpellingSubmit = useCallback(async () => {
    if (showResult || !question || question.type !== "spelling") return;
    const isCorrect = spellingInput.trim().toLowerCase() === question.answer.toLowerCase();
    setResults((prev) => { const n = [...prev]; n[currentQ] = isCorrect; return n; });
    setShowResult(true);
    await recordQuizAnswer(question.answer, "spelling", isCorrect);
    if (!isCorrect) {
      await saveError(question.answer, `Typed: "${spellingInput.trim()}"`, `Correct spelling: "${question.answer}"`);
    }
  }, [showResult, question, currentQ, spellingInput, recordQuizAnswer, saveError]);

  const handleNext = useCallback(() => {
    setMcqSelected(null);
    setSpellingInput("");
    setShowResult(false);
    if (currentQ < questions.length - 1) setCurrentQ((i) => i + 1);
    else setFinished(true);
  }, [currentQ, questions.length]);

  const handleRetry = () => {
    if (source === "errors") {
      setInitialized(false);
    } else {
      const words = getQuizWords(10);
      setQuizWords(words);
      setQuestions(buildQuestions(words, allWords));
    }
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

  const portalWords = quizWords.map((w) => ({ word: w.word, status: getStatus(w.word) }));

  const quizLabel = source === "errors" ? "Mistake Practice" : "Quiz";

  if (noWords) {
    return (
      <div className="min-h-screen flex flex-col max-w-md mx-auto">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(`/learn?bank=${bank}`)} className="p-1.5 rounded hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <p className="text-sm font-semibold text-foreground">{quizLabel}</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
          <h2 className="font-display text-xl text-foreground mb-2">
            {source === "errors" ? "No mistake words found" : "No words to quiz yet"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {source === "errors" ? "Your error bank is empty." : "Study flashcards first so words become \"Seen\"."}
          </p>
          <button
            onClick={() => navigate(source === "errors" ? `/learn?bank=${bank}` : `/flashcards?bank=${bank}`)}
            className="py-3 px-8 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97]"
          >
            {source === "errors" ? "Back to dashboard" : "Study flashcards"}
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
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(`/learn?bank=${bank}`)} className="p-1.5 rounded hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <p className="text-sm font-semibold text-foreground">Results</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <h2 className="font-display text-4xl text-foreground mb-2">{score}%</h2>
          <p className="text-sm text-muted-foreground mb-8">{correctCount} correct · {incorrectCount} incorrect</p>

          {weakWords.length > 0 && (
            <div className="w-full bg-card rounded-lg p-4 border border-border mb-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Review these</p>
              <div className="flex flex-wrap gap-2">
                {weakWords.map((w) => (
                  <span key={w} className="text-sm bg-destructive/10 text-destructive px-2.5 py-1 rounded font-medium">{w}</span>
                ))}
              </div>
            </div>
          )}

          <div className="w-full space-y-2.5">
            <button onClick={() => navigate(`/flashcards?bank=${bank}`)} className="w-full py-3 rounded-lg bg-card border border-border text-foreground text-sm font-medium transition-all active:scale-[0.97] flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Keep studying
            </button>
            {passed && (
              <button onClick={() => navigate(`/practice?bank=${bank}`)} className="w-full py-3 rounded-lg bg-accent text-accent-foreground text-sm font-medium border border-border transition-all active:scale-[0.97] flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" /> Try conversation
              </button>
            )}
            <button onClick={handleRetry} className="w-full py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97]">
              Retry quiz
            </button>
            <button onClick={() => navigate(`/learn?bank=${bank}`)} className="w-full py-2 text-sm text-muted-foreground font-medium hover:text-foreground transition-colors">
              Back
            </button>
          </div>
        </div>
        <WordStatusPortal counts={counts} words={portalWords} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(`/learn?bank=${bank}`)} className="p-1.5 rounded hover:bg-muted transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{quizLabel}</p>
          <p className="text-xs text-muted-foreground">{currentQ + 1} / {questions.length}</p>
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
            <div className="mb-8">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Define this word</p>
              <h2 className="font-display text-3xl text-foreground">{question.word}</h2>
            </div>
            <div className="space-y-2.5 flex-1">
              {question.options.map((opt, i) => {
                let variant = "bg-card border border-border";
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
                    className={`w-full text-left rounded-lg p-4 transition-all active:scale-[0.98] ${variant} ${!showResult ? "hover:border-foreground/20" : ""}`}
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
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Keyboard className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Spell the word</p>
              </div>
              <p className="text-base font-medium text-foreground leading-relaxed mb-2">{question.definition}</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{question.partOfSpeech}</span>

              {!showHint ? (
                <button
                  onClick={() => setShowHint(true)}
                  className="mt-4 text-xs text-primary font-medium hover:underline transition-colors"
                >
                  Show hint
                </button>
              ) : (
                <>
                  {/* Letter hint */}
                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="text-sm font-bold text-primary">{question.answer[0].toUpperCase()}</span>
                    {Array.from({ length: question.answer.length - 1 }).map((_, i) => (
                      <span key={i} className="w-3.5 h-0.5 bg-muted-foreground/30 rounded-full" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">({question.answer.length} letters)</span>
                  </div>

                  {/* Example sentence hint */}
                  {question.example && (
                    <p className="mt-3 text-sm text-muted-foreground italic leading-relaxed">
                      &ldquo;{question.example.replace(new RegExp(question.answer, "gi"), "______")}&rdquo;
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <input
                type="text"
                value={spellingInput}
                onChange={(e) => setSpellingInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && spellingInput.trim()) handleSpellingSubmit(); }}
                disabled={showResult}
                placeholder="Type the word…"
                className={`w-full text-center text-2xl font-bold py-4 px-6 rounded-xl border-2 bg-card outline-none transition-all ${
                  showResult
                    ? results[currentQ] ? "border-success bg-success/5 text-success" : "border-destructive bg-destructive/5 text-destructive"
                    : "border-border focus:border-primary text-foreground"
                }`}
                autoFocus
              />
              {showResult && !results[currentQ] && (
                <p className="text-center mt-3 text-sm">
                  <span className="text-muted-foreground">Correct: </span>
                  <span className="font-bold text-success">{question.answer}</span>
                </p>
              )}
              {showResult && results[currentQ] && (
                <p className="text-center mt-3 text-sm text-success font-medium">Correct</p>
              )}
            </div>

            {!showResult && (
              <button
                onClick={handleSpellingSubmit}
                disabled={!spellingInput.trim()}
                className="w-full py-3 mt-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-30"
              >
                Check
              </button>
            )}
          </>
        )}

        {showResult && (
          <button
            onClick={handleNext}
            className="w-full py-3 mt-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          >
            {currentQ < questions.length - 1 ? "Next" : "See results"}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <WordStatusPortal counts={counts} words={portalWords} />
    </div>
  );
}
