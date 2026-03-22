import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.core.connection import get_db
from database.models.admin import Admin, UserRole
from api.auth.deps import require_role

router = APIRouter()


class InviteRequest(BaseModel):
    name: str
    role: str  # "admin" or "viewer"


class InviteResponse(BaseModel):
    id: int
    name: str
    role: str
    invite_token: str


@router.post("/users/invite", response_model=InviteResponse)
def create_invite(
    data: InviteRequest,
    current_user: Admin = Depends(require_role(UserRole.owner, UserRole.admin)),
    db: Session = Depends(get_db),
):
    """Create an invite for a new user (generates a unique token)."""
    if data.role not in ("admin", "viewer"):
        raise HTTPException(status_code=400, detail="Role deve ser 'admin' ou 'viewer'")

    # Only owner can create admins
    if data.role == "admin" and current_user.role != UserRole.owner:
        raise HTTPException(
            status_code=403,
            detail="Apenas o owner pode criar administradores",
        )

    token = uuid.uuid4().hex

    user = Admin(
        name=data.name.strip(),
        role=UserRole(data.role),
        invite_token=token,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "role": user.role,
        "invite_token": token,
    }
