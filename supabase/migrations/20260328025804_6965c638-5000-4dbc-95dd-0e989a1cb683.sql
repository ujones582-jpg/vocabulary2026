CREATE TABLE public.custom_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bank text NOT NULL,
  word text NOT NULL,
  definition text NOT NULL,
  part_of_speech text NOT NULL,
  example text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, bank, word)
);

ALTER TABLE public.custom_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own custom words" ON public.custom_words
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);