import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { type, bank, role, word, userInput, conversationHistory, categories, conversationLog, roundCount, history } = await req.json();

    let systemPrompt = "";
    let messages: { role: string; content: string }[] = [];

    if (type === "chat_start") {
      // Generate an opening message to start a free-flowing conversation
      const bankPersona: Record<string, string> = {
        beginner: `You are a very kind, patient English learning helper talking to an absolute beginner who may know ZERO English words. 
You are like a kindergarten teacher. Use extremely simple words (1-3 word phrases), lots of emoji 😊, and be super encouraging.
Start with a very simple greeting and ask a very basic question (like "What is your name?" or "Do you like 🍎?").
Keep everything at the most basic level possible. Use emoji to help them understand meaning.`,

        everyday: `You are a friendly native English speaker having a casual chat. You're meeting someone new at a coffee shop or social event.
Be natural, relaxed, and conversational. Talk like a real person — use contractions, casual language, slang if appropriate.
Start with a natural greeting and a casual question to get the conversation going.
Don't be overly formal or teacher-like. Just be a friendly person having a real conversation.`,

        intermediate: `You are a supportive school tutor helping a student practice English for school subjects. You discuss topics like essays, science, history, and current events at a high school level.
Be encouraging but push for detail. Ask follow-up questions that require the student to explain, compare, or give examples.
Start with a topic relevant to school life or academics and invite discussion.
Use clear, standard English — not too casual, not too formal. Like a good teacher having a conversation.`,

        academic: `You are an intellectual conversation partner for academic English practice. You might be a fellow student, professor, or conference attendee.
Use sophisticated but natural language. Discuss interesting topics — current events, science, philosophy, literature, society.
Start with a thoughtful opening that invites discussion on a substantive topic.
Be articulate but not pretentious. Engage genuinely with ideas.`,
      };

      systemPrompt = bankPersona[bank] || bankPersona.academic;
      messages = [
        { role: "system", content: systemPrompt + "\n\nGenerate ONLY your opening message. Keep it natural and concise (2-4 sentences max)." },
        { role: "user", content: "Start the conversation." },
      ];

    } else if (type === "chat_reply") {
      // Continue a free-flowing conversation — no word targeting, just natural chat
       const bankBehavior: Record<string, string> = {
        beginner: `You are a very kind, patient English learning helper for an absolute beginner who may know very few English words.
Rules:
- Use extremely simple English (kindergarten level)
- Short sentences, 3-6 words max
- Use emoji liberally to aid understanding 😊🎉👍
- If they make mistakes, DON'T correct them — just naturally model correct usage in your reply
- Be super encouraging and warm
- Ask simple follow-up questions to keep the chat going
- If they write in another language, gently respond in simple English
- Never be a teacher — be a friendly helper who makes them feel safe to try`,

        everyday: `You are a native English speaker having a real casual conversation. 
Rules:
- Be completely natural — talk like a real human, not a language teacher
- Use contractions, casual expressions, even slang when natural
- React genuinely to what they say — laugh, agree, disagree, share your own stories
- Ask follow-up questions naturally, based on what they said
- Don't correct their English — just keep the conversation flowing
- Match their energy — if they're excited, be excited; if they're chill, be chill
- Stay on topic unless there's a natural reason to shift
- Keep responses conversational length (2-4 sentences usually)`,

        intermediate: `You are a school tutor having a practice conversation with a student.
Rules:
- Use clear, standard English appropriate for a high school student
- Engage with their ideas and ask them to explain or expand
- Don't correct grammar directly — model correct usage naturally in your replies
- Discuss school-relevant topics: essays, science, history, current events, ethics
- Push them to think critically — ask "why?" and "how?" follow-ups
- Be supportive but intellectually challenging
- Keep responses 2-4 sentences usually`,

        academic: `You are an intellectual conversation partner for academic discourse.
Rules:
- Use sophisticated, varied vocabulary naturally
- Engage deeply with ideas — add your perspective, challenge their points respectfully
- Ask thought-provoking follow-up questions
- Don't correct their English — engage with the IDEAS
- Use academic register naturally (not forced)
- Reference relevant concepts, theories, or examples when appropriate
- Keep responses substantive but not overly long (3-5 sentences usually)`,
      };

      systemPrompt = bankBehavior[bank] || bankBehavior.academic;
      
      // Build messages from conversation history
      messages = [
        { role: "system", content: systemPrompt },
        ...(history || []).map((h: { role: string; content: string }) => ({
          role: h.role === "assistant" ? "assistant" : "user",
          content: h.content,
        })),
      ];

    } else if (type === "generate_scene") {
      // Legacy support
      const beginnerNote = bank === "beginner"
        ? `\nIMPORTANT: The student is an absolute beginner. They may know ZERO English words. Use extremely simple language. Short sentences. 3-5 words max. Use emoji to help understanding.`
        : "";

      systemPrompt = `You are a vocabulary practice AI playing the role of a ${role}.
Create a short, natural conversation prompt (2-3 sentences max) that requires the student to use the target word "${word.word}" (${word.partOfSpeech}: ${word.definition}).
Rules:
- Stay in character as a ${role}
- Don't use the target word yourself
- Keep it brief${beginnerNote}
Respond with ONLY the conversation prompt.`;
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a conversation prompt for the word "${word.word}".` },
      ];

    } else if (type === "evaluate") {
      // Legacy support
      systemPrompt = `You are a vocabulary practice AI evaluating usage of "${word.word}" (${word.partOfSpeech}: ${word.definition}).
Respond in JSON: {"correct": true/false, "feedback": "..."}`;
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Context: "${conversationHistory}"\nStudent: "${userInput}"\nEvaluate.` },
      ];

    } else if (type === "score_conversation") {
      const categoryList = (categories || []).join(", ");

      const bankInstructions: Record<string, string> = {
        beginner: `This is a BEGINNER student learning English from scratch. Score based on:
- expression: Can they say what they mean, even with broken grammar?
- understanding: Do they understand the questions asked?
- confidence: Do they try to answer without hesitation?
- effort: Are they actively trying to communicate?
Be generous — any attempt to communicate in English is praiseworthy at this level.`,

        everyday: `This student is practicing everyday conversational English. Score based on:
- naturalness: Do they sound like a native speaker would in casual conversation?
- engagement: Are they interesting to talk to? Would a native want to continue?
- flow: Does the conversation feel smooth and natural?
- adaptability: Can they follow topic changes and respond appropriately?
Imagine you're a native friend rating how enjoyable this conversation was.`,

        academic: `This student is preparing for academic English exams. Score based on:
- grammar: Is sentence structure correct and varied?
- vocabulary: Are advanced words used appropriately and effectively?
- fluency: Does the writing flow? Is diction effective?
- coherence: Are ideas logically connected and well-structured?
Score strictly as an IELTS examiner would.`,
      };

      systemPrompt = `You are an English language assessor. Score this student's conversation performance.

${bankInstructions[bank] || bankInstructions.academic}

Score each category from 1-10. Respond in this exact JSON format:
{
  "scores": {
    ${(categories || []).map((c: string) => `"${c}": <number 1-10>`).join(",\n    ")}
  }
}

Respond with ONLY the JSON, nothing else.`;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the conversation log (${roundCount} rounds):\n\n${conversationLog}\n\nScore the student's performance across: ${categoryList}` },
      ];

    } else if (type === "define_word") {
      // Generate a Merriam-Webster style definition for a user-submitted word
      const targetWord = (await req.json().catch(() => ({})))?.word || word;
      systemPrompt = `You are a lexicographer writing entries in the style of the Merriam-Webster dictionary.
Given a word, provide:
1. A clear, concise definition (one sentence, lowercase, no period)
2. The part of speech (noun, verb, adjective, adverb, etc.)
3. An example sentence using the word naturally

Respond in this exact JSON format and nothing else:
{"definition": "...", "partOfSpeech": "...", "example": "..."}`;
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Define the word: "${word}"` },
      ];

    } else {
      throw new Error("Invalid request type");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let result;
    if (type === "chat_start" || type === "chat_reply") {
      result = { message: content };
    } else if (type === "evaluate") {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { correct: false, feedback: content };
      } catch {
        result = { correct: false, feedback: content };
      }
    } else if (type === "score_conversation") {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
        result = { scores: parsed.scores || parsed };
      } catch {
        result = { scores: {} };
      }
    } else if (type === "define_word") {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { definition: content, partOfSpeech: "unknown", example: "" };
      } catch {
        result = { definition: content, partOfSpeech: "unknown", example: "" };
      }
    } else {
      result = { scene: content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("vocab-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
