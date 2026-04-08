import os
import mimetypes
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# Garante MIME types corretos para arquivos PWA
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/json", ".json")
mimetypes.add_type("image/png", ".png")
mimetypes.add_type("image/webp", ".webp")
from database.core.connection import engine, Base
from database.core.migrate import run_enum_migrations
from api.auth.setup import router as setup_router
from api.auth.login import router as login_router
from api.auth.profile import router as profile_router
from api.company.settings import router as company_router
from api.company.dashboard import router as company_dash_router
from api.vturb.accounts import router as vturb_router
from api.facebook.accounts import router as facebook_router
from api.facebook.discover import router as facebook_discover_router
from api.platforms.webhooks import router as platforms_router
from api.products.crud import router as products_router
from api.products.items import router as product_items_router
from api.products.stats import router as product_stats_router
from api.products.aliases import router as product_aliases_router
from api.funnel.data import router as funnel_router
from api.funnel.recovery_data import router as funnel_recovery_router
from api.sales.transactions import router as sales_router
from api.sales.delete import router as sales_delete_router
from api.customers.list import router as customers_router
from api.customers.filter_options import router as customers_filter_options_router
from api.recovery.config import router as recovery_config_router
from api.recovery.list import router as recovery_list_router
from api.dashboard.overview import router as dashboard_router
from api.campaigns.list import router as campaigns_data_router
from api.campaigns.toggle import router as campaigns_toggle_router
from api.campaigns.budget import router as campaigns_budget_router
from api.campaigns.presets import router as campaigns_presets_router
from api.campaigns.tags import router as campaigns_tags_router
from api.campaigns.markers import router as campaigns_markers_router
from api.campaigns.filters import router as campaigns_filters_router
from api.campaigns.conversion import router as campaigns_conversion_router
from api.campaigns.ai_action import router as campaigns_ai_action_router
from api.campaigns.export_details import router as campaigns_export_details_router
from api.webhook.receive import router as webhook_receiver_router
from api.csv_import.preview import router as import_preview_router
from api.csv_import.execute import router as import_execute_router
from api.refunds.list import router as refunds_list_router
from api.refunds.reasons import router as refunds_reasons_router
from api.vturb.players import router as vturb_players_router
from api.gemini.accounts import router as gemini_accounts_router
from api.gemini.models import router as gemini_models_router
from api.gemini.chat import router as gemini_chat_router
from api.gemini.daily_report import router as gemini_daily_report_router
from api.ai.training_level import router as ai_training_router
from api.campaigns_create.fetch_data import router as campaign_create_fetch_router
from api.campaigns_create.create import router as campaign_create_router
from api.campaigns_create.export_import import router as campaign_create_export_router
from api.users.list import router as users_list_router
from api.users.invite import router as users_invite_router
from api.users.manage import router as users_manage_router
from api.stripe.accounts import router as stripe_accounts_router
from api.subscriptions.metrics import router as subscriptions_metrics_router
from api.advanced_settings.features import router as advanced_settings_router

from database.core.migrate_sql import run_sql_migrations

# Migrate ENUM columns → VARCHAR (idempotent, runs on every boot)
run_enum_migrations(engine)

# Create tables (must run before SQL migrations so tables exist)
Base.metadata.create_all(bind=engine)

# Run SQL migrations from database/migrations/
# (ALTER TABLE / ADD COLUMN statements that depend on existing tables)
run_sql_migrations()

app = FastAPI(title="ConvergeAI API")

# CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(setup_router, prefix="/api")
app.include_router(login_router, prefix="/api")
app.include_router(company_router, prefix="/api")
app.include_router(company_dash_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(vturb_router, prefix="/api")
app.include_router(facebook_router, prefix="/api")
app.include_router(facebook_discover_router, prefix="/api")
app.include_router(platforms_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(product_items_router, prefix="/api")
app.include_router(product_stats_router, prefix="/api")
app.include_router(product_aliases_router, prefix="/api")
app.include_router(funnel_router, prefix="/api")
app.include_router(funnel_recovery_router, prefix="/api")
app.include_router(sales_router, prefix="/api")
app.include_router(sales_delete_router, prefix="/api")
app.include_router(customers_router, prefix="/api")
app.include_router(customers_filter_options_router, prefix="/api")
app.include_router(recovery_config_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(recovery_list_router, prefix="/api")
app.include_router(campaigns_data_router, prefix="/api")
app.include_router(campaigns_toggle_router, prefix="/api")
app.include_router(campaigns_budget_router, prefix="/api")
app.include_router(campaigns_presets_router, prefix="/api")
app.include_router(campaigns_tags_router, prefix="/api")
app.include_router(campaigns_markers_router, prefix="/api")
app.include_router(campaigns_filters_router, prefix="/api")
app.include_router(campaigns_conversion_router, prefix="/api")
app.include_router(campaigns_ai_action_router, prefix="/api")
app.include_router(campaigns_export_details_router, prefix="/api")
app.include_router(webhook_receiver_router, prefix="/api")
app.include_router(import_preview_router, prefix="/api")
app.include_router(import_execute_router, prefix="/api")
app.include_router(refunds_list_router, prefix="/api")
app.include_router(refunds_reasons_router, prefix="/api")
app.include_router(vturb_players_router, prefix="/api")
app.include_router(gemini_accounts_router, prefix="/api")
app.include_router(gemini_models_router, prefix="/api")
app.include_router(gemini_chat_router, prefix="/api")
app.include_router(gemini_daily_report_router, prefix="/api")
app.include_router(ai_training_router, prefix="/api")
app.include_router(campaign_create_fetch_router, prefix="/api")
app.include_router(campaign_create_router, prefix="/api")
app.include_router(campaign_create_export_router, prefix="/api")
app.include_router(users_list_router, prefix="/api")
app.include_router(users_invite_router, prefix="/api")
app.include_router(users_manage_router, prefix="/api")
app.include_router(stripe_accounts_router, prefix="/api")
app.include_router(subscriptions_metrics_router, prefix="/api")
app.include_router(advanced_settings_router, prefix="/api")

# SPA Middleware (serves frontend in production)
_frontend_dir = os.path.join(os.path.dirname(__file__), "frontend_dist")

if os.path.isdir(_frontend_dir):
    class SPAMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next):
            path = request.url.path

            if path.startswith("/api") or path.startswith("/assets"):
                return await call_next(request)

            if request.method != "GET":
                return await call_next(request)

            if path != "/":
                clean_path = path.lstrip("/")
                file_path = os.path.join(_frontend_dir, clean_path)
                if os.path.isfile(file_path):
                    content_type = mimetypes.guess_type(file_path)[0] or "application/octet-stream"
                    return FileResponse(file_path, media_type=content_type)

            index_path = os.path.join(_frontend_dir, "index.html")
            return FileResponse(index_path)

    app.add_middleware(SPAMiddleware)

    _assets_dir = os.path.join(_frontend_dir, "assets")
    if os.path.isdir(_assets_dir):
        app.mount("/assets", StaticFiles(directory=_assets_dir), name="frontend-assets")
