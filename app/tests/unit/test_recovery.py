"""Unit tests: recovery helpers are hash-only + renderer strict (no DB)."""

import pytest
from jinja2 import UndefinedError

from app.infrastructure.auth.password_resets import hash_reset_token, new_reset_token
from app.infrastructure.email.renderer import EmailRenderer


@pytest.mark.unit
def test_reset_tokens_unique_and_hash_only() -> None:
    first, second = new_reset_token(), new_reset_token()
    assert first != second
    assert hash_reset_token(first) != first
    assert len(hash_reset_token(first)) == 64


@pytest.mark.unit
def test_password_reset_template_renders_and_strict() -> None:
    renderer = EmailRenderer()
    html, text = renderer.render("password_reset", {"name": "Ada", "link": "https://app.example.com/reset?token=x"})
    assert "https://app.example.com/reset?token=x" in html
    assert "https://app.example.com/reset?token=x" in text
    with pytest.raises(UndefinedError):
        renderer.render("password_reset", {"name": "Ada"})


@pytest.mark.unit
def test_unknown_template_rejected() -> None:
    with pytest.raises(ValueError):
        EmailRenderer().render("nope", {})
