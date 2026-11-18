import time
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Content, Submission
from app.schemas import ContentKind, ContentOutput, SubmissionInput

router = APIRouter(prefix="/api/public", tags=["public website"])
_request_times: dict[str, list[float]] = {}


@router.get("/content/{kind}", response_model=list[ContentOutput])
def list_public_content(kind: ContentKind, db: Annotated[Session, Depends(get_db)]):
    return db.scalars(
        select(Content)
        .where(Content.kind == kind, Content.status == "published")
        .order_by(Content.sort_order, Content.created_at.desc())
    ).all()


@router.get("/content/{kind}/{slug}", response_model=ContentOutput)
def get_public_content(kind: ContentKind, slug: str, db: Annotated[Session, Depends(get_db)]):
    record = db.scalar(
        select(Content).where(
            Content.kind == kind, Content.slug == slug, Content.status == "published"
        )
    )
    if record is None:
        raise HTTPException(status_code=404, detail="This page could not be found.")
    return record


@router.post("/submissions", status_code=201)
def create_submission(
    payload: SubmissionInput,
    request: Request,
    db: Annotated[Session, Depends(get_db)],
):
    if payload.website:
        return {"message": "Thank you. Your message has been received."}

    now = time.monotonic()
    ip = request.client.host if request.client else "unknown"
    recent = [at for at in _request_times.get(ip, []) if now - at < 600]
    if len(recent) >= 5:
        raise HTTPException(status_code=429, detail="Please wait before sending another message.")
    recent.append(now)
    if len(_request_times) > 10000:
        _request_times.clear()
    _request_times[ip] = recent

    submission = Submission(
        kind=payload.kind,
        name=payload.name.strip(),
        email=str(payload.email).lower(),
        phone=payload.phone.strip(),
        message=payload.message.strip(),
    )
    db.add(submission)
    db.commit()
    return {"message": "Thank you. Your message has been received."}
