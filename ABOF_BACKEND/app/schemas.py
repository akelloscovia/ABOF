from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

ContentKind = Literal["programmes", "projects", "news", "events", "leadership", "impact", "publications", "gallery"]
ContentStatus = Literal["draft", "published", "archived"]
SubmissionKind = Literal["contact", "volunteer", "partnership"]
SubmissionStatus = Literal["new", "reviewing", "contacted", "closed"]


class LoginInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class UserOutput(BaseModel):
    id: int
    email: EmailStr
    role: str

    model_config = ConfigDict(from_attributes=True)


class AdminUserOutput(UserOutput):
    active: bool
    created_at: datetime


class AdminUserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=200)
    role: Literal[
        "super_administrator",
        "administrator",
        "editor",
        "content_contributor",
        "applications_reviewer",
    ]


class AdminUserUpdate(BaseModel):
    role: Literal[
        "super_administrator",
        "administrator",
        "editor",
        "content_contributor",
        "applications_reviewer",
    ] | None = None
    active: bool | None = None


class ContentInput(BaseModel):
    slug: str | None = Field(default=None, max_length=180)
    title: str = Field(min_length=1, max_length=180)
    summary: str = Field(default="", max_length=500)
    body: str = Field(default="", max_length=30000)
    category: str = Field(default="", max_length=100)
    image_url: str = Field(default="", max_length=1000)
    image_alt: str = Field(default="", max_length=250)
    status: ContentStatus = "draft"
    sort_order: int = Field(default=0, ge=0, le=10000)
    event_date: str = Field(default="", max_length=40)


class ContentOutput(ContentInput):
    id: int
    kind: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubmissionInput(BaseModel):
    kind: SubmissionKind
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str = Field(default="", max_length=40)
    message: str = Field(min_length=10, max_length=4000)
    website: str = Field(default="", max_length=200)


class SubmissionStatusInput(BaseModel):
    status: SubmissionStatus


class SubmissionOutput(BaseModel):
    id: int
    kind: str
    name: str
    email: EmailStr
    phone: str
    message: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
