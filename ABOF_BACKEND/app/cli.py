import argparse
import getpass

from pydantic import EmailStr, TypeAdapter, ValidationError
from sqlalchemy import select

from app.database import Base, SessionLocal, engine
from app.models import User
from app.security import hash_password


def create_admin(email: str, password: str):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        existing = db.scalar(select(User).where(User.email == email.lower()))
        if existing:
            raise SystemExit(f"An account for {email} already exists.")
        db.add(
            User(
                email=email.lower(),
                password_hash=hash_password(password),
                role="super_administrator",
            )
        )
        db.commit()
    print(f"Super administrator created for {email}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ABOF administration setup")
    parser.add_argument("--create-admin", action="store_true", help="Create the first admin user")
    parser.add_argument("--email", help="Admin email (prompted if omitted)")
    args = parser.parse_args()
    if not args.create_admin:
        parser.error("Choose --create-admin.")
    email = args.email or input("Administrator email: ").strip()
    try:
        email = str(TypeAdapter(EmailStr).validate_python(email)).lower()
    except ValidationError as exc:
        raise SystemExit("Enter a valid administrator email address.") from exc
    password = getpass.getpass("Administrator password (minimum 12 characters): ")
    if len(password) < 12:
        raise SystemExit("Password must contain at least 12 characters.")
    create_admin(email, password)
