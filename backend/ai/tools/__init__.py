"""
Registro da tool universal para o agente AI.
Usa apenas 1 tool (query_business_data) que aceita múltiplas consultas,
reduzindo o consumo de API do Gemini para 2 calls por pergunta.
"""
from ai.tools.query_tool import query_business_data

ALL_TOOLS = [query_business_data]
