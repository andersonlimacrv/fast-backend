"""Integration: real SMTP delivery via Mailpit (slow, skipped without docker)."""

import shutil
import time

import httpx
import pytest

from app.core.settings import Settings
from app.infrastructure.email.sender import SmtpEmailSender
from app.tests.conftest import ServiceContainer, wait_tcp

MAILPIT_IMAGE = "axllent/mailpit:v1.21"


@pytest.fixture()
def mailpit():
    if shutil.which("docker") is None:
        pytest.skip("docker unavailable")
    container = ServiceContainer(MAILPIT_IMAGE, tcp_ports=[1025, 8025], name="mailpit")
    try:
        smtp_port, api_port = container.ports[1025], container.ports[8025]
        wait_tcp("localhost", smtp_port, timeout=60)
        yield {"smtp": ("localhost", smtp_port), "api": f"http://localhost:{api_port}"}
    finally:
        container.stop()


@pytest.mark.integration
@pytest.mark.slow
async def test_smtp_delivery_lands_in_mailpit(mailpit: dict) -> None:
    host, port = mailpit["smtp"]
    settings = Settings(
        secret_key="x" * 32,
        email_backend="smtp",
        smtp_host=host,
        smtp_port=port,
        smtp_from="no-reply@example.com",
    )
    sender = SmtpEmailSender(settings)
    await sender.send_template(
        to="user@example.com", subject="Welcome", template="welcome", context={"name": "Ada", "link": "https://x/c"}
    )

    deadline = time.time() + 30
    count = 0
    async with httpx.AsyncClient() as http:
        while time.time() < deadline:
            data = (await http.get(f"{mailpit['api']}/api/v1/messages")).json()
            count = data.get("total", 0)
            if count >= 1:
                break
            time.sleep(1)
    assert count == 1
