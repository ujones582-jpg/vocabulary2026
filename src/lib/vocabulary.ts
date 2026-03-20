export type WordBank = "academic" | "beginner" | "everyday";
export type RoleType = "examiner" | "teacher" | "local";

export interface VocabWord {
  word: string;
  definition: string;
  partOfSpeech: string;
}

export interface ErrorEntry {
  id: string;
  word: string;
  userSentence: string;
  correction: string;
  timestamp: number;
}

const academicWords: VocabWord[] = [
  { word: "ubiquitous", definition: "present, appearing, or found everywhere", partOfSpeech: "adjective" },
  { word: "paradigm", definition: "a typical example or pattern of something", partOfSpeech: "noun" },
  { word: "juxtapose", definition: "to place close together for contrasting effect", partOfSpeech: "verb" },
  { word: "ambiguous", definition: "open to more than one interpretation", partOfSpeech: "adjective" },
  { word: "pragmatic", definition: "dealing with things sensibly and realistically", partOfSpeech: "adjective" },
  { word: "ephemeral", definition: "lasting for a very short time", partOfSpeech: "adjective" },
  { word: "substantiate", definition: "provide evidence to support or prove the truth of", partOfSpeech: "verb" },
  { word: "conundrum", definition: "a confusing and difficult problem or question", partOfSpeech: "noun" },
];

const beginnerWords: VocabWord[] = [
  { word: "abandon", definition: "to leave completely and finally", partOfSpeech: "verb" },
  { word: "benefit", definition: "an advantage or profit gained from something", partOfSpeech: "noun" },
  { word: "curious", definition: "eager to know or learn something", partOfSpeech: "adjective" },
  { word: "desire", definition: "a strong feeling of wanting to have something", partOfSpeech: "noun" },
  { word: "essential", definition: "absolutely necessary; extremely important", partOfSpeech: "adjective" },
  { word: "frequent", definition: "occurring or done many times at short intervals", partOfSpeech: "adjective" },
  { word: "generous", definition: "showing a readiness to give more than expected", partOfSpeech: "adjective" },
  { word: "hesitate", definition: "to pause before saying or doing something", partOfSpeech: "verb" },
];

const everydayWords: VocabWord[] = [
  { word: "vibe", definition: "a feeling or atmosphere of a place or situation", partOfSpeech: "noun" },
  { word: "hustle", definition: "to push roughly; to move hurriedly", partOfSpeech: "verb" },
  { word: "chill", definition: "to relax; calm and easy-going", partOfSpeech: "verb/adjective" },
  { word: "quirky", definition: "having peculiar or unexpected traits", partOfSpeech: "adjective" },
  { word: "savvy", definition: "shrewd and knowledgeable", partOfSpeech: "adjective" },
  { word: "glitch", definition: "a sudden, usually temporary malfunction", partOfSpeech: "noun" },
  { word: "kudos", definition: "praise and honor received for an achievement", partOfSpeech: "noun" },
  { word: "binge", definition: "to indulge in an activity excessively", partOfSpeech: "verb" },
];

export function getWordBank(type: WordBank): VocabWord[] {
  switch (type) {
    case "academic": return academicWords;
    case "beginner": return beginnerWords;
    case "everyday": return everydayWords;
  }
}

export function getRandomWord(type: WordBank, exclude?: string): VocabWord {
  const words = getWordBank(type);
  const filtered = exclude ? words.filter(w => w.word !== exclude) : words;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

const rolePrompts: Record<WordBank, { role: RoleType; label: string }> = {
  academic: { role: "examiner", label: "IELTS Examiner" },
  beginner: { role: "teacher", label: "English Teacher" },
  everyday: { role: "local", label: "Local Friend" },
};

export function getRoleForBank(bank: WordBank) {
  return rolePrompts[bank];
}

const sceneTemplates: Record<RoleType, string[]> = {
  examiner: [
    "In the speaking test, describe a situation where this concept is relevant in modern society.",
    "Can you discuss a real-world example that relates to this idea?",
    "Tell me about a time when you encountered this concept in your studies.",
    "How would you explain this to someone unfamiliar with the topic?",
  ],
  teacher: [
    "Let's practice! Can you use this word to describe your weekend?",
    "Great word to learn! Try making a sentence about your favorite hobby.",
    "Imagine you're writing to a pen pal. Use this word in your message.",
    "Can you tell me a short story using this word?",
  ],
  local: [
    "Hey! So we were talking about the neighborhood — can you describe it using this word?",
    "You know what I mean? Try using this word to talk about your last trip.",
    "That reminds me — can you describe a funny situation with this word?",
    "So tell me about your day, but make sure to throw this word in!",
  ],
};

export function getRandomScene(role: RoleType): string {
  const scenes = sceneTemplates[role];
  return scenes[Math.floor(Math.random() * scenes.length)];
}

// Mock AI feedback — will be replaced with real AI
export function getMockFeedback(word: string, userInput: string): { correct: boolean; feedback: string } {
  const lower = userInput.toLowerCase();
  if (lower.includes(word.toLowerCase())) {
    return {
      correct: true,
      feedback: `Great usage! You naturally integrated "${word}" into a meaningful context.`,
    };
  }
  return {
    correct: false,
    feedback: `Try instead: "The ${word} nature of social media trends makes them hard to study long-term."`,
  };
}