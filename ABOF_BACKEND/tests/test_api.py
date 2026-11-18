import os
from pathlib import Path

os.environ["ABOF_DATABASE_URL"] = "sqlite://"
os.environ["ABOF_SECRET_KEY"] = "test-key-not-used-outside-tests"

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import settings
from app.database import Base, get_db
from app.main import app
from app.models import User
from app.security import hash_password

test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSession = sessionmaker(bind=test_engine, autoflush=False, expire_on_commit=False)


def override_db():
    with TestSession() as db:
        yield db


def setup_function():
    Base.metadata.drop_all(test_engine)
    Base.metadata.create_all(test_engine)
    with TestSession() as db:
        db.add(
            User(
                email="admin@example.org",
                password_hash=hash_password("correct-horse-battery"),
                role="super_administrator",
            )
        )
        db.commit()


app.dependency_overrides[get_db] = override_db
client = TestClient(app)


def test_draft_content_is_private_until_published():
    token = client.post(
        "/api/auth/login",
        json={"email": "admin@example.org", "password": "correct-horse-battery"},
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/api/admin/content/programmes",
        headers=headers,
        json={"title": "Skills Lab", "status": "draft"},
    )
    assert response.status_code == 201
    assert client.get("/api/public/content/programmes").json() == []

    item = response.json()
    item["status"] = "published"
    updated = client.patch(
        f"/api/admin/content/programmes/{item['id']}", headers=headers, json=item
    )
    assert updated.status_code == 200
    assert client.get("/api/public/content/programmes").json()[0]["slug"] == "skills-lab"


def test_admin_content_requires_authentication():
    response = client.post(
        "/api/admin/content/news", json={"title": "Draft", "status": "published"}
    )
    assert response.status_code == 401


def test_content_contributor_cannot_publish():
    with TestSession() as db:
        db.add(
            User(
                email="writer@example.org",
                password_hash=hash_password("correct-horse-battery"),
                role="content_contributor",
            )
        )
        db.commit()
    token = client.post(
        "/api/auth/login",
        json={"email": "writer@example.org", "password": "correct-horse-battery"},
    ).json()["access_token"]
    response = client.post(
        "/api/admin/content/news",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "A story", "status": "published"},
    )
    assert response.status_code == 403


def test_super_admin_can_manage_users_without_disabling_last_super_admin():
    token = client.post(
        "/api/auth/login",
        json={"email": "admin@example.org", "password": "correct-horse-battery"},
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    created = client.post(
        "/api/admin/users",
        headers=headers,
        json={
            "email": "editor@example.org",
            "password": "a-long-team-password",
            "role": "editor",
        },
    )
    assert created.status_code == 201
    assert "password_hash" not in created.json()

    last_admin = client.patch(
        f"/api/admin/users/{created.json()['id']}",
        headers=headers,
        json={"active": False},
    )
    assert last_admin.status_code == 200
    protected_admin = client.patch(
        f"/api/admin/users/{client.get('/api/admin/users', headers=headers).json()[0]['id']}",
        headers=headers,
        json={"active": False},
    )
    assert protected_admin.status_code == 409


def test_content_contributor_cannot_edit_published_records():
    admin_token = client.post(
        "/api/auth/login",
        json={"email": "admin@example.org", "password": "correct-horse-battery"},
    ).json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    record = client.post(
        "/api/admin/content/news",
        headers=admin_headers,
        json={"title": "Public story", "status": "published"},
    ).json()
    with TestSession() as db:
        db.add(
            User(
                email="writer@example.org",
                password_hash=hash_password("correct-horse-battery"),
                role="content_contributor",
            )
        )
        db.commit()
    writer_token = client.post(
        "/api/auth/login",
        json={"email": "writer@example.org", "password": "correct-horse-battery"},
    ).json()["access_token"]
    response = client.patch(
        f"/api/admin/content/news/{record['id']}",
        headers={"Authorization": f"Bearer {writer_token}"},
        json={**record, "status": "draft"},
    )
    assert response.status_code == 403


def test_contact_form_rejects_short_messages_and_accepts_valid_input():
    invalid = client.post(
        "/api/public/submissions",
        json={"kind": "contact", "name": "Ada", "email": "ada@example.org", "message": "Hi"},
    )
    assert invalid.status_code == 422
    valid = client.post(
        "/api/public/submissions",
        json={
            "kind": "contact",
            "name": "Ada Lovelace",
            "email": "ada@example.org",
            "message": "I would like to learn more about the foundation.",
        },
    )
    assert valid.status_code == 201


def test_admin_image_upload_checks_file_type_and_stores_randomized_name(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "upload_dir", tmp_path)
    token = client.post(
        "/api/auth/login",
        json={"email": "admin@example.org", "password": "correct-horse-battery"},
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    uploaded = client.post(
        "/api/admin/media",
        headers=headers,
        files={"file": ("team.jpg", b"\xff\xd8\xff sample image", "image/jpeg")},
    )
    assert uploaded.status_code == 201
    result = uploaded.json()
    assert result["url"].startswith("/media/")
    stored_name = result["url"].rsplit("/", 1)[-1]
    assert Path(tmp_path, stored_name).read_bytes() == b"\xff\xd8\xff sample image"
    assert stored_name != "team.jpg"

    unsupported = client.post(
        "/api/admin/media",
        headers=headers,
        files={"file": ("image.svg", b"<svg/>", "image/svg+xml")},
    )
    assert unsupported.status_code == 415
