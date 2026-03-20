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
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { type, bank, role, word, userInput, conversationHistory } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "generate_scene") {
      systemPrompt = `You are a vocabulary practice AI. You play the role of a ${role} helping a student practice English vocabulary.
Your job is to create a short, natural conversation prompt (2-3 sentences max) that requires the student to use the target word "${word.word}" (${word.partOfSpeech}: ${word.definition}) in their response.

Rules:
- Stay in character as a ${role}
- Make the scenario feel natural and engaging
- Don't use the target word yourself — let the student use it
- Keep it brief and conversational
- Word bank type: ${bank}
- If bank is "academic", use formal/exam-like scenarios
- If bank is "beginner", use simple everyday scenarios
- If bank is "everyday", use casual/travel/social scenarios

Respond with ONLY the conversation prompt, nothing else.`;
      userPrompt = `Generate a conversation prompt for the word "${word.word}".`;
    } else if (type === "evaluate") {
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
Keep feedback concise (1-2 sentences).`;
      userPrompt = `The conversation context was: "${conversationHistory}"

The student's response: "${userInput}"

Evaluate the usage of "${word.word}".`;
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
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        // Try to parse JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : { correct: false, feedback: content };
      } catch {
        result = { correct: false, feedback: content };
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