from pydantic import BaseModel


class VturbVideo(BaseModel):
    """Informações básicas do vídeo retornadas da API de players."""
    id: str
    name: str
    duration: int = 0


class VturbVideoStats(BaseModel):
    """
    Estatísticas do vídeo agregadas, prontas para mapear para o frontend
    ou cruzar com os dados de Meta Ads (landing page views -> plays).
    """
    video_id: str
    video_name: str
    views: int = 0           # total_viewed da API
    plays: int = 0           # total_started da API (clicou no play)
    clicks: int = 0          # total_clicked da API (CTA do vídeo)
    play_rate: float = 0.0   # play_rate fornecido ou calculado
    engagement_rate: float = 0.0  # engagement_rate fornecido
