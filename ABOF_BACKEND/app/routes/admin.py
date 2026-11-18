import re
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.dependencies import (
    get_current_user,
    require_applications_reviewer,
    require_content_editor,
)
from app.models import AuditLog, Content, Submission, User
from app.schemas import (
    ContentInput,
    ContentKind,
    ContentOutput,
    AdminUserCreate,
    AdminUserOutput,
    AdminUserUpdate,
    SubmissionOutput,
    SubmissionStatusInput,
)
from app.security import hash_password

router = APIRouter(prefix="/api/admin", tags=["administration"])
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
IMAGE_TYPES = {
    ".jpg": ("image/jpeg", lambda data: data.startswith(b"\xff\xd8\xff")),
    ".jpeg": ("image/jpeg", lambda data: data.startswith(b"\xff\xd8\xff")),
    ".png": ("image/png", lambda data: data.startswith(b"\x89PNG\r\n\x1a\n")),
    ".gif": ("image/gif", lambda data: data.startswith((b"GIF87a", b"GIF89a"))),
    ".webp": ("image/webp", lambda data: data.startswith(b"RIFF") and data[8:12] == b"WEBP"),
}


def require_super_admin(user: User) -> None:
    if user.role != "super_administrator":
        raise HTTPException(status_code=403, detail="Only a super administrator can manage user accounts.")


def make_slug(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug[:180] or "untitled"


def log_action(db: Session, user: User, action: str, entity: str, entity_id: int | None):
    db.add(AuditLog(user_id=user.id, action=action, entity=entity, entity_id=entity_id))


@router.get("/overview")
def overview(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    return {
        "content": db.scalar(select(func.count()).select_from(Content)) or 0,
        "published": db.scalar(select(func.count()).select_from(Content).where(Content.status == "published")) or 0,
        "new_submissions": db.scalar(select(func.count()).select_from(Submission).where(Submission.status == "new")) or 0,
        "role": user.role,
    }


@router.post("/media", status_code=201)
async def upload_media(
    file: Annotated[UploadFile, File()],
    user: Annotated[User, Depends(require_content_editor)],
):
    extension = "." + (file.filename or "").rsplit(".", 1)[-1].lower()
    image_type = IMAGE_TYPES.get(extension)
    if image_type is None:
        raise HTTPException(status_code=415, detail="Upload a JPEG, PNG, GIF, or WebP image.")
    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Images must be 5 MB or smaller.")
    content_type, is_valid = image_type
    if not is_valid(content):
        raise HTTPException(status_code=415, detail="The selected file is not a valid supported image.")
    filename = f"{uuid.uuid4().hex}{extension}"
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    (settings.upload_dir / filename).write_bytes(content)
    return {"url": f"/media/{filename}", "content_type": content_type, "size": len(content)}


@router.get("/content/{kind}", response_model=list[ContentOutput])
def list_content(
    kind: ContentKind,
    user: Annotated[User, Depends(require_content_editor)],
    db: Annotated[Session, Depends(get_db)],
):
    return db.scalars(
        select(Content).where(Content.kind == kind).order_by(Content.updated_at.desc())
    ).all()


@router.post("/content/{kind}", response_model=ContentOutput, status_code=201)
def create_content(
    kind: ContentKind,
    payload: ContentInput,
    user: Annotated[User, Depends(require_content_editor)],
    db: Annotated[Session, Depends(get_db)],
):
    if payload.status != "draft" and user.role == "content_contributor":
        raise HTTPException(status_code=403, detail="Content contributors can only save drafts.")
    data = payload.model_dump()
    data["slug"] = make_slug(data["slug"] or data["title"])
    record = Content(kind=kind, **data)
    db.add(record)
    try:
        db.flush()
        log_action(db, user, "created", kind, record.id)
        db.commit()
        db.refresh(record)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="That URL slug is already in use.") from exc
    return record


@router.get("/users", response_model=list[AdminUserOutput])
def list_users(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_super_admin(user)
    return db.scalars(select(User).order_by(User.created_at)).all()


@router.post("/users", response_model=AdminUserOutput, status_code=201)
def create_user(
    payload: AdminUserCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_super_admin(user)
    record = User(
        email=str(payload.email).lower(),
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(record)
    try:
        db.flush()
        log_action(db, user, "created", "user", record.id)
        db.commit()
        db.refresh(record)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with that email already exists.") from exc
    return record


@router.patch("/users/{user_id}", response_model=AdminUserOutput)
def update_user(
    user_id: int,
    payload: AdminUserUpdate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    require_super_admin(user)
    record = db.get(User, user_id)
    if record is None:
        raise HTTPException(status_code=404, detail="User account was not found.")
    changes = payload.model_dump(exclude_unset=True)
    resulting_role = changes.get("role", record.role)
    resulting_active = changes.get("active", record.active)
    if record.id == user.id and (
        resulting_role != user.role or not resulting_active
    ):
        raise HTTPException(
            status_code=409,
            detail="Ask another super administrator to change or deactivate your own account.",
        )
    removes_super_admin = record.role == "super_administrator" and (
        resulting_role != "super_administrator" or not resulting_active
    )
    if removes_super_admin:
        active_admins = db.scalar(
            select(func.count()).select_from(User).where(
                User.role == "super_administrator", User.active.is_(True)
            )
        ) or 0
        if active_admins <= 1:
            raise HTTPException(
                status_code=409,
                detail="At least one active super administrator must remain.",
            )
    for key, value in changes.items():
        setattr(record, key, value)
    log_action(db, user, "updated", "user", record.id)
    db.commit()
    db.refresh(record)
    return record


@router.patch("/content/{kind}/{item_id}", response_model=ContentOutput)
def update_content(
    kind: ContentKind,
    item_id: int,
    payload: ContentInput,
    user: Annotated[User, Depends(require_content_editor)],
    db: Annotated[Session, Depends(get_db)],
):
    if payload.status != "draft" and user.role == "content_contributor":
        raise HTTPException(status_code=403, detail="Content contributors can only save drafts.")
    record = db.scalar(select(Content).where(Content.id == item_id, Content.kind == kind))
    if record is None:
        raise HTTPException(status_code=404, detail="Content was not found.")
    if user.role == "content_contributor" and record.status != "draft":
        raise HTTPException(status_code=403, detail="Content contributors can only edit drafts.")
    data = payload.model_dump()
    data["slug"] = make_slug(data["slug"] or data["title"])
    for key, value in data.items():
        setattr(record, key, value)
    try:
        log_action(db, user, "updated", kind, record.id)
        db.commit()
        db.refresh(record)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="That URL slug is already in use.") from exc
    return record


@router.delete("/content/{kind}/{item_id}", status_code=204)
def delete_content(
    kind: ContentKind,
    item_id: int,
    user: Annotated[User, Depends(require_content_editor)],
    db: Annotated[Session, Depends(get_db)],
):
    record = db.scalar(select(Content).where(Content.id == item_id, Content.kind == kind))
    if record is None:
        raise HTTPException(status_code=404, detail="Content was not found.")
    if user.role == "content_contributor":
        raise HTTPException(status_code=403, detail="Content contributors cannot delete content.")
    log_action(db, user, "deleted", kind, record.id)
    db.delete(record)
    db.commit()
    return Response(status_code=204)


@router.get("/submissions", response_model=list[SubmissionOutput])
def list_submissions(
    user: Annotated[User, Depends(require_applications_reviewer)],
    db: Annotated[Session, Depends(get_db)],
):
    return db.scalars(select(Submission).order_by(Submission.created_at.desc())).all()


@router.patch("/submissions/{submission_id}", response_model=SubmissionOutput)
def update_submission(
    submission_id: int,
    payload: SubmissionStatusInput,
    user: Annotated[User, Depends(require_applications_reviewer)],
    db: Annotated[Session, Depends(get_db)],
):
    submission = db.get(Submission, submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission was not found.")
    submission.status = payload.status
    log_action(db, user, "updated", "submission", submission.id)
    db.commit()
    db.refresh(submission)
    return submission
