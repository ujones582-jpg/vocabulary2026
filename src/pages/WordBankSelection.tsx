import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { WordBank } from "@/lib/vocabulary";
import { BookOpen, GraduationCap, Plane, Sprout } from "lucide-react";

const banks = [
  {
    id: "academic" as WordBank,
    icon: GraduationCap,
    label: "Advanced Academic",
    desc: "TOEFL · IELTS · SAT",
    emoji: "🎓",
  },
  {
    id: "beginner" as WordBank,
    icon: Sprout,
    label: "Beginner EFL",
    desc: "English as a Foreign Language",
    emoji: "🌱",
  },
  {
    id: "everyday" as WordBank,
    icon: Plane,
    label: "Everyday Conversational",
    desc: "Travel · Idioms · Phone calls",
    emoji: "✈️",
  },
];

export default function WordBankSelection() {
  const [selected, setSelected] = useState<WordBank | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="opacity-0 animate-fade-up" style={{ animationDelay: "0ms" }}>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Vocabulary Master</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground leading-tight">
          Choose your
          <br />
          word bank
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Practice vocabulary through real conversations, not flashcards.
        </p>
      </div>

      {/* Cards */}
      <div className="flex-1 flex flex-col gap-3 mt-8">
        {banks.map((bank, i) => {
          const active = selected === bank.id;
          return (
            <button
              key={bank.id}
              onClick={() => setSelected(bank.id)}
              className={`
                opacity-0 animate-fade-up
                relative w-full text-left rounded-lg p-5 transition-all duration-200
                card-shadow
                ${active
                  ? "bg-primary ring-2 ring-primary"
                  : "bg-card hover:card-shadow-hover"
                }
                active:scale-[0.97]
              `}
              style={{ animationDelay: `${100 + i * 80}ms` }}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{bank.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-base ${active ? "text-primary-foreground" : "text-foreground"}`}>
                    {bank.label}
                  </p>
                  <p className={`text-sm mt-0.5 ${active ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {bank.desc}
                  </p>
                </div>
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors
                  ${active ? "border-primary-foreground bg-primary-foreground" : "border-muted-foreground/30"}
                `}>
                  {active && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Start button */}
      <div className="pt-6 opacity-0 animate-fade-up" style={{ animationDelay: "400ms" }}>
        <button
          disabled={!selected}
          onClick={() => selected && navigate(`/practice?bank=${selected}`)}
          className={`
            w-full py-4 rounded-lg font-semibold text-base transition-all duration-200 active:scale-[0.97]
            ${selected
              ? "bg-primary text-primary-foreground card-shadow"
              : "bg-muted text-muted-foreground cursor-not-allowed"
            }
          `}
        >
          Start Practice
        </button>
      </div>
    </div>
  );
}