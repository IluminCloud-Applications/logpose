from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import bcrypt
from database.core.connection import get_db
from database.models.admin import Admin, UserRole

router = APIRouter()


class SetupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str


class InviteSetupRequest(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str


class SetupStatusResponse(BaseModel):
    is_configured: bool


class InviteInfoResponse(BaseModel):
    name: str
    role: str


@router.get("/setup/status", response_model=SetupStatusResponse)
def setup_status(db: Session = Depends(get_db)):
    existing = db.query(Admin).filter(Admin.email.isnot(None)).first()
    return {"is_configured": existing is not None}


@router.get("/setup/invite/{token}", response_model=InviteInfoResponse)
def get_invite_info(token: str, db: Session = Depends(get_db)):
    """Return name and role for an invite token (no auth needed)."""
    invite = db.query(Admin).filter(Admin.invite_token == token).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Convite inválido ou expirado")
    return {"name": invite.name, "role": invite.role}


@router.post("/setup")
def create_admin(data: SetupRequest, db: Session = Depends(get_db)):
    """First-time setup – creates the owner account."""
    existing = db.query(Admin).filter(Admin.email.isnot(None)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Setup already completed")

    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(data.password.encode("utf-8"), salt).decode("utf-8")

    admin = Admin(
        name=data.name,
        email=data.email,
        password_hash=hashed_password,
        role=UserRole.owner,
    )
    db.add(admin)
    db.commit()
    return {"message": "Admin created successfully"}


@router.post("/setup/invite/{token}")
def complete_invite(token: str, data: InviteSetupRequest, db: Session = Depends(get_db)):
    """Complete an invite – convidado sets email + password."""
    invite = db.query(Admin).filter(Admin.invite_token == token).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Convite inválido ou expirado")

    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="As senhas não coincidem")

    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Senha deve ter pelo menos 6 caracteres")

    # Check if email is already taken
    existing = db.query(Admin).filter(Admin.email == data.email, Admin.id != invite.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email já está em uso")

    salt = bcrypt.gensalt()
    invite.email = data.email
    invite.password_hash = bcrypt.hashpw(data.password.encode("utf-8"), salt).decode("utf-8")
    invite.invite_token = None  # consume the token
    db.commit()

    return {"message": "Conta criada com sucesso"}
