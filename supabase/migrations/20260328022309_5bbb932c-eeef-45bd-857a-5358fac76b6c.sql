
CREATE TABLE public.conversation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  bank text NOT NULL,
  role_label text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  rounds_completed integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own history"
  ON public.conversation_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own history"
  ON public.conversation_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON public.conversation_history FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
