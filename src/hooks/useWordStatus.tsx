import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { WordBank, VocabWord } from "@/lib/vocabulary";
import { getWordBank } from "@/lib/vocabulary";

export type WordStatusLevel = "unseen" | "seen" | "developing" | "learnt" | "mastered";

export interface WordStatusRecord {
  word: string;
  status: WordStatusLevel;
  mcq_correct_streak: number;
  spelling_correct_streak: number;
  ai_chat_used: boolean;
}

export function useWordStatus(bank: WordBank, extraWords?: VocabWord[]) {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<Map<string, WordStatusRecord>>(new Map());
  const [loading, setLoading] = useState(true);

  const allWords = [...getWordBank(bank), ...(extraWords || [])];

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

  const markSeen = useCallback(
    async (word: string) => {
      if (!user) return;
      const current = statuses.get(word);
      if (current && current.status !== "unseen") return;

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
        next.set(word, { word, status: "seen", mcq_correct_streak: 0, spelling_correct_streak: 0, ai_chat_used: false });
        return next;
      });
    },
    [user, bank, statuses]
  );

  const manualPromote = useCallback(
    async (word: string, targetStatus: WordStatusLevel) => {
      if (!user) return;
      const current = statuses.get(word);
      const record = {
        user_id: user.id,
        bank,
        word,
        status: targetStatus,
        mcq_correct_streak: current?.mcq_correct_streak || 0,
        spelling_correct_streak: current?.spelling_correct_streak || 0,
        ai_chat_used: current?.ai_chat_used || false,
        updated_at: new Date().toISOString(),
      };

      await supabase.from("word_status").upsert(record, { onConflict: "user_id,bank,word" });

      setStatuses((prev) => {
        const next = new Map(prev);
        next.set(word, {
          word,
          status: targetStatus,
          mcq_correct_streak: record.mcq_correct_streak,
          spelling_correct_streak: record.spelling_correct_streak,
          ai_chat_used: record.ai_chat_used,
        });
        return next;
      });
    },
    [user, bank, statuses]
  );

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
        if (questionType === "mcq") mcq = Math.max(0, mcq - 1);
        else spelling = Math.max(0, spelling - 1);
      }

      let newStatus: WordStatusLevel = current.status;

      if (!correct) {
        if (current.status === "mastered") newStatus = "learnt";
        else if (current.status === "learnt") newStatus = "developing";
      } else {
        if (current.status === "seen") newStatus = "developing";
        if ((current.status === "developing" || newStatus === "developing") && mcq >= 2 && spelling >= 2) newStatus = "learnt";
        if ((current.status === "learnt" || newStatus === "learnt") && (mcq >= 3 || current.ai_chat_used)) newStatus = "mastered";
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
        next.set(word, { word, status: newStatus, mcq_correct_streak: mcq, spelling_correct_streak: spelling, ai_chat_used: current.ai_chat_used });
        return next;
      });
    },
    [user, bank, statuses]
  );

  const markAiChatUsed = useCallback(
    async (word: string) => {
      if (!user) return;
      const current = statuses.get(word);
      if (!current) return;

      const update: any = { ai_chat_used: true, updated_at: new Date().toISOString() };
      if (current.status === "learnt") update.status = "mastered";

      await supabase
        .from("word_status")
        .update(update)
        .eq("user_id", user.id)
        .eq("bank", bank)
        .eq("word", word);

      setStatuses((prev) => {
        const next = new Map(prev);
        const existing = next.get(word)!;
        next.set(word, { ...existing, ai_chat_used: true, status: update.status || existing.status });
        return next;
      });
    },
    [user, bank, statuses]
  );

  const getWordsByStatus = useCallback(
    (status: WordStatusLevel): VocabWord[] => {
      return allWords.filter((w) => getStatus(w.word) === status);
    },
    [allWords, getStatus]
  );

  const getQuizWords = useCallback(
    (count: number): VocabWord[] => {
      const seenWords = getWordsByStatus("seen");
      const developingWords = getWordsByStatus("developing");
      const learntWords = getWordsByStatus("learnt");
      const masteredWords = getWordsByStatus("mastered");

      const allQuizzable = [...seenWords, ...developingWords];

      if (learntWords.length >= 5) {
        const total = seenWords.length + developingWords.length + learntWords.length + masteredWords.length;
        const learntCount = Math.max(1, Math.floor(count * (learntWords.length / total)));
        const shuffledLearnt = [...learntWords].sort(() => Math.random() - 0.5);
        allQuizzable.push(...shuffledLearnt.slice(0, learntCount));
      }

      if (masteredWords.length >= 5) {
        const masteredCount = Math.max(1, Math.floor(count * 0.1));
        const shuffledMastered = [...masteredWords].sort(() => Math.random() - 0.5);
        allQuizzable.push(...shuffledMastered.slice(0, masteredCount));
      }

      const uniqueWords = Array.from(new Map(allQuizzable.map((w) => [w.word, w])).values());
      return uniqueWords.sort(() => Math.random() - 0.5).slice(0, count);
    },
    [getWordsByStatus]
  );

  const counts = {
    unseen: getWordsByStatus("unseen").length,
    seen: getWordsByStatus("seen").length,
    developing: getWordsByStatus("developing").length,
    learnt: getWordsByStatus("learnt").length,
    mastered: getWordsByStatus("mastered").length,
  };

  return {
    statuses,
    loading,
    getStatus,
    markSeen,
    manualPromote,
    recordQuizAnswer,
    markAiChatUsed,
    getWordsByStatus,
    getQuizWords,
    counts,
    refetch: fetchStatuses,
  };
}
