import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { WordBank, VocabWord } from "@/lib/vocabulary";
import { getWordBank } from "@/lib/vocabulary";

export type WordStatusLevel = "unseen" | "seen" | "learnt" | "mastered";

export interface WordStatusRecord {
  word: string;
  status: WordStatusLevel;
  mcq_correct_streak: number;
  spelling_correct_streak: number;
  ai_chat_used: boolean;
}

export function useWordStatus(bank: WordBank) {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<Map<string, WordStatusRecord>>(new Map());
  const [loading, setLoading] = useState(true);

  const allWords = getWordBank(bank);

  // Fetch all statuses for this bank
  const fetchStatuses = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("word_status")
      .select("word, status, mcq_correct_streak, spelling_correct_streak, ai_chat_used")
      .eq("user_id", user.id)
      .eq("bank", bank);

    const map = new Map<string, WordStatusRecord>();
    if (data) {
      for (const row of data) {
        map.set(row.word, {
          word: row.word,
          status: row.status as WordStatusLevel,
          mcq_correct_streak: row.mcq_correct_streak,
          spelling_correct_streak: row.spelling_correct_streak,
          ai_chat_used: row.ai_chat_used,
        });
      }
    }
    setStatuses(map);
    setLoading(false);
  }, [user, bank]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const getStatus = useCallback(
    (word: string): WordStatusLevel => statuses.get(word)?.status || "unseen",
    [statuses]
  );

  // Mark a word as seen (only if unseen)
  const markSeen = useCallback(
    async (word: string) => {
      if (!user) return;
      const current = statuses.get(word);
      if (current && current.status !== "unseen") return; // already seen+

      await supabase.from("word_status").upsert(
        {
          user_id: user.id,
          bank,
          word,
          status: "seen",
          mcq_correct_streak: 0,
          spelling_correct_streak: 0,
          ai_chat_used: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,bank,word" }
      );

      setStatuses((prev) => {
        const next = new Map(prev);
        next.set(word, {
          word,
          status: "seen",
          mcq_correct_streak: 0,
          spelling_correct_streak: 0,
          ai_chat_used: false,
        });
        return next;
      });
    },
    [user, bank, statuses]
  );

  // Record a quiz answer and update status
  const recordQuizAnswer = useCallback(
    async (word: string, questionType: "mcq" | "spelling", correct: boolean) => {
      if (!user) return;
      const current = statuses.get(word) || {
        word,
        status: "seen" as WordStatusLevel,
        mcq_correct_streak: 0,
        spelling_correct_streak: 0,
        ai_chat_used: false,
      };

      let mcq = current.mcq_correct_streak;
      let spelling = current.spelling_correct_streak;

      if (correct) {
        if (questionType === "mcq") mcq++;
        else spelling++;
      } else {
        // Wrong answer: reset streaks, demote if learnt
        if (questionType === "mcq") mcq = 0;
        else spelling = 0;
      }

      // Determine new status
      let newStatus: WordStatusLevel = current.status;

      if (!correct && (current.status === "learnt")) {
        // Demote back to seen
        newStatus = "seen";
        mcq = 0;
        spelling = 0;
      } else if (current.status === "seen" || current.status === "learnt") {
        // Check for learnt: 2 MCQ correct + 2 spelling correct
        if (mcq >= 2 && spelling >= 2 && current.status === "seen") {
          newStatus = "learnt";
        }
        // Check for mastered: 4 MCQ correct OR ai chat used
        if ((mcq >= 4 || current.ai_chat_used) && (current.status === "learnt" || newStatus === "learnt")) {
          newStatus = "mastered";
        }
      }

      const record = {
        user_id: user.id,
        bank,
        word,
        status: newStatus,
        mcq_correct_streak: mcq,
        spelling_correct_streak: spelling,
        ai_chat_used: current.ai_chat_used,
        updated_at: new Date().toISOString(),
      };

      await supabase.from("word_status").upsert(record, { onConflict: "user_id,bank,word" });

      setStatuses((prev) => {
        const next = new Map(prev);
        next.set(word, {
          word,
          status: newStatus,
          mcq_correct_streak: mcq,
          spelling_correct_streak: spelling,
          ai_chat_used: current.ai_chat_used,
        });
        return next;
      });
    },
    [user, bank, statuses]
  );

  // Mark AI chat used for a word
  const markAiChatUsed = useCallback(
    async (word: string) => {
      if (!user) return;
      const current = statuses.get(word);
      if (!current) return;

      const update: any = {
        ai_chat_used: true,
        updated_at: new Date().toISOString(),
      };

      // Check if this completes mastery
      if (current.status === "learnt" && current.mcq_correct_streak >= 4) {
        update.status = "mastered";
      }

      await supabase
        .from("word_status")
        .update(update)
        .eq("user_id", user.id)
        .eq("bank", bank)
        .eq("word", word);

      setStatuses((prev) => {
        const next = new Map(prev);
        const existing = next.get(word)!;
        next.set(word, {
          ...existing,
          ai_chat_used: true,
          status: update.status || existing.status,
        });
        return next;
      });
    },
    [user, bank, statuses]
  );

  // Get words by status
  const getWordsByStatus = useCallback(
    (status: WordStatusLevel): VocabWord[] => {
      return allWords.filter((w) => getStatus(w.word) === status);
    },
    [allWords, getStatus]
  );

  // Get quizzable words (seen + learnt + mastered, with gradual learnt/mastered inclusion)
  const getQuizWords = useCallback(
    (count: number): VocabWord[] => {
      const seenWords = getWordsByStatus("seen");
      const learntWords = getWordsByStatus("learnt");
      const masteredWords = getWordsByStatus("mastered");

      const allQuizzable = [...seenWords];

      // After 5 learnt words, start including them
      if (learntWords.length >= 5) {
        // Include a proportion: roughly learntWords.length / totalSeen ratio, min 1
        const learntCount = Math.max(1, Math.floor(count * (learntWords.length / (seenWords.length + learntWords.length + masteredWords.length))));
        const shuffledLearnt = [...learntWords].sort(() => Math.random() - 0.5);
        allQuizzable.push(...shuffledLearnt.slice(0, learntCount));
      }

      // After 5 mastered words, start including them sporadically
      if (masteredWords.length >= 5) {
        const masteredCount = Math.max(1, Math.floor(count * 0.1)); // 10% mastered
        const shuffledMastered = [...masteredWords].sort(() => Math.random() - 0.5);
        allQuizzable.push(...shuffledMastered.slice(0, masteredCount));
      }

      // Deduplicate
      const uniqueWords = Array.from(new Map(allQuizzable.map((w) => [w.word, w])).values());

      // Shuffle and take count
      return uniqueWords.sort(() => Math.random() - 0.5).slice(0, count);
    },
    [getWordsByStatus]
  );

  const counts = {
    unseen: getWordsByStatus("unseen").length,
    seen: getWordsByStatus("seen").length,
    learnt: getWordsByStatus("learnt").length,
    mastered: getWordsByStatus("mastered").length,
  };

  return {
    statuses,
    loading,
    getStatus,
    markSeen,
    recordQuizAnswer,
    markAiChatUsed,
    getWordsByStatus,
    getQuizWords,
    counts,
    refetch: fetchStatuses,
  };
}
