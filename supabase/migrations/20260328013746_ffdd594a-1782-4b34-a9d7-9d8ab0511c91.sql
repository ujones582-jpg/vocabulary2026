
-- Word status tracking table
CREATE TABLE public.word_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  bank text NOT NULL,
  word text NOT NULL,
  status text NOT NULL DEFAULT 'unseen' CHECK (status IN ('unseen', 'seen', 'learnt', 'mastered')),
  mcq_correct_streak integer NOT NULL DEFAULT 0,
  spelling_correct_streak integer NOT NULL DEFAULT 0,
  ai_chat_used boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, bank, word)
);

ALTER TABLE public.word_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own word status" ON public.word_status
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own word status" ON public.word_status
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own word status" ON public.word_status
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own word status" ON public.word_status
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
