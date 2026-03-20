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

    const { type, bank, role, word, userInput, conversationHistory, categories, conversationLog, roundCount } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "generate_scene") {
      const beginnerNote = bank === "beginner"
        ? `\nIMPORTANT: The student is an absolute beginner. They may know ZERO English words. Use extremely simple language. Short sentences. 3-5 words max. Use emoji to help understanding. Be patient and encouraging like talking to a kindergartener.`
        : "";

      systemPrompt = `You are a vocabulary practice AI. You play the role of a ${role} helping a student practice English vocabulary.
Your job is to create a short, natural conversation prompt (2-3 sentences max) that requires the student to use the target word "${word.word}" (${word.partOfSpeech}: ${word.definition}) in their response.

Rules:
- Stay in character as a ${role}
- Make the scenario feel natural and engaging
- Don't use the target word yourself — let the student use it
- Keep it brief and conversational
- Word bank type: ${bank}
- If bank is "academic", use formal/exam-like scenarios
- If bank is "beginner", use extremely simple everyday scenarios with very basic English
- If bank is "everyday", use casual/travel/social scenarios${beginnerNote}

Respond with ONLY the conversation prompt, nothing else.`;
      userPrompt = `Generate a conversation prompt for the word "${word.word}".`;

    } else if (type === "evaluate") {
      const beginnerNote = bank === "beginner"
        ? `\nIMPORTANT: Be very encouraging. The student is an absolute beginner. If they used the word at all, even with grammar mistakes, praise them. Focus on whether they understood the meaning, not grammar perfection. Use simple words in your feedback.`
        : "";

      systemPrompt = `You are a vocabulary practice AI evaluating a student's use of the word "${word.word}" (${word.partOfSpeech}: ${word.definition}).

Evaluate whether the student used the word correctly in context. Consider:
1. Is the word used with correct meaning?
2. Is the grammar correct?
3. Does it fit naturally in the sentence?

Respond in this exact JSON format:
{
  "correct": true/false,
  "feedback": "Your feedback here"
}

If correct: praise briefly and explain why the usage works.
If incorrect: explain the issue and provide a corrected example sentence using the word properly.
Keep feedback concise (1-2 sentences).${beginnerNote}`;
      userPrompt = `The conversation context was: "${conversationHistory}"

The student's response: "${userInput}"

Evaluate the usage of "${word.word}".`;

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

      userPrompt = `Here is the conversation log (${roundCount} rounds):\n\n${conversationLog}\n\nScore the student's performance across: ${categoryList}`;

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
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
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
    if (type === "evaluate") {
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
