
-- User errors table (permanently stored)
CREATE TABLE public.user_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word TEXT NOT NULL,
  bank TEXT NOT NULL,
  user_sentence TEXT NOT NULL,
  correction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own errors" ON public.user_errors
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own errors" ON public.user_errors
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own errors" ON public.user_errors
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- User progress table (track word learning & quiz results per set)
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bank TEXT NOT NULL,
  set_number INTEGER NOT NULL DEFAULT 1,
  word TEXT NOT NULL,
  studied BOOLEAN NOT NULL DEFAULT false,
  quiz_correct BOOLEAN,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, bank, word)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress" ON public.user_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own progress" ON public.user_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Conversation scores table
CREATE TABLE public.conversation_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bank TEXT NOT NULL,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  rounds_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.conversation_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scores" ON public.conversation_scores
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON public.conversation_scores
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
