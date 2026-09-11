"""Unit tests: hashing (no external services)."""

import base64
import hashlib

import bcrypt
import pytest

from app.core.settings import Settings
from app.infrastructure.auth.hashing import PwdlibHasher


@pytest.fixture()
def hasher() -> PwdlibHasher:
    return PwdlibHasher(Settings(secret_key="x" * 32))


@pytest.mark.unit
def test_new_hash_is_argon2id(hasher: PwdlibHasher) -> None:
    assert hasher.hash("Str0ng!Pass").startswith("$argon2id$")


@pytest.mark.unit
def test_verify_roundtrip_and_wrong_password(hasher: PwdlibHasher) -> None:
    digest = hasher.hash("Str0ng!Pass")
    assert hasher.verify("Str0ng!Pass", digest) is True
    assert hasher.verify("Wrong!Pass1", digest) is False


@pytest.mark.unit
def test_bcrypt_legacy_verifies_and_migrates(hasher: PwdlibHasher) -> None:
    legacy = bcrypt.hashpw(b"legacypass", bcrypt.gensalt()).decode()
    valid, new_hash = hasher.verify_and_update("legacypass", legacy)
    assert valid is True
    assert new_hash is not None and new_hash.startswith("$argon2id$")
    assert hasher.verify("legacypass", legacy) is True
    assert hasher.verify("other-pass", legacy) is False


@pytest.mark.unit
def test_bcrypt_legacy_long_password_crudauth_style(hasher: PwdlibHasher) -> None:
    """Passwords >72 bytes hashed crudauth-style (SHA-256 pre-hash) verify."""
    long_pw = "x" * 100
    prehashed = base64.b64encode(hashlib.sha256(long_pw.encode()).digest())
    legacy = bcrypt.hashpw(prehashed, bcrypt.gensalt()).decode()
    valid, new_hash = hasher.verify_and_update(long_pw, legacy)
    assert valid is True
    assert new_hash is not None and new_hash.startswith("$argon2id$")
