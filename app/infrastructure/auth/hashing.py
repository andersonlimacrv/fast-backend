"""Password hashing: Argon2id default (pwdlib), bcrypt verify-only for migration.

Implements the `PasswordHasher` port from `app.core.security.hashing`.
"""

import base64
import hashlib

import bcrypt
from pwdlib import PasswordHash

from app.core.settings import Settings

_BCRYPT_PREFIXES = ("$2a$", "$2b$", "$2x$", "$2y$")


def _bcrypt_candidates(password: str) -> list[bytes]:
    """Plain bcrypt first; crudauth-style SHA-256 pre-hash fallback for legacy
    passwords longer than bcrypt's 72-byte limit."""
    raw = password.encode()
    if len(raw) <= 72:
        return [raw]
    prehashed = base64.b64encode(hashlib.sha256(raw).digest())
    return [raw, prehashed]


def _bcrypt_verify(password: str, password_hash: str) -> bool:
    encoded = password_hash.encode()
    for candidate in _bcrypt_candidates(password):
        try:
            if bcrypt.checkpw(candidate, encoded):
                return True
        except ValueError:
            continue
    return False


class PwdlibHasher:
    """Argon2id hasher with transparent bcrypt-legacy migration on verify."""

    def __init__(self, settings: Settings) -> None:
        self._ph = PasswordHash.recommended()
        self._settings = settings

    def hash(self, password: str) -> str:
        return str(self._ph.hash(password))

    def verify(self, password: str, password_hash: str) -> bool:
        if password_hash.startswith(_BCRYPT_PREFIXES):
            return _bcrypt_verify(password, password_hash)
        return bool(self._ph.verify(password, password_hash))

    def verify_and_update(self, password: str, password_hash: str) -> tuple[bool, str | None]:
        """Verify any supported scheme; return a fresh Argon2id hash when the
        stored one is legacy bcrypt so the caller can migrate it."""
        if password_hash.startswith(_BCRYPT_PREFIXES):
            if _bcrypt_verify(password, password_hash):
                return True, self.hash(password)
            return False, None
        valid = bool(self._ph.verify(password, password_hash))
        if not valid:
            return False, None
        updated = self._ph.verify_and_update(password, password_hash)
        new_hash = updated[1] if isinstance(updated, tuple) else None
        return True, str(new_hash) if new_hash else None
