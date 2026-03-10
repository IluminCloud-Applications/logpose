from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database.core.connection import get_db
from database.models.admin import Admin

router = APIRouter()


class SetupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str


class SetupStatusResponse(BaseModel):
    is_configured: bool


@router.get("/setup/status", response_model=SetupStatusResponse)
def setup_status(db: Session = Depends(get_db)):
    existing = db.query(Admin).first()
    return {"is_configured": existing is not None}


import bcrypt

@router.post("/setup")
def create_admin(data: SetupRequest, db: Session = Depends(get_db)):
    existing = db.query(Admin).first()
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
    )
    db.add(admin)
    db.commit()
    return {"message": "Admin created successfully"}
