import { useState } from "react";
import { ArrowLeft, MessageSquare, Globe, Utensils, Briefcase, Heart, Gamepad2, Plane, Stethoscope, ShoppingCart, GraduationCap, Sparkles } from "lucide-react";
import type { WordBank } from "@/lib/vocabulary";

export interface ConversationTopic {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  type: "topic" | "scenario";
  prompt: string;
}

const topicsByBank: Record<WordBank, ConversationTopic[]> = {
  beginner: [
    { id: "free", label: "Free Chat", description: "Talk about anything!", icon: <MessageSquare className="w-5 h-5" />, type: "topic", prompt: "free" },
    { id: "food", label: "Food & Drinks", description: "Talk about yummy things 🍕", icon: <Utensils className="w-5 h-5" />, type: "topic", prompt: "Talk about food, drinks, and meals. Ask about favorite foods." },
    { id: "family", label: "My Family", description: "Talk about your family 👨‍👩‍👧", icon: <Heart className="w-5 h-5" />, type: "topic", prompt: "Talk about family members, what they look like, and what they do." },
    { id: "animals", label: "Animals", description: "Talk about pets and animals 🐶", icon: <Gamepad2 className="w-5 h-5" />, type: "topic", prompt: "Talk about animals, pets, and favorite animals." },
    { id: "sc-shop", label: "🛒 At the Shop", description: "Practice buying things", icon: <ShoppingCart className="w-5 h-5" />, type: "scenario", prompt: "Role-play: The student is at a small shop trying to buy fruit and snacks. You are the friendly shopkeeper. Use very simple English." },
    { id: "sc-school", label: "🏫 First Day of School", description: "Meet a new classmate", icon: <GraduationCap className="w-5 h-5" />, type: "scenario", prompt: "Role-play: It's the student's first day at a new school. You are a friendly classmate introducing yourself and showing them around. Keep language very simple." },
  ],
  everyday: [
    { id: "free", label: "Free Chat", description: "Just vibes, talk about whatever", icon: <MessageSquare className="w-5 h-5" />, type: "topic", prompt: "free" },
    { id: "travel", label: "Travel & Adventure", description: "Trips, destinations, travel stories", icon: <Plane className="w-5 h-5" />, type: "topic", prompt: "Talk about travel experiences, dream destinations, and travel tips. Share stories about trips you've taken." },
    { id: "food", label: "Food & Cooking", description: "Restaurants, recipes, food culture", icon: <Utensils className="w-5 h-5" />, type: "topic", prompt: "Talk about cooking, restaurants, food trends, and favorite cuisines. Be a foodie!" },
    { id: "entertainment", label: "Movies & Music", description: "Shows, songs, pop culture", icon: <Sparkles className="w-5 h-5" />, type: "topic", prompt: "Talk about movies, TV shows, music, and pop culture. Discuss what you've been watching or listening to." },
    { id: "work", label: "Work & Career", description: "Jobs, side hustles, networking", icon: <Briefcase className="w-5 h-5" />, type: "topic", prompt: "Talk about jobs, career goals, work-life balance, and professional experiences." },
    { id: "sc-restaurant", label: "🍽️ Ordering at a Restaurant", description: "Practice ordering food & drinks", icon: <Utensils className="w-5 h-5" />, type: "scenario", prompt: "Role-play: The student is at a casual American restaurant. You are the waiter/waitress. Take their order, suggest specials, handle any issues naturally." },
    { id: "sc-roommate", label: "🏠 Meeting a New Roommate", description: "First conversation with a roommate", icon: <Heart className="w-5 h-5" />, type: "scenario", prompt: "Role-play: You are the student's new roommate. You're meeting for the first time. Discuss house rules, preferences, and get to know each other casually." },
    { id: "sc-doctor", label: "🏥 At the Doctor", description: "Describe symptoms, ask questions", icon: <Stethoscope className="w-5 h-5" />, type: "scenario", prompt: "Role-play: You are a friendly doctor. The student has come in feeling unwell. Ask about symptoms, give advice, and be patient and helpful." },
  ],
  intermediate: [
    { id: "free", label: "Free Chat", description: "Open discussion on any topic", icon: <MessageSquare className="w-5 h-5" />, type: "topic", prompt: "free" },
    { id: "science", label: "Science & Nature", description: "Experiments, environment, discoveries", icon: <Globe className="w-5 h-5" />, type: "topic", prompt: "Discuss science topics like the environment, space, biology, or recent discoveries. Encourage the student to explain and reason." },
    { id: "history", label: "History & Culture", description: "Past events, traditions, world cultures", icon: <GraduationCap className="w-5 h-5" />, type: "topic", prompt: "Discuss historical events, cultural traditions, or how the past connects to the present. Ask for opinions and comparisons." },
    { id: "tech", label: "Technology", description: "Apps, gadgets, internet, AI", icon: <Sparkles className="w-5 h-5" />, type: "topic", prompt: "Discuss technology topics: social media, AI, gadgets, gaming, and how technology affects daily life." },
    { id: "sports", label: "Sports & Health", description: "Exercise, teams, wellness", icon: <Heart className="w-5 h-5" />, type: "topic", prompt: "Discuss sports, fitness, health habits, and wellness. Talk about favorite sports, athletes, or staying active." },
    { id: "sc-interview", label: "💼 Job Interview", description: "Practice answering interview questions", icon: <Briefcase className="w-5 h-5" />, type: "scenario", prompt: "Role-play: You are interviewing the student for a part-time job at a bookstore. Ask about their skills, availability, and why they want the job. Be professional but friendly." },
    { id: "sc-debate", label: "🎤 Class Debate", description: "Argue a position on a topic", icon: <MessageSquare className="w-5 h-5" />, type: "scenario", prompt: "Role-play: You and the student are having a friendly class debate. Pick a debatable school topic (e.g., 'Should homework be banned?') and take the opposing side. Push them to support their arguments." },
    { id: "sc-travel", label: "✈️ Airport Check-in", description: "Navigate an airport situation", icon: <Plane className="w-5 h-5" />, type: "scenario", prompt: "Role-play: You are an airport check-in agent. The student is traveling internationally. Handle check-in, ask about luggage, and help with any issues like seat preferences or connecting flights." },
  ],
  academic: [
    { id: "free", label: "Free Discussion", description: "Open intellectual discourse", icon: <MessageSquare className="w-5 h-5" />, type: "topic", prompt: "free" },
    { id: "philosophy", label: "Philosophy & Ethics", description: "Morality, existence, society", icon: <GraduationCap className="w-5 h-5" />, type: "topic", prompt: "Discuss philosophical questions: ethics, free will, justice, consciousness, or the nature of knowledge. Engage deeply with ideas." },
    { id: "global", label: "Global Issues", description: "Climate, inequality, politics", icon: <Globe className="w-5 h-5" />, type: "topic", prompt: "Discuss current global issues: climate change, economic inequality, geopolitics, migration, or public health. Analyze causes and propose solutions." },
    { id: "literature", label: "Literature & Arts", description: "Books, poetry, film analysis", icon: <Sparkles className="w-5 h-5" />, type: "topic", prompt: "Discuss literature, art, film, or music from an analytical perspective. Explore themes, symbolism, and cultural significance." },
    { id: "science", label: "Science & Innovation", description: "Research, discoveries, future tech", icon: <Globe className="w-5 h-5" />, type: "topic", prompt: "Discuss scientific research, technological innovation, bioethics, AI, or space exploration. Focus on implications and critical analysis." },
    { id: "sc-conference", label: "🎓 Academic Conference", description: "Present and defend your research", icon: <GraduationCap className="w-5 h-5" />, type: "scenario", prompt: "Role-play: You are a fellow researcher at an academic conference. The student has just presented their research. Ask challenging but respectful questions about their methodology, findings, and implications." },
    { id: "sc-ielts", label: "📝 IELTS Speaking Mock", description: "Practice IELTS speaking test format", icon: <MessageSquare className="w-5 h-5" />, type: "scenario", prompt: "Role-play: You are an IELTS examiner conducting a Part 2 & 3 speaking test. Give the student a cue card topic, let them speak for 1-2 minutes, then ask follow-up questions probing deeper into the topic. Score-worthy discourse." },
    { id: "sc-ted", label: "🎤 TED Talk Q&A", description: "Answer audience questions after a talk", icon: <Sparkles className="w-5 h-5" />, type: "scenario", prompt: "Role-play: The student just gave a TED-style talk on a topic of their choice. You are an audience member asking thoughtful, challenging questions. Push them to elaborate and defend their ideas." },
  ],
};

export function getTopicsForBank(bank: WordBank): ConversationTopic[] {
  return topicsByBank[bank] || topicsByBank.academic;
}

interface Props {
  bank: WordBank;
  roleLabel: string;
  onSelect: (topic: ConversationTopic) => void;
  onBack: () => void;
}

export default function ConversationTopicPicker({ bank, roleLabel, onSelect, onBack }: Props) {
  const topics = getTopicsForBank(bank);
  const freeChat = topics.find(t => t.id === "free")!;
  const themeTopics = topics.filter(t => t.type === "topic" && t.id !== "free");
  const scenarios = topics.filter(t => t.type === "scenario");

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded hover:bg-muted transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <p className="text-sm font-semibold text-foreground">Choose a Topic</p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Free chat - prominent */}
        <button
          onClick={() => onSelect(freeChat)}
          className="w-full text-left rounded-xl p-4 bg-primary/10 border-2 border-primary/20 hover:border-primary/40 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              {freeChat.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{freeChat.label}</p>
              <p className="text-xs text-muted-foreground">{freeChat.description}</p>
            </div>
          </div>
        </button>

        {/* Topics */}
        {themeTopics.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">💬 Conversation Topics</p>
            <div className="grid grid-cols-2 gap-2.5">
              {themeTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => onSelect(topic)}
                  className="text-left rounded-lg p-3.5 bg-card border border-border hover:border-foreground/20 transition-all active:scale-[0.97]"
                >
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground mb-2">
                    {topic.icon}
                  </div>
                  <p className="text-sm font-medium text-foreground">{topic.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{topic.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scenarios */}
        {scenarios.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">🎭 Role-Play Scenarios</p>
            <div className="space-y-2">
              {scenarios.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => onSelect(scenario)}
                  className="w-full text-left rounded-lg p-3.5 bg-card border border-border hover:border-foreground/20 transition-all active:scale-[0.97]"
                >
                  <p className="text-sm font-medium text-foreground">{scenario.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{scenario.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
