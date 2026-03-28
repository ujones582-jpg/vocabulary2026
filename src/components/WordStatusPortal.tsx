import { useState } from "react";
import { ChevronRight, ChevronLeft, Eye, BookCheck, Crown, EyeOff, RefreshCw } from "lucide-react";
import type { WordStatusLevel } from "@/hooks/useWordStatus";

interface Props {
  counts: { unseen: number; seen: number; developing: number; learnt: number; mastered: number };
  words: { word: string; status: WordStatusLevel }[];
}

const statusConfig: Record<WordStatusLevel, { icon: React.ElementType; label: string; colorClass: string; bgClass: string }> = {
  unseen: { icon: EyeOff, label: "Unseen", colorClass: "text-muted-foreground", bgClass: "bg-muted" },
  seen: { icon: Eye, label: "Seen", colorClass: "text-amber-700", bgClass: "bg-amber-500/8" },
  developing: { icon: RefreshCw, label: "Growing", colorClass: "text-orange-700", bgClass: "bg-orange-500/8" },
  learnt: { icon: BookCheck, label: "Learnt", colorClass: "text-blue-700", bgClass: "bg-blue-500/8" },
  mastered: { icon: Crown, label: "Mastered", colorClass: "text-emerald-700", bgClass: "bg-emerald-500/8" },
};

export default function WordStatusPortal({ counts, words }: Props) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<WordStatusLevel | "all">("all");

  const filtered = filter === "all" ? words : words.filter((w) => w.status === filter);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-card border border-border rounded-l-lg px-1.5 py-4 card-shadow hover:bg-muted transition-colors"
      >
        {open ? <ChevronRight className="w-4 h-4 text-foreground" /> : <ChevronLeft className="w-4 h-4 text-foreground" />}
      </button>

      <div
        className={`fixed right-0 top-0 h-full w-72 bg-card border-l border-border z-20 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div className="p-4 border-b border-border">
          <h3 className="font-display text-base text-foreground mb-3">Word Progress</h3>
          <div className="grid grid-cols-5 gap-1">
            {(["unseen", "seen", "developing", "learnt", "mastered"] as WordStatusLevel[]).map((s) => {
              const cfg = statusConfig[s];
              const Icon = cfg.icon;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(filter === s ? "all" : s)}
                  className={`flex flex-col items-center p-1.5 rounded-md transition-all ${
                    filter === s ? `${cfg.bgClass} ring-1 ring-current ${cfg.colorClass}` : "hover:bg-muted"
                  }`}
                >
                  <Icon className={`w-3 h-3 ${cfg.colorClass}`} />
                  <span className={`text-xs font-bold mt-0.5 ${cfg.colorClass}`}>{counts[s]}</span>
                  <span className="text-[9px] text-muted-foreground leading-tight">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filtered.map((w) => {
            const cfg = statusConfig[w.status];
            const Icon = cfg.icon;
            return (
              <div key={w.word} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${cfg.colorClass}`} />
                <span className="text-sm text-foreground truncate flex-1">{w.word}</span>
                <span className={`text-[10px] font-medium ${cfg.colorClass}`}>{cfg.label}</span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No words in this category yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
