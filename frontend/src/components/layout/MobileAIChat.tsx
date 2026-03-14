import { useState, useRef, useEffect, useCallback } from "react";
import {
  RiMessageAi3Line,
  RiDeleteBinLine,
  RiArrowLeftLine,
} from "@remixicon/react";
import { ChatMessages } from "../ai-chat/ChatMessages";
import { ChatInput } from "../ai-chat/ChatInput";
import { PageDataToggle } from "../ai-chat/PageDataToggle";
import { geminiChat, executeAiAction, type AiAction } from "@/services/integrations";
import { usePageDataValue } from "@/contexts/PageDataContext";

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

interface MobileAIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileAIChat({ isOpen, onClose }: MobileAIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [usePageContext, setUsePageContext] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const snapshot = usePageDataValue();

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const sendToAI = useCallback(
    async (text: string, currentMessages: ChatMessage[]) => {
      setIsLoading(true);
      try {
        const history = currentMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const pageContext =
          usePageContext && snapshot ? snapshot.data : undefined;
        const result = await geminiChat(text, history, undefined, pageContext);
        const aiMsg: ChatMessage = {
          role: "assistant",
          content: result.response,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Erro desconhecido";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ Erro: ${errMsg}` },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [usePageContext, snapshot]
  );

  const handleSend = async (text: string) => {
    const userMsg: ChatMessage = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    await sendToAI(text, updated.slice(0, -1));
  };

  const handleExecuteAction = useCallback(
    async (action: AiAction) => {
      const result = await executeAiAction(action);
      const feedbackText = `✅ Ação executada com sucesso: ${result.message}. Continue a análise.`;
      const feedbackMsg: ChatMessage = { role: "user", content: feedbackText };
      setMessages((prev) => {
        const updated = [...prev, feedbackMsg];
        sendToAI(feedbackText, updated.slice(0, -1));
        return updated;
      });
    },
    [sendToAI]
  );

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200">
      {/* Header */}
      <MobileAIChatHeader onClose={onClose} onClear={handleClear} />

      {/* Messages */}
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
        onExecuteAction={handleExecuteAction}
      />

      {/* Page Data Toggle + Input */}
      <PageDataToggle
        snapshot={snapshot}
        enabled={usePageContext}
        onToggle={setUsePageContext}
      />
      <div className="pb-safe">
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}

/* ──────── Header ──────── */
function MobileAIChatHeader({
  onClose,
  onClear,
}: {
  onClose: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card">
      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
        >
          <RiArrowLeftLine className="size-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-blue-500/10 p-1.5">
            <RiMessageAi3Line className="size-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">LOG POSE AI</h3>
            <p className="text-[10px] text-muted-foreground">
              Assistente Inteligente
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={onClear}
        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        title="Limpar conversa"
      >
        <RiDeleteBinLine className="size-4" />
      </button>
    </div>
  );
}
