"""
Serviço principal do agente AI usando LangChain + Gemini.
Usa bind_tools para a tool universal e executa manualmente.
"""
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from ai.prompt import SYSTEM_PROMPT
from ai.tools import ALL_TOOLS
from ai.tools.query_tool import query_business_data


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


def build_llm(api_key: str, model: str = "gemini-2.0-flash-lite"):
    """Cria LLM com a tool universal vinculada."""
    llm = ChatGoogleGenerativeAI(
        model=model,
        google_api_key=api_key,
        temperature=0.3,
        convert_system_message_to_human=True,
    )
    return llm.bind_tools(ALL_TOOLS)


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
) -> str:
    """Executa: LLM decide tool calls → executa tool → LLM responde."""
    llm = build_llm(api_key, model)

    messages = [SystemMessage(content=SYSTEM_PROMPT)]
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
