from sqlalchemy import Integer, String, Boolean, Enum, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
import enum
from datetime import datetime

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

class CategoryEnum(enum.Enum):
    WORK = "Work"
    PERSONAL = "Personal"
    SHOPPING = "Shopping"
    HEALTH = "Health"
    OTHER = "Other"

class Todo(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    task: Mapped[str] = mapped_column(String, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    category: Mapped[CategoryEnum] = mapped_column(Enum(CategoryEnum), nullable=False, default=CategoryEnum.OTHER)
    due_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
