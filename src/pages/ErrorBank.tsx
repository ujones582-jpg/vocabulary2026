import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, BookOpen } from "lucide-react";
import type { ErrorEntry } from "@/lib/vocabulary";

export default function ErrorBank() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<ErrorEntry[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("vocab-errors") || "[]");
    setEntries(stored);
  }, []);

  const handleDelete = (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem("vocab-errors", JSON.stringify(updated));
  };

  const handleClear = () => {
    setEntries([]);
    localStorage.setItem("vocab-errors", "[]");
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Error Bank</p>
          <p className="text-xs text-muted-foreground">{entries.length} words saved</p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs font-medium text-destructive px-3 py-1.5 rounded-md bg-destructive/10 transition-colors active:scale-95"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center opacity-0 animate-fade-up">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-accent-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No errors yet</p>
            <p className="text-xs text-muted-foreground max-w-[200px]">
              Words you save during practice will appear here for review.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className="bg-card rounded-lg p-4 card-shadow opacity-0 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-bold text-foreground">{entry.word}</h3>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1 rounded-md hover:bg-destructive/10 transition-colors active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="bg-destructive/5 rounded-md p-2.5 border border-destructive/10">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Your answer</p>
                    <p className="text-foreground leading-relaxed">{entry.userSentence}</p>
                  </div>
                  <div className="bg-success/5 rounded-md p-2.5 border border-success/10">
                    <p className="text-xs text-muted-foreground font-medium mb-0.5">Suggestion</p>
                    <p className="text-foreground leading-relaxed">{entry.correction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}