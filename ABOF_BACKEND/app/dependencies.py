from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.security import read_token

bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Sign in to continue.")
    user_id = read_token(credentials.credentials)
    user = db.get(User, user_id) if user_id else None
    if user is None or not user.active:
        raise HTTPException(status_code=401, detail="Your session is invalid or expired.")
    if user.role not in {"super_administrator", "administrator", "editor", "content_contributor", "applications_reviewer"}:
        raise HTTPException(status_code=403, detail="Your account does not have access.")
    return user


def require_content_editor(user: Annotated[User, Depends(get_current_user)]) -> User:
    if user.role not in {"super_administrator", "administrator", "editor", "content_contributor"}:
        raise HTTPException(status_code=403, detail="You do not have content permissions.")
    return user


def require_applications_reviewer(user: Annotated[User, Depends(get_current_user)]) -> User:
    if user.role not in {"super_administrator", "administrator", "applications_reviewer"}:
        raise HTTPException(status_code=403, detail="You do not have application permissions.")
    return user
