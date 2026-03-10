import os
import mimetypes
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from database.core.connection import engine, Base
from api.auth.setup import router as setup_router
from api.auth.login import router as login_router
from api.company.settings import router as company_router

# Create tables
Base.metadata.create_all(bind=engine)

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
