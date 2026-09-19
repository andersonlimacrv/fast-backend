"""Unit tests: email rendering (no SMTP)."""

import pytest

from app.core.settings import Settings
from app.infrastructure.email.sender import LogEmailSender, SmtpEmailSender


@pytest.fixture()
def sender() -> SmtpEmailSender:
    return SmtpEmailSender(Settings(secret_key="x" * 32, frontend_url="https://app.example.com"))


@pytest.mark.unit
def test_welcome_renders_name_and_link(sender: SmtpEmailSender) -> None:
    html, text = sender.render("welcome", {"name": "Ada", "link": "https://x.example/c"})
    assert "Ada" in html and "https://x.example/c" in html
    assert "Ada" in text and "https://x.example/c" in text


@pytest.mark.unit
def test_missing_variable_fails_loudly(sender: SmtpEmailSender) -> None:
    import jinja2

    with pytest.raises(jinja2.UndefinedError):
        sender.render("welcome", {"name": "Ada"})


@pytest.mark.unit
def test_unknown_template_fails(sender: SmtpEmailSender) -> None:
    with pytest.raises(ValueError, match="unknown email template"):
        sender.render("nope", {})


@pytest.mark.unit
async def test_log_sender_never_delivers() -> None:
    await LogEmailSender().send(to="a@b.com", subject="s", html="<p>x</p>")
