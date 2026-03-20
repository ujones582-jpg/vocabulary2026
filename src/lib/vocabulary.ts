export type WordBank = "academic" | "beginner" | "everyday";
export type RoleType = "examiner" | "teacher" | "local";

export interface VocabWord {
  word: string;
  definition: string;
  partOfSpeech: string;
  example?: string;
}

export interface ErrorEntry {
  id: string;
  word: string;
  userSentence: string;
  correction: string;
  bank: string;
  timestamp: number;
}

// ─── ACADEMIC WORDS (100) ─────────────────────────────────
const academicWords: VocabWord[] = [
  { word: "ubiquitous", definition: "present, appearing, or found everywhere", partOfSpeech: "adjective" },
  { word: "paradigm", definition: "a typical example or pattern of something", partOfSpeech: "noun" },
  { word: "juxtapose", definition: "to place close together for contrasting effect", partOfSpeech: "verb" },
  { word: "ambiguous", definition: "open to more than one interpretation", partOfSpeech: "adjective" },
  { word: "pragmatic", definition: "dealing with things sensibly and realistically", partOfSpeech: "adjective" },
  { word: "ephemeral", definition: "lasting for a very short time", partOfSpeech: "adjective" },
  { word: "substantiate", definition: "provide evidence to support or prove the truth of", partOfSpeech: "verb" },
  { word: "conundrum", definition: "a confusing and difficult problem or question", partOfSpeech: "noun" },
  { word: "dichotomy", definition: "a division into two contrasting groups or categories", partOfSpeech: "noun" },
  { word: "ameliorate", definition: "to make something bad better or more tolerable", partOfSpeech: "verb" },
  { word: "rhetoric", definition: "the art of effective persuasive speaking or writing", partOfSpeech: "noun" },
  { word: "empirical", definition: "based on observation or experience rather than theory", partOfSpeech: "adjective" },
  { word: "nuance", definition: "a subtle difference in meaning, expression, or sound", partOfSpeech: "noun" },
  { word: "exacerbate", definition: "to make a problem or situation worse", partOfSpeech: "verb" },
  { word: "cogent", definition: "clear, logical, and convincing", partOfSpeech: "adjective" },
  { word: "elucidate", definition: "to make something clear; to explain", partOfSpeech: "verb" },
  { word: "proliferate", definition: "to increase rapidly in number; multiply", partOfSpeech: "verb" },
  { word: "superfluous", definition: "unnecessary, especially through being more than enough", partOfSpeech: "adjective" },
  { word: "disparity", definition: "a great difference between things", partOfSpeech: "noun" },
  { word: "conjecture", definition: "an opinion or conclusion formed without full evidence", partOfSpeech: "noun" },
  { word: "corroborate", definition: "to confirm or give support to a statement or theory", partOfSpeech: "verb" },
  { word: "recalcitrant", definition: "having an obstinately uncooperative attitude", partOfSpeech: "adjective" },
  { word: "anachronism", definition: "something belonging to a different time period", partOfSpeech: "noun" },
  { word: "extraneous", definition: "irrelevant or unrelated to the subject being dealt with", partOfSpeech: "adjective" },
  { word: "didactic", definition: "intended to teach, particularly in having moral instruction", partOfSpeech: "adjective" },
  { word: "acquiesce", definition: "to accept something reluctantly but without protest", partOfSpeech: "verb" },
  { word: "precipitate", definition: "to cause something to happen suddenly or sooner than expected", partOfSpeech: "verb" },
  { word: "insidious", definition: "proceeding in a gradual, subtle way but with harmful effects", partOfSpeech: "adjective" },
  { word: "circumscribe", definition: "to restrict or limit something", partOfSpeech: "verb" },
  { word: "antithesis", definition: "the exact opposite of something", partOfSpeech: "noun" },
  { word: "predilection", definition: "a preference or special liking for something", partOfSpeech: "noun" },
  { word: "extrapolate", definition: "to extend known data to estimate unknown values", partOfSpeech: "verb" },
  { word: "vacillate", definition: "to alternate between different opinions or actions; be indecisive", partOfSpeech: "verb" },
  { word: "tantamount", definition: "equivalent in seriousness; virtually the same as", partOfSpeech: "adjective" },
  { word: "pernicious", definition: "having a harmful effect, especially gradually or subtly", partOfSpeech: "adjective" },
  { word: "lucid", definition: "expressed clearly; easy to understand", partOfSpeech: "adjective" },
  { word: "propagate", definition: "to spread and promote an idea widely", partOfSpeech: "verb" },
  { word: "equivocal", definition: "open to more than one interpretation; ambiguous", partOfSpeech: "adjective" },
  { word: "delineate", definition: "to describe or portray something precisely", partOfSpeech: "verb" },
  { word: "perfunctory", definition: "carried out with minimum effort or thought", partOfSpeech: "adjective" },
  { word: "ostensible", definition: "stated or appearing to be true, but not necessarily so", partOfSpeech: "adjective" },
  { word: "coalesce", definition: "to come together and form one mass or whole", partOfSpeech: "verb" },
  { word: "sanguine", definition: "optimistic or positive, especially in a difficult situation", partOfSpeech: "adjective" },
  { word: "pejorative", definition: "expressing contempt or disapproval", partOfSpeech: "adjective" },
  { word: "verbose", definition: "using more words than needed; wordy", partOfSpeech: "adjective" },
  { word: "mitigate", definition: "to make less severe, serious, or painful", partOfSpeech: "verb" },
  { word: "arduous", definition: "involving or requiring strenuous effort; difficult", partOfSpeech: "adjective" },
  { word: "esoteric", definition: "intended for or understood by only a few with special knowledge", partOfSpeech: "adjective" },
  { word: "nebulous", definition: "unclear, vague, or ill-defined", partOfSpeech: "adjective" },
  { word: "repudiate", definition: "to refuse to accept or be associated with", partOfSpeech: "verb" },
  { word: "austere", definition: "severe or strict in manner or attitude", partOfSpeech: "adjective" },
  { word: "magnanimous", definition: "very generous or forgiving, especially toward a rival", partOfSpeech: "adjective" },
  { word: "meticulous", definition: "showing great attention to detail; very careful", partOfSpeech: "adjective" },
  { word: "catalyst", definition: "a person or thing that causes an important change", partOfSpeech: "noun" },
  { word: "ascertain", definition: "to find out for certain; make sure of", partOfSpeech: "verb" },
  { word: "convoluted", definition: "extremely complex and difficult to follow", partOfSpeech: "adjective" },
  { word: "acumen", definition: "the ability to make good judgments and quick decisions", partOfSpeech: "noun" },
  { word: "disparate", definition: "essentially different in kind; not allowing comparison", partOfSpeech: "adjective" },
  { word: "preclude", definition: "to prevent from happening; make impossible", partOfSpeech: "verb" },
  { word: "tenuous", definition: "very weak or slight; insubstantial", partOfSpeech: "adjective" },
  { word: "truncate", definition: "to shorten by cutting off the top or the end", partOfSpeech: "verb" },
  { word: "aberration", definition: "a departure from what is normal or expected", partOfSpeech: "noun" },
  { word: "congenial", definition: "pleasant because of a personality or qualities similar to one's own", partOfSpeech: "adjective" },
  { word: "debilitate", definition: "to make someone weak and infirm", partOfSpeech: "verb" },
  { word: "egalitarian", definition: "relating to the principle that all people are equal", partOfSpeech: "adjective" },
  { word: "fallacious", definition: "based on a mistaken belief; misleading", partOfSpeech: "adjective" },
  { word: "galvanize", definition: "to shock or excite someone into taking action", partOfSpeech: "verb" },
  { word: "harbinger", definition: "a person or thing that announces the approach of another", partOfSpeech: "noun" },
  { word: "impervious", definition: "not allowing something to pass through; unable to be affected", partOfSpeech: "adjective" },
  { word: "judicious", definition: "having or showing good judgment; wise", partOfSpeech: "adjective" },
  { word: "laudable", definition: "deserving praise and commendation", partOfSpeech: "adjective" },
  { word: "malleable", definition: "easily influenced or shaped; pliable", partOfSpeech: "adjective" },
  { word: "nefarious", definition: "wicked, villainous, or criminal", partOfSpeech: "adjective" },
  { word: "obfuscate", definition: "to make obscure, unclear, or unintelligible", partOfSpeech: "verb" },
  { word: "placate", definition: "to make someone less angry or hostile", partOfSpeech: "verb" },
  { word: "querulous", definition: "complaining in a petulant or whining manner", partOfSpeech: "adjective" },
  { word: "spurious", definition: "not being what it purports to be; false or fake", partOfSpeech: "adjective" },
  { word: "trepidation", definition: "a feeling of fear or anxiety about something", partOfSpeech: "noun" },
  { word: "utilitarian", definition: "designed to be useful rather than attractive", partOfSpeech: "adjective" },
  { word: "vindicate", definition: "to clear someone of blame or suspicion", partOfSpeech: "verb" },
  { word: "zealous", definition: "having great energy or enthusiasm for a cause or objective", partOfSpeech: "adjective" },
  { word: "alleviate", definition: "to make suffering or a problem less severe", partOfSpeech: "verb" },
  { word: "belligerent", definition: "hostile and aggressive; ready to fight", partOfSpeech: "adjective" },
  { word: "capacious", definition: "having a lot of space inside; roomy", partOfSpeech: "adjective" },
  { word: "dearth", definition: "a scarcity or lack of something", partOfSpeech: "noun" },
  { word: "eclectic", definition: "deriving ideas or style from a broad range of sources", partOfSpeech: "adjective" },
  { word: "frivolous", definition: "not having any serious purpose or value", partOfSpeech: "adjective" },
  { word: "gratuitous", definition: "uncalled for; lacking good reason; unnecessary", partOfSpeech: "adjective" },
  { word: "hackneyed", definition: "lacking significance through having been overused", partOfSpeech: "adjective" },
  { word: "idiosyncratic", definition: "peculiar or individual; relating to a distinctive characteristic", partOfSpeech: "adjective" },
  { word: "juxtaposition", definition: "the fact of placing two things side by side for contrast", partOfSpeech: "noun" },
  { word: "kinetic", definition: "relating to or resulting from motion", partOfSpeech: "adjective" },
  { word: "lethargic", definition: "affected by a lack of energy or enthusiasm", partOfSpeech: "adjective" },
  { word: "mundane", definition: "lacking interest or excitement; dull", partOfSpeech: "adjective" },
  { word: "nonchalant", definition: "feeling or appearing calm and relaxed; not displaying anxiety", partOfSpeech: "adjective" },
  { word: "ostentatious", definition: "designed to impress or attract notice; showy", partOfSpeech: "adjective" },
  { word: "prodigious", definition: "remarkably great in extent, size, or degree", partOfSpeech: "adjective" },
  { word: "quintessential", definition: "representing the most perfect example of something", partOfSpeech: "adjective" },
  { word: "resilient", definition: "able to recover quickly from difficult conditions", partOfSpeech: "adjective" },
  { word: "surreptitious", definition: "kept secret, especially because it would not be approved of", partOfSpeech: "adjective" },
  { word: "transient", definition: "lasting only for a short time; temporary", partOfSpeech: "adjective" },
];

// ─── BEGINNER WORDS (100) — Kindergarten level ─────────────
const beginnerWords: VocabWord[] = [
  // Set 1: Me & My Body
  { word: "hello", definition: "a word you say when you meet someone", partOfSpeech: "greeting", example: "Hello! My name is Tom." },
  { word: "name", definition: "what people call you", partOfSpeech: "noun", example: "My name is Lisa." },
  { word: "happy", definition: "feeling good, like when you smile 😊", partOfSpeech: "adjective", example: "I am happy today." },
  { word: "sad", definition: "feeling bad, like when you want to cry 😢", partOfSpeech: "adjective", example: "The dog is sad." },
  { word: "big", definition: "not small; large in size", partOfSpeech: "adjective", example: "The elephant is big." },
  { word: "small", definition: "not big; little in size", partOfSpeech: "adjective", example: "The ant is small." },
  { word: "hand", definition: "the part of your body at the end of your arm ✋", partOfSpeech: "noun", example: "I wave my hand." },
  { word: "eye", definition: "you use these to see things 👁️", partOfSpeech: "noun", example: "I have two eyes." },
  { word: "eat", definition: "to put food in your mouth and swallow it", partOfSpeech: "verb", example: "I eat an apple." },
  { word: "drink", definition: "to swallow water or juice", partOfSpeech: "verb", example: "I drink water." },
  // Set 2: Family & Friends
  { word: "mother", definition: "your mom; the woman who takes care of you", partOfSpeech: "noun", example: "My mother loves me." },
  { word: "father", definition: "your dad; the man who takes care of you", partOfSpeech: "noun", example: "My father is tall." },
  { word: "friend", definition: "someone you like and play with", partOfSpeech: "noun", example: "She is my friend." },
  { word: "baby", definition: "a very young child", partOfSpeech: "noun", example: "The baby is sleeping." },
  { word: "love", definition: "to care about someone very much ❤️", partOfSpeech: "verb", example: "I love my family." },
  { word: "help", definition: "to make things easier for someone", partOfSpeech: "verb", example: "Can you help me?" },
  { word: "play", definition: "to have fun; to do games", partOfSpeech: "verb", example: "Let's play together!" },
  { word: "give", definition: "to hand something to someone", partOfSpeech: "verb", example: "I give you a book." },
  { word: "thank", definition: "to tell someone you are grateful", partOfSpeech: "verb", example: "Thank you very much!" },
  { word: "please", definition: "a polite word when you ask for something", partOfSpeech: "adverb", example: "Please help me." },
  // Set 3: Food & Drink
  { word: "water", definition: "the clear liquid you drink every day 💧", partOfSpeech: "noun", example: "I want some water." },
  { word: "food", definition: "things you eat, like rice, bread, or fruit", partOfSpeech: "noun", example: "The food is yummy." },
  { word: "apple", definition: "a round red or green fruit 🍎", partOfSpeech: "noun", example: "I eat an apple." },
  { word: "bread", definition: "a soft food made from flour 🍞", partOfSpeech: "noun", example: "I like bread." },
  { word: "milk", definition: "a white drink from cows 🥛", partOfSpeech: "noun", example: "I drink milk." },
  { word: "egg", definition: "a food that comes from a chicken 🥚", partOfSpeech: "noun", example: "I eat one egg." },
  { word: "rice", definition: "small white grains you cook and eat 🍚", partOfSpeech: "noun", example: "I like rice." },
  { word: "hot", definition: "very warm; high temperature 🔥", partOfSpeech: "adjective", example: "The soup is hot." },
  { word: "cold", definition: "not warm; low temperature 🥶", partOfSpeech: "adjective", example: "The ice cream is cold." },
  { word: "yummy", definition: "tasting very good; delicious", partOfSpeech: "adjective", example: "This cake is yummy!" },
  // Set 4: Colors & Numbers
  { word: "red", definition: "the color of a fire truck or strawberry 🔴", partOfSpeech: "adjective", example: "The car is red." },
  { word: "blue", definition: "the color of the sky on a sunny day 🔵", partOfSpeech: "adjective", example: "The sky is blue." },
  { word: "green", definition: "the color of grass and leaves 🟢", partOfSpeech: "adjective", example: "The frog is green." },
  { word: "yellow", definition: "the color of the sun and bananas 🟡", partOfSpeech: "adjective", example: "The banana is yellow." },
  { word: "one", definition: "the number 1", partOfSpeech: "number", example: "I have one cat." },
  { word: "two", definition: "the number 2", partOfSpeech: "number", example: "I have two hands." },
  { word: "three", definition: "the number 3", partOfSpeech: "number", example: "Three little birds." },
  { word: "many", definition: "a large number of things", partOfSpeech: "adjective", example: "There are many stars." },
  { word: "new", definition: "not old; just made or bought", partOfSpeech: "adjective", example: "I have a new toy." },
  { word: "old", definition: "not new; has been around for a long time", partOfSpeech: "adjective", example: "This is an old book." },
  // Set 5: Home & Things
  { word: "house", definition: "a building where people live 🏠", partOfSpeech: "noun", example: "I live in a house." },
  { word: "door", definition: "you open this to go in or out 🚪", partOfSpeech: "noun", example: "Open the door." },
  { word: "bed", definition: "you sleep on this at night 🛏️", partOfSpeech: "noun", example: "I go to bed." },
  { word: "chair", definition: "you sit on this 🪑", partOfSpeech: "noun", example: "Sit on the chair." },
  { word: "book", definition: "pages with words and pictures you read 📖", partOfSpeech: "noun", example: "I read a book." },
  { word: "toy", definition: "something you play with 🧸", partOfSpeech: "noun", example: "This is my toy." },
  { word: "clean", definition: "not dirty; neat and tidy", partOfSpeech: "adjective", example: "My room is clean." },
  { word: "open", definition: "to make something not closed", partOfSpeech: "verb", example: "Open the box." },
  { word: "close", definition: "to make something not open; to shut", partOfSpeech: "verb", example: "Close the window." },
  { word: "put", definition: "to place something somewhere", partOfSpeech: "verb", example: "Put it on the table." },
  // Set 6: Animals
  { word: "dog", definition: "a pet animal that barks 🐕", partOfSpeech: "noun", example: "The dog is running." },
  { word: "cat", definition: "a small pet animal that says meow 🐱", partOfSpeech: "noun", example: "The cat is soft." },
  { word: "bird", definition: "an animal with wings that can fly 🐦", partOfSpeech: "noun", example: "The bird sings." },
  { word: "fish", definition: "an animal that lives in water 🐟", partOfSpeech: "noun", example: "The fish swims." },
  { word: "run", definition: "to move your legs fast", partOfSpeech: "verb", example: "I run to school." },
  { word: "walk", definition: "to move on foot, step by step", partOfSpeech: "verb", example: "I walk slowly." },
  { word: "jump", definition: "to push your body up into the air", partOfSpeech: "verb", example: "The frog can jump." },
  { word: "fast", definition: "moving quickly; not slow", partOfSpeech: "adjective", example: "The car is fast." },
  { word: "slow", definition: "not fast; taking a long time", partOfSpeech: "adjective", example: "The turtle is slow." },
  { word: "cute", definition: "attractive in a sweet way; adorable", partOfSpeech: "adjective", example: "The puppy is cute." },
  // Set 7: Weather & Nature
  { word: "sun", definition: "the big bright thing in the sky ☀️", partOfSpeech: "noun", example: "The sun is warm." },
  { word: "rain", definition: "water that falls from clouds 🌧️", partOfSpeech: "noun", example: "I see the rain." },
  { word: "tree", definition: "a big tall plant with leaves 🌳", partOfSpeech: "noun", example: "The tree is tall." },
  { word: "flower", definition: "the colorful part of a plant 🌸", partOfSpeech: "noun", example: "The flower is pink." },
  { word: "sky", definition: "the space above you when you look up", partOfSpeech: "noun", example: "The sky is blue." },
  { word: "star", definition: "a tiny light in the sky at night ⭐", partOfSpeech: "noun", example: "I see a star." },
  { word: "warm", definition: "a little bit hot; comfortable temperature", partOfSpeech: "adjective", example: "It is warm today." },
  { word: "wet", definition: "covered with water; not dry", partOfSpeech: "adjective", example: "My shoes are wet." },
  { word: "dry", definition: "not wet; no water on it", partOfSpeech: "adjective", example: "The towel is dry." },
  { word: "wind", definition: "moving air that you can feel 💨", partOfSpeech: "noun", example: "The wind is strong." },
  // Set 8: Actions
  { word: "go", definition: "to move from here to another place", partOfSpeech: "verb", example: "I go to school." },
  { word: "come", definition: "to move toward this place", partOfSpeech: "verb", example: "Come here, please." },
  { word: "look", definition: "to use your eyes to see something", partOfSpeech: "verb", example: "Look at the bird!" },
  { word: "see", definition: "to notice with your eyes", partOfSpeech: "verb", example: "I see a rainbow." },
  { word: "say", definition: "to speak words", partOfSpeech: "verb", example: "What did you say?" },
  { word: "want", definition: "to wish for something; to desire", partOfSpeech: "verb", example: "I want a cookie." },
  { word: "like", definition: "to enjoy something; to think it is good", partOfSpeech: "verb", example: "I like ice cream." },
  { word: "know", definition: "to have information in your mind", partOfSpeech: "verb", example: "I know the answer." },
  { word: "make", definition: "to create or build something", partOfSpeech: "verb", example: "I make a picture." },
  { word: "stop", definition: "to not move or continue anymore", partOfSpeech: "verb", example: "Stop the car!" },
  // Set 9: School
  { word: "school", definition: "a place where you learn things 🏫", partOfSpeech: "noun", example: "I go to school." },
  { word: "teacher", definition: "a person who helps you learn", partOfSpeech: "noun", example: "My teacher is kind." },
  { word: "pen", definition: "you use this to write ✏️", partOfSpeech: "noun", example: "I write with a pen." },
  { word: "paper", definition: "thin white sheets you write on 📄", partOfSpeech: "noun", example: "Give me some paper." },
  { word: "read", definition: "to look at words and understand them", partOfSpeech: "verb", example: "I read every day." },
  { word: "write", definition: "to make letters and words on paper", partOfSpeech: "verb", example: "I write my name." },
  { word: "draw", definition: "to make a picture with a pen or pencil ✏️", partOfSpeech: "verb", example: "I draw a house." },
  { word: "learn", definition: "to get new knowledge or skills", partOfSpeech: "verb", example: "I learn English." },
  { word: "good", definition: "nice, well done; not bad 👍", partOfSpeech: "adjective", example: "Good job!" },
  { word: "bad", definition: "not good; wrong 👎", partOfSpeech: "adjective", example: "That is bad." },
  // Set 10: Feelings & Time
  { word: "yes", definition: "a word that means you agree ✅", partOfSpeech: "adverb", example: "Yes, I can!" },
  { word: "no", definition: "a word that means you do not agree ❌", partOfSpeech: "adverb", example: "No, thank you." },
  { word: "sorry", definition: "a word you say when you feel bad about something", partOfSpeech: "adjective", example: "I am sorry." },
  { word: "tired", definition: "feeling like you need to sleep 😴", partOfSpeech: "adjective", example: "I am tired." },
  { word: "hungry", definition: "wanting food; your stomach is empty", partOfSpeech: "adjective", example: "I am hungry." },
  { word: "today", definition: "this day; right now", partOfSpeech: "adverb", example: "Today is Monday." },
  { word: "morning", definition: "the early part of the day, after you wake up 🌅", partOfSpeech: "noun", example: "Good morning!" },
  { word: "night", definition: "the dark time when you sleep 🌙", partOfSpeech: "noun", example: "Good night!" },
  { word: "now", definition: "at this moment; right away", partOfSpeech: "adverb", example: "Do it now." },
  { word: "here", definition: "in this place; where you are", partOfSpeech: "adverb", example: "Come here!" },
];

// ─── EVERYDAY CONVERSATIONAL WORDS (100) ──────────────────
const everydayWords: VocabWord[] = [
  { word: "vibe", definition: "a feeling or atmosphere of a place or situation", partOfSpeech: "noun" },
  { word: "hustle", definition: "to push roughly; to move hurriedly", partOfSpeech: "verb" },
  { word: "chill", definition: "to relax; calm and easy-going", partOfSpeech: "verb/adjective" },
  { word: "quirky", definition: "having peculiar or unexpected traits", partOfSpeech: "adjective" },
  { word: "savvy", definition: "shrewd and knowledgeable", partOfSpeech: "adjective" },
  { word: "glitch", definition: "a sudden, usually temporary malfunction", partOfSpeech: "noun" },
  { word: "kudos", definition: "praise and honor received for an achievement", partOfSpeech: "noun" },
  { word: "binge", definition: "to indulge in an activity excessively", partOfSpeech: "verb" },
  { word: "stoked", definition: "very excited and enthusiastic", partOfSpeech: "adjective" },
  { word: "flaky", definition: "unreliable; canceling plans often", partOfSpeech: "adjective" },
  { word: "lowkey", definition: "in a subtle or understated way", partOfSpeech: "adverb" },
  { word: "salty", definition: "bitter or upset about something", partOfSpeech: "adjective" },
  { word: "ghosting", definition: "suddenly cutting off all communication", partOfSpeech: "noun" },
  { word: "flex", definition: "to show off something you are proud of", partOfSpeech: "verb" },
  { word: "shade", definition: "subtle disrespect or criticism", partOfSpeech: "noun" },
  { word: "crash", definition: "to sleep somewhere temporarily; to show up uninvited", partOfSpeech: "verb" },
  { word: "bail", definition: "to leave suddenly or cancel plans", partOfSpeech: "verb" },
  { word: "sketchy", definition: "looking suspicious or unsafe", partOfSpeech: "adjective" },
  { word: "hype", definition: "excessive publicity or excitement", partOfSpeech: "noun" },
  { word: "legit", definition: "genuine, authentic; for real", partOfSpeech: "adjective" },
  { word: "hangout", definition: "a place where you spend casual time", partOfSpeech: "noun" },
  { word: "catch up", definition: "to exchange news after not seeing someone for a while", partOfSpeech: "verb" },
  { word: "veg out", definition: "to relax and do absolutely nothing", partOfSpeech: "verb" },
  { word: "recap", definition: "to summarize the main points of something", partOfSpeech: "verb" },
  { word: "fomo", definition: "fear of missing out on fun or experiences", partOfSpeech: "noun" },
  { word: "deal breaker", definition: "a factor that makes something unacceptable", partOfSpeech: "noun" },
  { word: "hit up", definition: "to contact someone casually", partOfSpeech: "verb" },
  { word: "wing it", definition: "to do something without preparation", partOfSpeech: "verb" },
  { word: "nailed it", definition: "did something perfectly", partOfSpeech: "phrase" },
  { word: "my bad", definition: "an informal way to say 'my mistake' or 'I'm sorry'", partOfSpeech: "phrase" },
  { word: "no worries", definition: "it's okay; don't be concerned about it", partOfSpeech: "phrase" },
  { word: "heads up", definition: "an advance warning or notification", partOfSpeech: "noun" },
  { word: "keep in touch", definition: "to maintain contact with someone", partOfSpeech: "phrase" },
  { word: "a blast", definition: "a very enjoyable experience or event", partOfSpeech: "noun" },
  { word: "cringe", definition: "feeling embarrassed or uncomfortable", partOfSpeech: "adjective" },
  { word: "sibling", definition: "a brother or sister", partOfSpeech: "noun" },
  { word: "commute", definition: "the regular journey between home and work", partOfSpeech: "noun" },
  { word: "errands", definition: "short trips to do tasks like shopping or banking", partOfSpeech: "noun" },
  { word: "hassle", definition: "something annoying that takes effort", partOfSpeech: "noun" },
  { word: "bummed", definition: "feeling disappointed or let down", partOfSpeech: "adjective" },
  { word: "wholesome", definition: "healthy, positive, and good for you", partOfSpeech: "adjective" },
  { word: "snack", definition: "a small amount of food between meals", partOfSpeech: "noun" },
  { word: "spot", definition: "a particular place or location", partOfSpeech: "noun" },
  { word: "grab", definition: "to take or get something quickly", partOfSpeech: "verb" },
  { word: "split", definition: "to divide or share something equally", partOfSpeech: "verb" },
  { word: "check out", definition: "to look at or examine something interesting", partOfSpeech: "verb" },
  { word: "figure out", definition: "to understand or solve something", partOfSpeech: "verb" },
  { word: "sort out", definition: "to organize or resolve a problem", partOfSpeech: "verb" },
  { word: "work out", definition: "to exercise; or for things to turn out well", partOfSpeech: "verb" },
  { word: "show up", definition: "to arrive somewhere; to appear", partOfSpeech: "verb" },
  { word: "pick up", definition: "to learn something quickly; to collect someone", partOfSpeech: "verb" },
  { word: "drop off", definition: "to deliver someone or something to a location", partOfSpeech: "verb" },
  { word: "run into", definition: "to meet someone unexpectedly", partOfSpeech: "verb" },
  { word: "hang in there", definition: "to persevere through a difficult situation", partOfSpeech: "phrase" },
  { word: "pitch in", definition: "to contribute or help with a task", partOfSpeech: "verb" },
  { word: "tune out", definition: "to stop paying attention", partOfSpeech: "verb" },
  { word: "laid-back", definition: "relaxed and easygoing", partOfSpeech: "adjective" },
  { word: "uptight", definition: "anxious or overly strict about rules", partOfSpeech: "adjective" },
  { word: "down-to-earth", definition: "practical and realistic; not pretentious", partOfSpeech: "adjective" },
  { word: "outgoing", definition: "friendly and socially confident", partOfSpeech: "adjective" },
  { word: "petty", definition: "focused on trivial or unimportant things", partOfSpeech: "adjective" },
  { word: "picky", definition: "very selective; hard to please", partOfSpeech: "adjective" },
  { word: "swamped", definition: "overwhelmed with too much to do", partOfSpeech: "adjective" },
  { word: "burnt out", definition: "exhausted from too much work or stress", partOfSpeech: "adjective" },
  { word: "pumped", definition: "very excited and energized", partOfSpeech: "adjective" },
  { word: "broke", definition: "having no money", partOfSpeech: "adjective" },
  { word: "loaded", definition: "having a lot of money (informal)", partOfSpeech: "adjective" },
  { word: "shady", definition: "dishonest or suspicious", partOfSpeech: "adjective" },
  { word: "solid", definition: "reliable, dependable; also used to mean 'good'", partOfSpeech: "adjective" },
  { word: "epic", definition: "extremely impressive or grand", partOfSpeech: "adjective" },
  { word: "dodgy", definition: "seeming unreliable or potentially dangerous", partOfSpeech: "adjective" },
  { word: "tacky", definition: "showing poor taste or quality", partOfSpeech: "adjective" },
  { word: "cheesy", definition: "unoriginal and overly sentimental", partOfSpeech: "adjective" },
  { word: "random", definition: "happening without pattern; unexpected or strange", partOfSpeech: "adjective" },
  { word: "sus", definition: "suspicious or untrustworthy (slang)", partOfSpeech: "adjective" },
  { word: "dope", definition: "excellent or very cool (slang)", partOfSpeech: "adjective" },
  { word: "gig", definition: "a job, especially a temporary or freelance one", partOfSpeech: "noun" },
  { word: "hack", definition: "a clever trick or shortcut to solve a problem", partOfSpeech: "noun" },
  { word: "vibes", definition: "the overall feeling or mood of a situation", partOfSpeech: "noun" },
  { word: "game plan", definition: "a strategy for achieving something", partOfSpeech: "noun" },
  { word: "comfort zone", definition: "a situation where you feel safe and at ease", partOfSpeech: "noun" },
  { word: "side hustle", definition: "a secondary job done alongside a main one", partOfSpeech: "noun" },
  { word: "RSVP", definition: "to respond to an invitation", partOfSpeech: "verb" },
  { word: "rain check", definition: "a postponement to accept an invitation later", partOfSpeech: "noun" },
  { word: "small talk", definition: "light, casual conversation about unimportant topics", partOfSpeech: "noun" },
  { word: "icebreaker", definition: "something said or done to relieve tension or get conversation started", partOfSpeech: "noun" },
  { word: "networking", definition: "making connections with people for professional purposes", partOfSpeech: "noun" },
  { word: "potluck", definition: "a meal where each guest brings a dish to share", partOfSpeech: "noun" },
  { word: "road trip", definition: "a long journey by car for fun", partOfSpeech: "noun" },
  { word: "jet lag", definition: "tiredness after traveling across time zones", partOfSpeech: "noun" },
  { word: "bucket list", definition: "things you want to do before you die", partOfSpeech: "noun" },
  { word: "throwback", definition: "something that reminds you of the past", partOfSpeech: "noun" },
  { word: "banter", definition: "playful and friendly teasing conversation", partOfSpeech: "noun" },
  { word: "insider tip", definition: "advice from someone with special knowledge", partOfSpeech: "noun" },
  { word: "splurge", definition: "to spend a lot of money on a luxury", partOfSpeech: "verb" },
  { word: "procrastinate", definition: "to delay or postpone doing something", partOfSpeech: "verb" },
  { word: "multitask", definition: "to do several things at the same time", partOfSpeech: "verb" },
  { word: "vent", definition: "to express negative feelings to get relief", partOfSpeech: "verb" },
  { word: "crash", definition: "to fall asleep quickly from exhaustion", partOfSpeech: "verb" },
  { word: "treat", definition: "to buy something nice for someone or yourself", partOfSpeech: "verb" },
];

// ─── HELPERS ──────────────────────────────────────────────

export function getWordBank(type: WordBank): VocabWord[] {
  switch (type) {
    case "academic": return academicWords;
    case "beginner": return beginnerWords;
    case "everyday": return everydayWords;
  }
}

export function getWordSets(type: WordBank): VocabWord[][] {
  const words = getWordBank(type);
  const sets: VocabWord[][] = [];
  for (let i = 0; i < words.length; i += 10) {
    sets.push(words.slice(i, i + 10));
  }
  return sets;
}

export function getRandomWord(type: WordBank, exclude?: string): VocabWord {
  const words = getWordBank(type);
  const filtered = exclude ? words.filter(w => w.word !== exclude) : words;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

const rolePrompts: Record<WordBank, { role: RoleType; label: string }> = {
  academic: { role: "examiner", label: "IELTS Examiner" },
  beginner: { role: "teacher", label: "Kind Teacher" },
  everyday: { role: "local", label: "Native Friend" },
};

export function getRoleForBank(bank: WordBank) {
  return rolePrompts[bank];
}

// Score categories per bank
export interface ScoreCategory {
  key: string;
  label: string;
  description: string;
}

export function getScoreCategories(bank: WordBank): ScoreCategory[] {
  switch (bank) {
    case "beginner":
      return [
        { key: "expression", label: "Expression", description: "Can you say what you mean?" },
        { key: "understanding", label: "Understanding", description: "Do you understand the question?" },
        { key: "confidence", label: "Confidence", description: "Do you try to answer without fear?" },
        { key: "effort", label: "Effort", description: "Are you trying your best?" },
      ];
    case "everyday":
      return [
        { key: "naturalness", label: "Naturalness", description: "Do you sound like a native speaker?" },
        { key: "engagement", label: "Engagement", description: "Are you interesting to talk to?" },
        { key: "flow", label: "Flow", description: "Does the conversation feel smooth?" },
        { key: "adaptability", label: "Adaptability", description: "Can you follow the topic naturally?" },
      ];
    case "academic":
      return [
        { key: "grammar", label: "Grammar", description: "Is your sentence structure correct?" },
        { key: "vocabulary", label: "Vocabulary", description: "Do you use advanced words well?" },
        { key: "fluency", label: "Fluency", description: "Does your writing flow effectively?" },
        { key: "coherence", label: "Coherence", description: "Are your ideas logically connected?" },
      ];
  }
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

// Generate quiz options for a word (3 wrong + 1 correct)
export function generateQuizOptions(correctWord: VocabWord, allWords: VocabWord[]): { definition: string; isCorrect: boolean }[] {
  const others = allWords.filter(w => w.word !== correctWord.word);
  const shuffled = others.sort(() => Math.random() - 0.5);
  const wrong = shuffled.slice(0, 3).map(w => ({ definition: w.definition, isCorrect: false }));
  const options = [...wrong, { definition: correctWord.definition, isCorrect: true }];
  return options.sort(() => Math.random() - 0.5);
}
