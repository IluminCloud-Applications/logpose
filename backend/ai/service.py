"""
Serviço principal do agente AI usando LangChain + Gemini.
Usa bind_tools para a tool universal e executa manualmente.
Suporta page_context para usar dados pré-carregados da página.
"""
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from ai.prompt import SYSTEM_PROMPT, PAGE_CONTEXT_INSTRUCTION
from ai.tools import ALL_TOOLS
from ai.tools.query_tool import query_business_data


METRIC_LABELS = {
    "roas": "ROAS",
    "cpa": "CPA",
    "cpc": "CPC",
    "connect_rate": "Connect Rate (LPV / Cliques)",
}


def _extract_text(content) -> str:
    """Extrai texto do content que pode ser string ou lista de blocos."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict) and "text" in block:
                parts.append(block["text"])
            elif isinstance(block, str):
                parts.append(block)
        return "\n".join(parts)
    return str(content) if content else ""


def _build_user_instructions_block(ai_instructions: dict | None) -> str:
    """Constrói bloco de instruções personalizadas do usuário."""
    if not ai_instructions:
        return ""

    parts = []
    metrics = ai_instructions.get("metrics", {})

    for key, label in METRIC_LABELS.items():
        rule = metrics.get(key)
        if not rule:
            continue
        lines = []
        if rule.get("good"):
            lines.append(f"  - BOM: {rule['good']}")
        if rule.get("bad"):
            lines.append(f"  - RUIM: {rule['bad']}")
        if rule.get("average"):
            lines.append(f"  - NA MÉDIA: {rule['average']}")
        if lines:
            parts.append(f"• {label}:\n" + "\n".join(lines))

    additional = ai_instructions.get("additional_prompt", "").strip()

    if not parts and not additional:
        return ""

    block = "\n\nINSTRUÇÕES DO USUÁRIO (prioridade sobre benchmarks padrão):\n"
    if parts:
        block += "Métricas definidas pelo usuário:\n" + "\n".join(parts) + "\n"
    if additional:
        block += f"\nInstruções adicionais:\n{additional}\n"
    return block


def build_llm(api_key: str, model: str = "gemini-2.0-flash-lite"):
    """Cria LLM com a tool universal vinculada."""
    llm = ChatGoogleGenerativeAI(
        model=model,
        google_api_key=api_key,
        temperature=0.3,
        convert_system_message_to_human=True,
    )
    return llm.bind_tools(ALL_TOOLS)


def build_llm_no_tools(api_key: str, model: str = "gemini-2.0-flash-lite"):
    """Cria LLM sem tools (para quando já temos dados da página)."""
    return ChatGoogleGenerativeAI(
        model=model,
        google_api_key=api_key,
        temperature=0.3,
        convert_system_message_to_human=True,
    )


def format_history(history: list[dict]) -> list:
    """Converte histórico do frontend em mensagens LangChain."""
    messages = []
    for msg in history:
        role = msg.get("role", "")
        content = msg.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))
    return messages


async def run_agent(
    api_key: str,
    model: str,
    user_message: str,
    history: list[dict],
    page_context: str | None = None,
    ai_instructions: dict | None = None,
    learning_data: str = "",
) -> str:
    """Executa o agente. Se page_context presente, usa dados direto sem tool."""
    user_block = _build_user_instructions_block(ai_instructions)

    if page_context:
        return await _run_with_page_context(
            api_key, model, user_message, history, page_context, user_block, learning_data
        )
    return await _run_with_tools(api_key, model, user_message, history, user_block, learning_data)


async def _run_with_page_context(
    api_key: str,
    model: str,
    user_message: str,
    history: list[dict],
    page_context: str,
    user_block: str = "",
    learning_data: str = "",
) -> str:
    """Responde usando dados pré-carregados da página (1 call só)."""
    llm = build_llm_no_tools(api_key, model)

    system = f"{SYSTEM_PROMPT}{user_block}\n\n{PAGE_CONTEXT_INSTRUCTION}"
    if learning_data:
        system += _build_learning_block(learning_data)
    messages = [SystemMessage(content=system)]
    messages.extend(format_history(history))

    enriched = f"{user_message}\n\n---\n{page_context}"
    messages.append(HumanMessage(content=enriched))

    response = await llm.ainvoke(messages)
    return _extract_text(response.content) or "Não consegui processar."


async def _run_with_tools(
    api_key: str,
    model: str,
    user_message: str,
    history: list[dict],
    user_block: str = "",
    learning_data: str = "",
) -> str:
    """Executa: LLM decide tool calls → executa tool → LLM responde."""
    llm = build_llm(api_key, model)

    system_prompt = f"{SYSTEM_PROMPT}{user_block}"
    if learning_data:
        system_prompt += _build_learning_block(learning_data)
    messages = [SystemMessage(content=system_prompt)]
    messages.extend(format_history(history))
    messages.append(HumanMessage(content=user_message))

    # Call 1: LLM decide o que buscar
    response = await llm.ainvoke(messages)

    # Se não tem tool calls, responde direto
    if not response.tool_calls:
        return _extract_text(response.content) or "Não consegui processar."

    # Executar a tool universal com os args
    tool_call = response.tool_calls[0]
    tool_result = query_business_data.invoke(tool_call["args"])

    # Call 2: LLM analisa resultado e responde
    messages.append(response)
    messages.append(HumanMessage(content=f"Resultado da consulta:\n{tool_result}"))

    final = await llm.ainvoke(messages)
    return _extract_text(final.content) or "Não consegui processar."


def _build_learning_block(learning_data: str) -> str:
    """Monta bloco de aprendizado para o system prompt."""
    return (
        "\n\nHISTÓRICO DE AÇÕES DO CEO (aprendizado automático):\n"
        "Estes são registros reais das ações que o CEO tomou recentemente "
        "(aumentar/diminuir orçamento, pausar campanhas). "
        "Use para entender os padrões e critérios de decisão dele, "
        "e calibre suas recomendações com base nesses padrões.\n\n"
        f"{learning_data}\n"
    )
