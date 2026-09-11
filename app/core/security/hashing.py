"""Password-hasher port. Infrastructure provides the concrete hasher."""

from typing import Protocol


class PasswordHasher(Protocol):
    def hash(self, password: str) -> str:
        """Hash a plaintext password. Never returns the input."""
        ...

    def verify(self, password: str, password_hash: str) -> bool:
        """Constant-time verification against a stored hash (any supported scheme)."""
        ...

    def verify_and_update(self, password: str, password_hash: str) -> tuple[bool, str | None]:
        """Verify; return (valid, new_hash_or_None). New hash set when the stored
        scheme is legacy and should migrate transparently on next login."""
        ...
