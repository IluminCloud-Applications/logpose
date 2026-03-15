from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.core.connection import get_db
from database.models.admin import Admin, UserRole
from api.auth.deps import require_role

router = APIRouter()


@router.get("/users")
def list_users(
    current_user: Admin = Depends(require_role(UserRole.owner, UserRole.admin)),
    db: Session = Depends(get_db),
):
    """List all users. Owners and admins can see everyone."""
    users = db.query(Admin).order_by(Admin.id).all()
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role.value,
            "status": "active" if u.email and u.password_hash else "pending",
            "invite_token": u.invite_token if u.invite_token else None,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })
    return result
