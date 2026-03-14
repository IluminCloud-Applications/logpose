import { useState, useRef, useEffect } from "react";
import { RiSendPlaneFill } from "@remixicon/react";

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border/40 px-3 py-2.5 bg-card">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre suas campanhas..."
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none bg-transparent text-[13px] placeholder:text-muted-foreground/60 focus:outline-none max-h-[100px] overflow-auto py-1"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          className="shrink-0 rounded-lg p-2 bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
        >
          <RiSendPlaneFill className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
