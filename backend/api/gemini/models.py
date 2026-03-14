"""
Endpoint para listar modelos disponíveis do Gemini.
Usa httpx para chamar a API REST diretamente (sem SDK).
"""
from fastapi import APIRouter, Depends, Query, HTTPException
import httpx

from api.auth.deps import get_current_user

router = APIRouter(prefix="/gemini", tags=["gemini"])

GEMINI_MODELS_URL = "https://generativelanguage.googleapis.com/v1beta/models"


@router.get("/models")
async def list_gemini_models(
    api_key: str = Query(...),
    _=Depends(get_current_user),
):
    """Lista modelos disponíveis para a API Key fornecida."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(GEMINI_MODELS_URL, params={"key": api_key})

        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="API Key inválida ou erro na API do Google")

        data = resp.json()
        result = []
        for model in data.get("models", []):
            methods = model.get("supportedGenerationMethods", [])
            if "generateContent" in methods:
                name = model.get("name", "")
                result.append({
                    "id": name.replace("models/", ""),
                    "name": model.get("displayName", name),
                    "description": model.get("description", ""),
                })
        return result
    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Erro de conexão: {str(e)}")
