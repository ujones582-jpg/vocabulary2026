import { useState, useMemo } from "react";
import { X, Search, Eye, BookCheck, Crown, EyeOff, RefreshCw } from "lucide-react";
import type { WordStatusLevel } from "@/hooks/useWordStatus";
import type { VocabWord } from "@/lib/vocabulary";

interface Props {
  open: boolean;
  onClose: () => void;
  words: VocabWord[];
  getStatus: (word: string) => WordStatusLevel;
  counts: { unseen: number; seen: number; developing: number; learnt: number; mastered: number };
}

const statusConfig: Record<WordStatusLevel, { icon: React.ElementType; label: string; colorClass: string; bgClass: string }> = {
  unseen: { icon: EyeOff, label: "Unseen", colorClass: "text-muted-foreground", bgClass: "bg-muted" },
  seen: { icon: Eye, label: "Seen", colorClass: "text-amber-600 dark:text-amber-400", bgClass: "bg-amber-500/10" },
  developing: { icon: RefreshCw, label: "Developing", colorClass: "text-orange-600 dark:text-orange-400", bgClass: "bg-orange-500/10" },
  learnt: { icon: BookCheck, label: "Learnt", colorClass: "text-blue-600 dark:text-blue-400", bgClass: "bg-blue-500/10" },
  mastered: { icon: Crown, label: "Mastered", colorClass: "text-emerald-600 dark:text-emerald-400", bgClass: "bg-emerald-500/10" },
};

export default function WordDetailsModal({ open, onClose, words, getStatus, counts }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<WordStatusLevel | "all">("all");

  const filtered = useMemo(() => {
    let list = words.map((w) => ({ ...w, status: getStatus(w.word) }));
    if (filter !== "all") list = list.filter((w) => w.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((w) => w.word.toLowerCase().includes(q) || w.definition.toLowerCase().includes(q));
    }
    return list;
  }, [words, getStatus, filter, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95">
          <X className="w-5 h-5 text-foreground" />
        </button>
        <p className="text-sm font-semibold text-foreground flex-1">Word Details</p>
        <span className="text-xs text-muted-foreground">{filtered.length} words</span>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words or definitions…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            autoFocus
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto">
        <button
          onClick={() => setFilter("all")}
          className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({words.length})
        </button>
        {(["unseen", "seen", "developing", "learnt", "mastered"] as WordStatusLevel[]).map((s) => {
          const cfg = statusConfig[s];
          return (
            <button
              key={s}
              onClick={() => setFilter(filter === s ? "all" : s)}
              className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === s ? `${cfg.bgClass} ${cfg.colorClass} ring-1 ring-current` : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cfg.label} ({counts[s]})
            </button>
          );
        })}
      </div>

      {/* Word list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.map((w, i) => {
          const cfg = statusConfig[w.status];
          const Icon = cfg.icon;
          return (
            <div key={`${w.word}-${i}`} className="bg-card rounded-lg p-3 card-shadow">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 shrink-0 ${cfg.colorClass}`} />
                <span className="text-sm font-bold text-foreground flex-1">{w.word}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${cfg.bgClass} ${cfg.colorClass}`}>{cfg.label}</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">{w.definition}</p>
              <p className="text-[10px] text-muted-foreground ml-6 mt-0.5 italic">{w.partOfSpeech}</p>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No words found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
