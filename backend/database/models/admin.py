from sqlalchemy import Column, Integer, String, DateTime
from database.core.connection import Base
from database.core.timezone import CREATED_AT_DEFAULT


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=CREATED_AT_DEFAULT)
