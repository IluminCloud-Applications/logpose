import type { AiAction } from "@/services/integrations";

/**
 * Extrai blocos de ação do texto de resposta da AI.
 * Blocos de ação usam a linguagem "action" em markdown code blocks.
 *
 * Retorna: { segments: array de texto ou ação, actions: todas as ações }
 */
export interface MessageSegment {
  type: "text" | "action";
  content: string;
  action?: AiAction;
}

const ACTION_BLOCK_REGEX = /```action\s*\n([\s\S]*?)\n```/g;

export function parseActionBlocks(text: string): {
  segments: MessageSegment[];
  actions: AiAction[];
} {
  const actions: AiAction[] = [];
  const segments: MessageSegment[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex state
  ACTION_BLOCK_REGEX.lastIndex = 0;

  while ((match = ACTION_BLOCK_REGEX.exec(text)) !== null) {
    // Texto antes do bloco de ação
    const before = text.slice(lastIndex, match.index).trim();
    if (before) {
      segments.push({ type: "text", content: before });
    }

    // Parsear JSON da ação
    try {
      const json = JSON.parse(match[1].trim());
      const action: AiAction = {
        action: json.action,
        entity_id: json.entity_id,
        entity_type: json.entity_type || "campaign",
        entity_name: json.entity_name || json.entity_id,
        value: json.value,
        current_budget: json.current_budget,
      };
      actions.push(action);
      segments.push({ type: "action", content: match[0], action });
    } catch {
      // Se o JSON for inválido, trata como texto normal
      segments.push({ type: "text", content: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Texto depois do último bloco
  const remaining = text.slice(lastIndex).trim();
  if (remaining) {
    segments.push({ type: "text", content: remaining });
  }

  // Se não encontrou nenhum bloco, retorna o texto inteiro
  if (segments.length === 0) {
    segments.push({ type: "text", content: text });
  }

  return { segments, actions };
}

/**
 * Verifica se uma mensagem contém blocos de ação.
 */
export function hasActionBlocks(text: string): boolean {
  ACTION_BLOCK_REGEX.lastIndex = 0;
  return ACTION_BLOCK_REGEX.test(text);
}
