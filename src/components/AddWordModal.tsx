import { useState } from "react";
import { X, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (word: string, definition: string, partOfSpeech: string, example?: string) => Promise<{ error: string | null }>;
  bank: string;
}

export default function AddWordModal({ open, onClose, onAdd, bank }: Props) {
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [example, setExample] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!word.trim()) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("vocab-chat", {
        body: { type: "define_word", word: word.trim() },
      });
      if (error) throw error;
      if (data?.definition) setDefinition(data.definition);
      if (data?.partOfSpeech) setPartOfSpeech(data.partOfSpeech);
      if (data?.example) setExample(data.example);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed to generate definition", description: e?.message || "Try again." });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!word.trim() || !definition.trim() || !partOfSpeech.trim()) return;
    setSaving(true);
    const { error } = await onAdd(word.trim(), definition.trim(), partOfSpeech.trim(), example.trim() || undefined);
    setSaving(false);
    if (error) {
      toast({ variant: "destructive", title: "Could not add word", description: error });
    } else {
      toast({ title: "Word added", description: `"${word.trim()}" is now in your word bank.` });
      setWord(""); setDefinition(""); setPartOfSpeech(""); setExample("");
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/30 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-card rounded-t-xl sm:rounded-xl w-full max-w-md card-shadow">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-display text-lg text-foreground">Add a word</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Word input + generate */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Word</label>
            <div className="flex gap-2">
              <input
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="e.g. serendipity"
                className="flex-1 bg-background rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-ring transition-colors"
              />
              <button
                onClick={handleGenerate}
                disabled={!word.trim() || generating}
                className="px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium transition-all active:scale-95 disabled:opacity-40 flex items-center gap-1.5 shrink-0"
              >
                {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {generating ? "Looking up…" : "Look up"}
              </button>
            </div>
          </div>

          {/* Definition */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Definition</label>
            <textarea
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              rows={2}
              placeholder="The definition will appear here after lookup, or type your own"
              className="w-full bg-background rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-ring transition-colors resize-none"
            />
          </div>

          {/* Part of speech */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Part of speech</label>
            <input
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value)}
              placeholder="noun, verb, adjective…"
              className="w-full bg-background rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-ring transition-colors"
            />
          </div>

          {/* Example */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Example sentence <span className="text-muted-foreground/60">(optional)</span></label>
            <input
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="Use the word in a sentence"
              className="w-full bg-background rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-ring transition-colors"
            />
          </div>
        </div>

        <div className="px-5 pb-5 pt-1 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground transition-all active:scale-[0.97]">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!word.trim() || !definition.trim() || !partOfSpeech.trim() || saving}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all active:scale-[0.97] disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add word
          </button>
        </div>
      </div>
    </div>
  );
}
