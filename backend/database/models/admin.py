import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT


class UserRole(str, enum.Enum):
    owner = "owner"
    admin = "admin"
    viewer = "viewer"


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    role = Column(Enum(UserRole, name="userrole"), nullable=False, default=UserRole.admin)
    invite_token = Column(String(255), unique=True, nullable=True)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
