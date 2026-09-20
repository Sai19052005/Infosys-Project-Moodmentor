"""
Transparent column-level encryption using Fernet (AES-128-CBC + HMAC-SHA256).

Usage:
    from app.services.encryption import EncryptedText

    class MyModel(Base):
        secret = Column(EncryptedText, nullable=True)

The encryption key is read from DB_ENCRYPTION_KEY in the environment.
If the key is missing and the app is in development mode, it auto-generates
one, prints it, and exits with instructions to add it to .env.
"""

import os
import base64
import logging
from cryptography.fernet import Fernet, InvalidToken
from sqlalchemy import String, Text
from sqlalchemy.types import TypeDecorator

logger = logging.getLogger(__name__)

_fernet: Fernet | None = None


def _get_fernet() -> Fernet:
    global _fernet
    if _fernet is not None:
        return _fernet

    key = os.getenv("DB_ENCRYPTION_KEY", "").strip()
    if not key:
        # Auto-generate in dev so the developer knows what to do
        new_key = Fernet.generate_key().decode()
        raise RuntimeError(
            f"\n\n"
            f"  DB_ENCRYPTION_KEY is not set in your .env file.\n"
            f"  Add this line to Backend/.env and restart:\n\n"
            f"    DB_ENCRYPTION_KEY={new_key}\n\n"
            f"  Keep this key safe — losing it means losing access to all encrypted data.\n"
        )

    try:
        _fernet = Fernet(key.encode())
    except Exception:
        raise RuntimeError(
            "DB_ENCRYPTION_KEY is invalid. Generate a valid key with:\n"
            "  python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
        )
    return _fernet


def encrypt(value: str) -> str:
    """Encrypt a string. Returns a base64-encoded ciphertext string."""
    return _get_fernet().encrypt(value.encode("utf-8")).decode("ascii")


def decrypt(token: str) -> str:
    """Decrypt a Fernet token. Returns the original plaintext string."""
    try:
        return _get_fernet().decrypt(token.encode("ascii")).decode("utf-8")
    except InvalidToken:
        logger.error("Decryption failed — possible key rotation or data corruption")
        raise ValueError("Decryption failed")


def is_encrypted(value: str) -> bool:
    """Heuristic: Fernet tokens start with 'gAAAAA' (base64 of the version byte 0x80)."""
    return isinstance(value, str) and value.startswith("gAAAAA")


class EncryptedText(TypeDecorator):
    """
    SQLAlchemy column type that transparently encrypts/decrypts text values.

    Store as TEXT in the database. On write the plaintext is encrypted;
    on read the ciphertext is decrypted. NULL values pass through unchanged.
    """

    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        """Called when writing to the database."""
        if value is None:
            return None
        if isinstance(value, str) and is_encrypted(value):
            # Already encrypted (idempotent — avoids double-encryption on update)
            return value
        return encrypt(str(value))

    def process_result_value(self, value, dialect):
        """Called when reading from the database."""
        if value is None:
            return None
        if is_encrypted(value):
            try:
                return decrypt(value)
            except ValueError:
                # Corrupt or unencrypted legacy data — return as-is so the app doesn't crash
                logger.warning("Could not decrypt value; returning raw (migration needed?)")
                return value
        # Plain-text value (pre-migration data) — return as-is
        return value
