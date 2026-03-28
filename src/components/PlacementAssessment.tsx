import { useState } from "react";
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import type { WordBank } from "@/lib/vocabulary";

/* ── Assessment config ─────────────────────────────────────── */

const standardizedTests = [
  { id: "toefl", label: "TOEFL", min: 0, max: 120, placeholder: "0–120",
    thresholds: [
      { cutoff: 40, bank: "beginner" as WordBank },
      { cutoff: 61, bank: "intermediate" as WordBank },
      { cutoff: 91, bank: "everyday" as WordBank },
      { cutoff: 106, bank: "academic" as WordBank },
      { cutoff: 121, bank: "native" as WordBank },
    ]},
  { id: "ielts", label: "IELTS", min: 0, max: 9, placeholder: "0–9", step: 0.5,
    thresholds: [
      { cutoff: 4, bank: "beginner" as WordBank },
      { cutoff: 6, bank: "intermediate" as WordBank },
      { cutoff: 7.5, bank: "everyday" as WordBank },
      { cutoff: 8.5, bank: "academic" as WordBank },
      { cutoff: 10, bank: "native" as WordBank },
    ]},
  { id: "sat", label: "SAT (Reading & Writing)", min: 200, max: 800, placeholder: "200–800",
    thresholds: [
      { cutoff: 400, bank: "beginner" as WordBank },
      { cutoff: 530, bank: "intermediate" as WordBank },
      { cutoff: 650, bank: "everyday" as WordBank },
      { cutoff: 730, bank: "academic" as WordBank },
      { cutoff: 801, bank: "native" as WordBank },
    ]},
];

type VocabQuestion = { word: string; definition: string; level: WordBank; fakeDefinitions: string[] };

const vocabPool: VocabQuestion[] = [
  // ── Beginner ──
  { word: "happy", definition: "feeling pleasure or joy", level: "beginner", fakeDefinitions: ["feeling tired", "a type of food", "to walk slowly"] },
  { word: "friend", definition: "a person you know well and like", level: "beginner", fakeDefinitions: ["a kind of weather", "a large building", "to run quickly"] },
  { word: "water", definition: "a clear liquid essential for life", level: "beginner", fakeDefinitions: ["a musical instrument", "a warm feeling", "a type of rock"] },
  { word: "help", definition: "to make it easier for someone to do something", level: "beginner", fakeDefinitions: ["to break apart", "a loud sound", "a kind of plant"] },
  { word: "bright", definition: "giving out or reflecting a lot of light", level: "beginner", fakeDefinitions: ["very heavy", "extremely slow", "a type of animal"] },

  // ── Intermediate ──
  { word: "community", definition: "a group of people living in the same area or sharing interests", level: "intermediate", fakeDefinitions: ["a type of building", "a loud noise", "an old tradition"] },
  { word: "generous", definition: "willing to give more than is expected", level: "intermediate", fakeDefinitions: ["very dangerous", "related to science", "extremely tired"] },
  { word: "influence", definition: "the power to affect how someone thinks or behaves", level: "intermediate", fakeDefinitions: ["a type of illness", "a cooking method", "a piece of furniture"] },
  { word: "curious", definition: "eager to know or learn something", level: "intermediate", fakeDefinitions: ["feeling angry", "very expensive", "related to sports"] },
  { word: "essential", definition: "absolutely necessary or extremely important", level: "intermediate", fakeDefinitions: ["completely optional", "a type of fabric", "relating to desserts"] },

  // ── Everyday ──
  { word: "elaborate", definition: "involving many carefully arranged parts or details", level: "everyday", fakeDefinitions: ["to destroy completely", "very small in size", "related to electricity"] },
  { word: "compromise", definition: "an agreement reached by each side making concessions", level: "everyday", fakeDefinitions: ["to promise something secret", "a type of computer hardware", "a formal complaint"] },
  { word: "resilient", definition: "able to recover quickly from difficulties", level: "everyday", fakeDefinitions: ["very fragile", "related to reptiles", "having a pleasant smell"] },
  { word: "ambiguous", definition: "open to more than one interpretation", level: "everyday", fakeDefinitions: ["extremely ambitious", "a type of vehicle", "related to music"] },
  { word: "inevitable", definition: "certain to happen and unavoidable", level: "everyday", fakeDefinitions: ["easily prevented", "a type of invention", "related to navigation"] },

  // ── Academic ──
  { word: "ubiquitous", definition: "present, appearing, or found everywhere", level: "academic", fakeDefinitions: ["extremely rare", "related to underwater life", "having a strong smell"] },
  { word: "pragmatic", definition: "dealing with things sensibly and realistically", level: "academic", fakeDefinitions: ["overly dramatic", "relating to grammar rules", "very old-fashioned"] },
  { word: "paradigm", definition: "a typical example or model of something", level: "academic", fakeDefinitions: ["a type of paradox", "a unit of measurement", "a mathematical formula"] },
  { word: "empirical", definition: "based on observation or experience rather than theory", level: "academic", fakeDefinitions: ["related to an empire", "extremely emotional", "a type of chemical"] },
  { word: "juxtapose", definition: "to place close together for comparison or contrast", level: "academic", fakeDefinitions: ["to arrange in order of size", "to remove completely", "to speak very loudly"] },

  // ── Native / C2 ──
  { word: "equanimity", definition: "mental calmness and composure, especially in a difficult situation", level: "native", fakeDefinitions: ["physical balance and coordination", "fairness in legal proceedings", "equality between groups"] },
  { word: "recalcitrant", definition: "stubbornly resistant to authority or control", level: "native", fakeDefinitions: ["easily persuaded", "related to mathematics", "a type of gemstone"] },
  { word: "perspicacious", definition: "having a ready insight into and understanding of things", level: "native", fakeDefinitions: ["prone to sweating heavily", "related to perspective drawing", "easily distracted"] },
  { word: "sycophant", definition: "a person who flatters someone important for personal gain", level: "native", fakeDefinitions: ["a large musical instrument", "a type of elephant", "someone who studies plants"] },
  { word: "verisimilitude", definition: "the appearance of being true or real", level: "native", fakeDefinitions: ["the study of truth in philosophy", "a type of visual illusion", "exactness in measurements"] },
];

const QUESTIONS_PER_LEVEL = 1;

/** Pick one random question per level for a varied quiz each time */
function pickQuizQuestions(): VocabQuestion[] {
  const levels: WordBank[] = ["beginner", "intermediate", "everyday", "academic", "native"];
  const picked: VocabQuestion[] = [];
  for (const level of levels) {
    const pool = vocabPool.filter(q => q.level === level);
    picked.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  // Add one extra academic question for better discrimination
  const academicPool = vocabPool.filter(q => q.level === "academic");
  const alreadyPicked = picked.find(p => p.level === "academic")!;
  const remaining = academicPool.filter(q => q.word !== alreadyPicked.word);
  if (remaining.length > 0) {
    picked.splice(4, 0, remaining[Math.floor(Math.random() * remaining.length)]);
  }
  return picked;
}

type Step = "tests" | "vocab" | "result";

interface Props {
  onSelect: (bank: WordBank) => void;
  onBack: () => void;
}

/* ── Scoring algorithm ─────────────────────────────────────── */

function scoreToBankFromTest(testId: string, score: number): WordBank {
  const test = standardizedTests.find(t => t.id === testId);
  if (!test) return "beginner";
  for (const t of test.thresholds) {
    if (score < t.cutoff) return t.bank;
  }
  return "native";
}

function computeRecommendation(
  testEntries: { testId: string; score: number }[],
  vocabCorrect: boolean[],
  quizQuestions: VocabQuestion[],
): WordBank {
  const scores: Record<WordBank, number> = { beginner: 0, intermediate: 0, everyday: 0, academic: 0, native: 0 };

  testEntries.forEach(({ testId, score }) => {
    const bank = scoreToBankFromTest(testId, score);
    scores[bank] += 3;
  });

  quizQuestions.forEach((w, i) => {
    if (vocabCorrect[i]) {
      const levelOrder: WordBank[] = ["beginner", "intermediate", "everyday", "academic", "native"];
      const idx = levelOrder.indexOf(w.level);
      if (idx < 4) scores[levelOrder[idx + 1]] += 1;
      else scores[w.level] += 1;
    } else {
      scores[w.level] += 1;
    }
  });

  const ranked = (Object.entries(scores) as [WordBank, number][]).sort((a, b) => b[1] - a[1]);
  return ranked[0][0];
}

/* ── Component ─────────────────────────────────────────────── */

export default function PlacementAssessment({ onSelect, onBack }: Props) {
  const [step, setStep] = useState<Step>("tests");

  // Test step state
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [testScores, setTestScores] = useState<Record<string, number>>({});

  // Vocab quiz state
  const [vocabIdx, setVocabIdx] = useState(0);
  const [vocabAnswers, setVocabAnswers] = useState<(number | null)[]>(Array(vocabQuizWords.length).fill(null));
  const [vocabRevealed, setVocabRevealed] = useState(false);

  // Result
  const [recommendation, setRecommendation] = useState<WordBank | null>(null);

  const bankLabels: Record<WordBank, string> = {
    beginner: "Beginner EFL",
    intermediate: "Upper Primary & Middle School",
    everyday: "Everyday Conversational",
    academic: "Advanced Academic",
    native: "Native & University / Work",
  };

  const bankTags: Record<WordBank, string> = {
    beginner: "A1",
    intermediate: "B1",
    everyday: "B2",
    academic: "C1",
    native: "C2",
  };

  /* ── Handlers ── */

  const toggleTest = (id: string) => {
    setSelectedTests(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
    // Clear score when deselected
    if (selectedTests.includes(id)) {
      setTestScores(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const goToVocab = () => setStep("vocab");

  const handleVocabAnswer = (choiceIdx: number) => {
    if (vocabRevealed) return;
    const updated = [...vocabAnswers];
    updated[vocabIdx] = choiceIdx;
    setVocabAnswers(updated);
    setVocabRevealed(true);
  };

  const nextVocabQuestion = () => {
    setVocabRevealed(false);
    if (vocabIdx < vocabQuizWords.length - 1) {
      setVocabIdx(vocabIdx + 1);
    } else {
      // Calculate result
      const testEntries = selectedTests
        .filter(id => testScores[id] !== undefined)
        .map(id => ({ testId: id, score: testScores[id] }));
      const currentWord = vocabQuizWords;
      const correct = vocabAnswers.map((ans, i) => {
        if (ans === null) return false;
        const w = currentWord[i];
        const choices = shuffledChoices(w);
        return choices[ans!] === w.definition;
      });
      const rec = computeRecommendation(testEntries, correct);
      setRecommendation(rec);
      setStep("result");
    }
  };

  // Deterministic shuffle based on word
  const shuffledChoices = (w: typeof vocabQuizWords[0]) => {
    const all = [w.definition, ...w.fakeDefinitions];
    // Simple stable shuffle using word char codes as seed
    const seed = w.word.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return all
      .map((v, i) => ({ v, sort: (seed * (i + 1) * 7) % 97 }))
      .sort((a, b) => a.sort - b.sort)
      .map(x => x.v);
  };

  const currentVocab = vocabQuizWords[vocabIdx];
  const currentChoices = currentVocab ? shuffledChoices(currentVocab) : [];
  const isCurrentCorrect = vocabRevealed && vocabAnswers[vocabIdx] !== null
    ? currentChoices[vocabAnswers[vocabIdx]!] === currentVocab?.definition
    : null;

  /* ── Render ── */

  if (step === "tests") {
    return (
      <div className="min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
        <div>
          <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1">Placement</p>
          <h1 className="font-display text-2xl text-foreground leading-tight">
            Help us find your level
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Have you taken any standardized English tests? Select all that apply, or skip to the vocab quiz.
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-3 mt-6">
          {standardizedTests.map(test => {
            const active = selectedTests.includes(test.id);
            return (
              <div key={test.id} className="space-y-2">
                <button
                  onClick={() => toggleTest(test.id)}
                  className={`w-full text-left rounded-lg p-3.5 transition-all border active:scale-[0.98]
                    ${active ? "bg-primary/10 border-primary" : "bg-card border-border hover:border-foreground/15"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-sm ${active ? "text-primary" : "text-foreground"}`}>{test.label}</span>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                      ${active ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                      {active && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </div>
                </button>

                {active && (
                  <div className="pl-2 mt-1">
                    <input
                      type="number"
                      min={test.min}
                      max={test.max}
                      step={test.step ?? 1}
                      placeholder={test.placeholder}
                      value={testScores[test.id] ?? ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          setTestScores(prev => ({ ...prev, [test.id]: val }));
                        } else {
                          setTestScores(prev => { const n = { ...prev }; delete n[test.id]; return n; });
                        }
                      }}
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Score range: {test.placeholder}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-6 space-y-3">
          <button
            onClick={goToVocab}
            className="w-full py-3.5 rounded-lg font-semibold text-sm bg-primary text-primary-foreground transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          >
            Next: Vocab Quiz
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onBack}
            className="w-full py-2.5 text-sm text-muted-foreground font-medium flex items-center justify-center gap-1.5 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to manual selection
          </button>
        </div>
      </div>
    );
  }

  if (step === "vocab") {
    return (
      <div className="min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
        <div>
          <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1">
            Question {vocabIdx + 1} of {vocabQuizWords.length}
          </p>
          <h1 className="font-display text-2xl text-foreground leading-tight">
            What does "<span className="text-primary">{currentVocab.word}</span>" mean?
          </h1>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-muted rounded-full mt-4">
          <div
            className="h-1 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((vocabIdx + 1) / vocabQuizWords.length) * 100}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col gap-2.5 mt-6">
          {currentChoices.map((choice, idx) => {
            const selected = vocabAnswers[vocabIdx] === idx;
            const isCorrectAnswer = choice === currentVocab.definition;
            let style = "bg-card border-border hover:border-foreground/15 text-foreground";

            if (vocabRevealed) {
              if (isCorrectAnswer) {
                style = "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400";
              } else if (selected && !isCorrectAnswer) {
                style = "bg-destructive/10 border-destructive text-destructive";
              } else {
                style = "bg-card border-border text-muted-foreground";
              }
            } else if (selected) {
              style = "bg-primary/10 border-primary text-primary";
            }

            return (
              <button
                key={idx}
                onClick={() => handleVocabAnswer(idx)}
                disabled={vocabRevealed}
                className={`w-full text-left rounded-lg p-4 transition-all border active:scale-[0.98] text-sm ${style}`}
              >
                <div className="flex items-center gap-3">
                  {vocabRevealed && isCorrectAnswer && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                  {vocabRevealed && selected && !isCorrectAnswer && <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                  <span>{choice}</span>
                </div>
              </button>
            );
          })}
        </div>

        {vocabRevealed && (
          <div className="pt-4">
            <p className={`text-sm font-medium mb-3 ${isCurrentCorrect ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
              {isCurrentCorrect ? "Correct!" : "Not quite — that's okay!"}
            </p>
            <button
              onClick={nextVocabQuestion}
              className="w-full py-3.5 rounded-lg font-semibold text-sm bg-primary text-primary-foreground transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            >
              {vocabIdx < vocabQuizWords.length - 1 ? "Next Question" : "See My Result"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Result step
  return (
    <div className="min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase mb-2">We recommend</p>
        <h1 className="font-display text-2xl text-foreground leading-tight">
          {bankLabels[recommendation!]}
        </h1>
        <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
          {bankTags[recommendation!]}
        </span>
        <p className="text-muted-foreground text-sm mt-4 max-w-[280px]">
          Based on your test scores and vocabulary knowledge, this level is the best fit for you right now.
        </p>
      </div>

      <div className="pt-6 space-y-3">
        <button
          onClick={() => onSelect(recommendation!)}
          className="w-full py-3.5 rounded-lg font-semibold text-sm bg-primary text-primary-foreground transition-all active:scale-[0.97]"
        >
          Start with {bankLabels[recommendation!]}
        </button>
        <button
          onClick={onBack}
          className="w-full py-2.5 text-sm text-muted-foreground font-medium flex items-center justify-center gap-1.5 hover:text-foreground transition-colors"
        >
          Choose a different level
        </button>
      </div>
    </div>
  );
}
