import { useState, useRef, useEffect } from "react";
import { RiBrain3Line, RiCloseLine, RiDeleteBinLine } from "@remixicon/react";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { geminiChat } from "@/services/integrations";

const STORAGE_KEY = "logpose-ai-chat";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: ChatMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

export function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    const userMsg: ChatMessage = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsLoading(true);

    try {
      const history = updated.map((m) => ({ role: m.role, content: m.content }));
      const result = await geminiChat(text, history.slice(0, -1));
      const aiMsg: ChatMessage = { role: "assistant", content: result.response };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Erro desconhecido";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Erro: ${errMsg}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-[400px] h-[560px] rounded-2xl border border-border/60 bg-background shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-blue-500/10 p-1.5">
                <RiBrain3Line className="size-4 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">LOG POSE AI</h3>
                <p className="text-[10px] text-muted-foreground">Assistente Inteligente</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Limpar conversa"
              >
                <RiDeleteBinLine className="size-3.5" />
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Fechar"
              >
                <RiCloseLine className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
          />

          {/* Input */}
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      )}

      {/* Floating Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full p-3.5 bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
          title="Abrir assistente AI"
        >
          <RiBrain3Line className="size-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 size-3 rounded-full bg-blue-500 animate-pulse" />
        </button>
      )}
    </>
  );
}
