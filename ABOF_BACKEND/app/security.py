import base64
import hashlib
import hmac
import json
import secrets
import time

from app.config import settings

TOKEN_LIFETIME_SECONDS = 60 * 60 * 8


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        scheme, salt_hex, digest_hex = stored_hash.split("$")
        if scheme != "scrypt":
            return False
        expected = bytes.fromhex(digest_hex)
        actual = hashlib.scrypt(
            password.encode(), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1
        )
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def create_token(user_id: int) -> str:
    payload = json.dumps(
        {"sub": user_id, "exp": int(time.time()) + TOKEN_LIFETIME_SECONDS},
        separators=(",", ":"),
    ).encode()
    encoded = base64.urlsafe_b64encode(payload).rstrip(b"=")
    signature = hmac.new(settings.secret_key.encode(), encoded, hashlib.sha256).digest()
    return encoded.decode() + "." + base64.urlsafe_b64encode(signature).rstrip(b"=").decode()


def read_token(token: str) -> int | None:
    try:
        encoded, signature = token.split(".", 1)
        expected = hmac.new(
            settings.secret_key.encode(), encoded.encode(), hashlib.sha256
        ).digest()
        padded_signature = signature + "=" * (-len(signature) % 4)
        supplied = base64.urlsafe_b64decode(padded_signature)
        if not hmac.compare_digest(expected, supplied):
            return None
        padded_payload = encoded + "=" * (-len(encoded) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded_payload))
        if payload["exp"] <= int(time.time()):
            return None
        return int(payload["sub"])
    except (ValueError, KeyError, TypeError, json.JSONDecodeError):
        return None
