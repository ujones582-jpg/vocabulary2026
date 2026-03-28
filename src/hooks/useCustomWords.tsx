import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { WordBank, VocabWord } from "@/lib/vocabulary";

export function useCustomWords(bank: WordBank) {
  const { user } = useAuth();
  const [customWords, setCustomWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomWords = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("custom_words")
      .select("word, definition, part_of_speech, example")
      .eq("user_id", user.id)
      .eq("bank", bank);

    setCustomWords(
      (data || []).map((d: any) => ({
        word: d.word,
        definition: d.definition,
        partOfSpeech: d.part_of_speech,
        example: d.example || undefined,
      }))
    );
    setLoading(false);
  }, [user, bank]);

  useEffect(() => { fetchCustomWords(); }, [fetchCustomWords]);

  const addWord = useCallback(
    async (word: string, definition: string, partOfSpeech: string, example?: string) => {
      if (!user) return { error: "Not authenticated" };
      const { error } = await supabase.from("custom_words").insert({
        user_id: user.id,
        bank,
        word: word.toLowerCase().trim(),
        definition,
        part_of_speech: partOfSpeech,
        example: example || null,
      });
      if (error) return { error: error.message };
      await fetchCustomWords();
      return { error: null };
    },
    [user, bank, fetchCustomWords]
  );

  const removeWord = useCallback(
    async (word: string) => {
      if (!user) return;
      await supabase
        .from("custom_words")
        .delete()
        .eq("user_id", user.id)
        .eq("bank", bank)
        .eq("word", word);
      await fetchCustomWords();
    },
    [user, bank, fetchCustomWords]
  );

  return { customWords, loading, addWord, removeWord, refetch: fetchCustomWords };
}
