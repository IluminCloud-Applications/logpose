"""
Endpoint de chat com a AI — recebe pergunta e retorna resposta do agente.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
import asyncio

from database.core.connection import get_db
from database.models.gemini_account import GeminiAccount
from database.models.company import CompanySettings
from api.auth.deps import get_current_user
from api.campaigns.actions import fetch_learning_data
from ai.service import run_agent

router = APIRouter(prefix="/gemini", tags=["gemini"])


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []
    account_id: int | None = None
    page_context: str | None = None


class ChatResponse(BaseModel):
    response: str


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Envia mensagem para a AI e retorna resposta."""
    # Buscar conta Gemini (específica ou primeira)
    if payload.account_id:
        account = db.query(GeminiAccount).filter(
            GeminiAccount.id == payload.account_id
        ).first()
    else:
        account = db.query(GeminiAccount).first()

    if not account:
        raise HTTPException(
            status_code=400,
            detail="Nenhuma conta Gemini configurada. Adicione uma API Key em Integrações → Gemini API."
        )

    # Buscar instruções personalizadas do usuário
    settings = db.query(CompanySettings).first()
    ai_instructions = settings.ai_instructions if settings else None

    # Buscar dados de aprendizado (ações do CEO)
    learning_data = fetch_learning_data(db)

    try:
        response = await run_agent(
            api_key=account.api_key,
            model=account.model,
            user_message=payload.message,
            history=payload.history,
            page_context=payload.page_context,
            ai_instructions=ai_instructions,
            learning_data=learning_data,
        )
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na AI: {str(e)}")


@router.get("/status")
def gemini_status(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Verifica se há pelo menos uma conta Gemini configurada."""
    count = db.query(GeminiAccount).count()
    return {"configured": count > 0, "count": count}
