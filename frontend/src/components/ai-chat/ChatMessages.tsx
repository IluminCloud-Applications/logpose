import { RiMessageAi3Line } from "@remixicon/react";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ActionButton } from "./ActionButton";
import { parseActionBlocks, hasActionBlocks } from "./actionParser";
import type { AiAction } from "@/services/integrations";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onExecuteAction?: (action: AiAction) => Promise<void>;
}

const SUGGESTED_QUESTIONS = [
  "Como está a saúde do meu negócio?",
  "Qual é o melhor criativo?",
  "Onde estão meus gargalos?",
  "Quanto estou perdendo em recuperação?",
];

export function ChatMessages({ messages, isLoading, messagesEndRef, onExecuteAction }: ChatMessagesProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-blue-500/10 p-4">
          <RiMessageAi3Line className="size-8 text-blue-500" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">Olá, CEO! 👋</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-[260px]">
            Sou seu sócio especialista em tráfego pago. Pergunte sobre suas campanhas, vendas e performance.
          </p>
        </div>
        <div className="w-full space-y-1.5 mt-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <p key={q} className="text-[11px] text-muted-foreground/80 bg-muted/50 rounded-lg px-3 py-2 cursor-default">
              💡 {q}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {msg.role === "user" ? (
            <UserBubble content={msg.content} />
          ) : (
            <AssistantBubble
              content={msg.content}
              onExecuteAction={onExecuteAction}
            />
          )}
        </div>
      ))}
      {isLoading && <LoadingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}

/* ──────── User Bubble ──────── */
function UserBubble({ content }: { content: string }) {
  return (
    <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap bg-primary text-primary-foreground rounded-br-md">
      {content}
    </div>
  );
}

/* ──────── Assistant Bubble ──────── */
function AssistantBubble({
  content,
  onExecuteAction,
}: {
  content: string;
  onExecuteAction?: (action: AiAction) => Promise<void>;
}) {
  const hasActions = hasActionBlocks(content);

  if (!hasActions) {
    return (
      <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap bg-muted/70 text-foreground rounded-bl-md chat-markdown">
        <MarkdownContent text={content} />
      </div>
    );
  }

  // Parsear segmentos (texto + ação)
  const { segments } = parseActionBlocks(content);

  return (
    <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed bg-muted/70 text-foreground rounded-bl-md chat-markdown space-y-2">
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <MarkdownContent key={i} text={seg.content} />
        ) : seg.action && onExecuteAction ? (
          <ActionButton
            key={i}
            action={seg.action}
            onExecute={onExecuteAction}
          />
        ) : null
      )}
    </div>
  );
}

/* ──────── Markdown Renderer ──────── */
function MarkdownContent({ text }: { text: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const inline = !match;
          return !inline && match ? (
            <SyntaxHighlighter
              style={dracula as any}
              language={match[1]}
              PreTag="div"
              className="rounded-md !my-2 !text-[11px]"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={`${className} bg-background/50 px-1 py-0.5 rounded-sm`} {...props}>
              {children}
            </code>
          );
        },
        p: ({ children, ...props }: any) => <p className="mb-2 last:mb-0" {...props}>{children}</p>,
        ul: ({ children, ...props }: any) => <ul className="list-disc pl-4 mb-2" {...props}>{children}</ul>,
        ol: ({ children, ...props }: any) => <ol className="list-decimal pl-4 mb-2" {...props}>{children}</ol>,
        li: ({ children, ...props }: any) => <li className="mb-1" {...props}>{children}</li>,
        h1: ({ children, ...props }: any) => <h1 className="text-lg font-bold mb-2 mt-3" {...props}>{children}</h1>,
        h2: ({ children, ...props }: any) => <h2 className="text-base font-bold mb-2 mt-3" {...props}>{children}</h2>,
        h3: ({ children, ...props }: any) => <h3 className="text-sm font-bold mb-2 mt-2" {...props}>{children}</h3>,
        a: ({ children, ...props }: any) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>,
      }}
    >
      {text}
    </Markdown>
  );
}

/* ──────── Loading ──────── */
function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted/70 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
          <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
          <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
