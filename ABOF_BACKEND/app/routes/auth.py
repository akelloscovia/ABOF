from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import LoginInput, UserOutput
from app.security import create_token, verify_password

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/login")
def login(payload: LoginInput, db: Annotated[Session, Depends(get_db)]):
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not user.active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    return {"access_token": create_token(user.id), "token_type": "bearer", "user": UserOutput.model_validate(user)}


@router.get("/me", response_model=UserOutput)
def me(user: Annotated[User, Depends(get_current_user)]):
    return user
