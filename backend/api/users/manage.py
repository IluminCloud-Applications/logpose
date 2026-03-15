from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import bcrypt
from database.core.connection import get_db
from database.models.admin import Admin, UserRole
from api.auth.deps import require_role

router = APIRouter()


class UpdateRoleRequest(BaseModel):
    role: str  # "admin" or "viewer"


class ResetPasswordRequest(BaseModel):
    new_password: str
    confirm_password: str


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    data: UpdateRoleRequest,
    current_user: Admin = Depends(require_role(UserRole.owner)),
    db: Session = Depends(get_db),
):
    """Change a user's role. Only the owner can do this."""
    user = db.query(Admin).filter(Admin.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if user.role == UserRole.owner:
        raise HTTPException(status_code=403, detail="Não é possível alterar o role do owner")

    if data.role not in ("admin", "viewer"):
        raise HTTPException(status_code=400, detail="Role deve ser 'admin' ou 'viewer'")

    user.role = UserRole(data.role)
    db.commit()
    return {"message": "Role atualizado com sucesso"}


@router.put("/users/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    data: ResetPasswordRequest,
    current_user: Admin = Depends(require_role(UserRole.owner)),
    db: Session = Depends(get_db),
):
    """Owner resets another user's password."""
    user = db.query(Admin).filter(Admin.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if user.role == UserRole.owner:
        raise HTTPException(status_code=403, detail="Use o perfil para alterar sua própria senha")

    if data.new_password != data.confirm_password:
        raise HTTPException(status_code=400, detail="As senhas não coincidem")

    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Senha deve ter pelo menos 6 caracteres")

    hashed = bcrypt.hashpw(data.new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user.password_hash = hashed
    db.commit()
    return {"message": "Senha redefinida com sucesso"}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: Admin = Depends(require_role(UserRole.owner, UserRole.admin)),
    db: Session = Depends(get_db),
):
    """Delete a user. Owner cannot be deleted."""
    user = db.query(Admin).filter(Admin.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if user.role == UserRole.owner:
        raise HTTPException(status_code=403, detail="O owner não pode ser removido")

    if user.id == current_user.id:
        raise HTTPException(status_code=403, detail="Você não pode remover a si mesmo")

    # admin can only delete viewers
    if current_user.role == UserRole.admin and user.role != UserRole.viewer:
        raise HTTPException(status_code=403, detail="Você só pode remover visualizadores")

    db.delete(user)
    db.commit()
    return {"message": "Usuário removido com sucesso"}
