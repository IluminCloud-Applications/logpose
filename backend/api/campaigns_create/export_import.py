"""
Endpoints de exportação e importação de campanha.
Permite salvar/carregar configuração de campanha como JSON.
"""
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from api.auth.deps import get_current_user
from api.campaigns_create.schemas import CampaignExportData

router = APIRouter(
    prefix="/campaigns/create",
    tags=["campaign-creator"],
)


@router.post("/export")
async def export_campaign(
    data: CampaignExportData,
    _=Depends(get_current_user),
):
    """Retorna os dados da campanha formatados para download."""
    return JSONResponse(
        content=data.model_dump(),
        headers={
            "Content-Disposition": "attachment; filename=campaign_export.json",
        },
    )


@router.post("/import")
async def import_campaign(
    data: CampaignExportData,
    _=Depends(get_current_user),
):
    """Valida e retorna dados importados para preencher o formulário."""
    return {
        "success": True,
        "data": data.model_dump(),
    }
