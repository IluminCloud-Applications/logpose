import { RiBrain3Line } from "@remixicon/react";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const SUGGESTED_QUESTIONS = [
  "Como está a saúde do meu negócio?",
  "Qual é o melhor criativo?",
  "Onde estão meus gargalos?",
  "Quanto estou perdendo em recuperação?",
];

export function ChatMessages({ messages, isLoading, messagesEndRef }: ChatMessagesProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-blue-500/10 p-4">
          <RiBrain3Line className="size-8 text-blue-500" />
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
          <div
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted/70 text-foreground rounded-bl-md chat-markdown"
            }`}
          >
            {msg.role === "user" ? (
              msg.content
            ) : (
              <Markdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
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
                  p({ children, ...props }: any) {
                    return <p className="mb-2 last:mb-0" {...props}>{children}</p>;
                  },
                  ul({ children, ...props }: any) {
                    return <ul className="list-disc pl-4 mb-2" {...props}>{children}</ul>;
                  },
                  ol({ children, ...props }: any) {
                    return <ol className="list-decimal pl-4 mb-2" {...props}>{children}</ol>;
                  },
                  li({ children, ...props }: any) {
                    return <li className="mb-1" {...props}>{children}</li>;
                  },
                  h1({ children, ...props }: any) {
                    return <h1 className="text-lg font-bold mb-2 mt-3" {...props}>{children}</h1>;
                  },
                  h2({ children, ...props }: any) {
                    return <h2 className="text-base font-bold mb-2 mt-3" {...props}>{children}</h2>;
                  },
                  h3({ children, ...props }: any) {
                    return <h3 className="text-sm font-bold mb-2 mt-2" {...props}>{children}</h3>;
                  },
                  a({ children, ...props }: any) {
                    return <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                  }
                }}
              >
                {msg.content}
              </Markdown>
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-muted/70 rounded-2xl rounded-bl-md px-4 py-3">
            <div className="flex gap-1">
              <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
              <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
              <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
