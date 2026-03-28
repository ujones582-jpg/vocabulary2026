import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MessageSquare, Trash2, ChevronRight, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { WordBank } from "@/lib/vocabulary";
import { getRoleForBank } from "@/lib/vocabulary";

interface StoredMessage {
  role: "ai" | "user";
  content: string;
}

interface ConversationRecord {
  id: string;
  bank: string;
  role_label: string;
  messages: StoredMessage[];
  rounds_completed: number;
  created_at: string;
}

export default function ChatHistory() {
  const [searchParams] = useSearchParams();
  const bank = (searchParams.get("bank") || "academic") as WordBank;
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["chat-history", bank, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("conversation_history")
        .select("*")
        .eq("user_id", user.id)
        .eq("bank", bank)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        messages: (typeof d.messages === "string" ? JSON.parse(d.messages) : d.messages) as StoredMessage[],
      })) as ConversationRecord[];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("conversation_history").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-history"] });
      setSelectedId(null);
    },
  });

  const selected = conversations.find((c) => c.id === selectedId);
  const roleInfo = getRoleForBank(bank);

  if (selected) {
    return (
      <div className="min-h-screen flex flex-col max-w-md mx-auto">
        <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSelectedId(null)} className="p-1.5 rounded hover:bg-muted transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{selected.role_label}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(selected.created_at).toLocaleDateString()} · {selected.rounds_completed} rounds
            </p>
          </div>
          <button onClick={() => deleteMutation.mutate(selected.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors active:scale-95">
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>

        <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
          {selected.messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "flex justify-end" : ""}>
              {msg.role === "ai" ? (
                <div className="max-w-[85%]">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{selected.role_label}</p>
                  <div className="bg-card rounded-lg rounded-tl-sm p-3.5 border border-border">
                    <p className="text-sm text-foreground leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-[85%] bg-primary rounded-lg rounded-tr-sm p-3.5">
                  <p className="text-sm text-primary-foreground leading-relaxed">{msg.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(`/learn?bank=${bank}`)} className="p-1.5 rounded hover:bg-muted transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Past conversations</p>
          <p className="text-xs text-muted-foreground">{conversations.length} total</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const preview = conv.messages.find((m) => m.role === "user")?.content || "No messages";
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className="w-full bg-card rounded-lg p-4 border border-border text-left transition-all hover:border-foreground/15 active:scale-[0.98] flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{conv.role_label}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{preview}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(conv.created_at).toLocaleDateString()} · {conv.rounds_completed} rounds
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
