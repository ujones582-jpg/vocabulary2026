import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { WordBank } from "@/lib/vocabulary";

export function useUserPreference() {
  const { user } = useAuth();
  const [bank, setBank] = useState<WordBank | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("user_preferences")
      .select("selected_bank")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setBank(data.selected_bank as WordBank);
        setLoading(false);
      });
  }, [user]);

  const saveBank = useCallback(async (newBank: WordBank) => {
    if (!user) return;
    const { error } = await supabase
      .from("user_preferences")
      .upsert({ user_id: user.id, selected_bank: newBank, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (!error) setBank(newBank);
    return error;
  }, [user]);

  const clearProgress = useCallback(async () => {
    if (!user) return;
    // Delete all progress for the user
    await supabase.from("user_progress").delete().eq("user_id", user.id);
    await supabase.from("user_errors").delete().eq("user_id", user.id);
    await supabase.from("conversation_scores").delete().eq("user_id", user.id);
  }, [user]);

  return { bank, loading, saveBank, clearProgress, hasPreference: bank !== null };
}
