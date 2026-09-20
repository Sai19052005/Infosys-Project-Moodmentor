# ══════════════════════════════════════════════════════════════
# FILE: backend/app/services/auth_service.py
# Password hashing (bcrypt) + JWT tokens with revocation support
# ══════════════════════════════════════════════════════════════

import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import HTTPException
from jose import jwt, JWTError

from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    if not hashed or len(plain.encode("utf-8")) > 72:
        return False
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "jti": str(uuid.uuid4()),   # unique token ID — used for revocation
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str, db=None) -> int:
    """Return the user_id from a valid token, else raise 401.

    Pass `db` (SQLAlchemy Session) to also check the revocation blocklist.
    Without `db` the blocklist check is skipped (used in tests / lightweight paths).
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
        jti = payload.get("jti")
    except (JWTError, KeyError, ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if db is not None and jti:
        from app.models import TokenBlocklist
        if db.query(TokenBlocklist).filter(TokenBlocklist.jti == jti).first():
            raise HTTPException(status_code=401, detail="Token has been revoked. Please log in again.")

    return user_id


def revoke_token(token: str, db) -> None:
    """Add a token's jti to the blocklist (used on logout / account deletion)."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        jti = payload.get("jti")
        exp = payload.get("exp")
        user_id = int(payload["sub"])
    except Exception:
        return  # Token is already invalid — nothing to revoke

    if not jti:
        return

    from app.models import TokenBlocklist
    expires_at = datetime.fromtimestamp(exp, tz=timezone.utc) if exp else datetime.now(timezone.utc)
    entry = TokenBlocklist(jti=jti, user_id=user_id, expires_at=expires_at)
    db.merge(entry)   # merge = upsert; safe if called twice
    db.commit()

