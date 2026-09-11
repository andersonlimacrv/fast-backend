"""Integration: real SMTP delivery via Mailpit (slow, skipped without docker)."""

import shutil
import socket
import subprocess
import time

import httpx
import pytest

from app.core.settings import Settings
from app.infrastructure.email.sender import SmtpEmailSender

MAILPIT_IMAGE = "axllent/mailpit:v1.21"


def _docker_available() -> bool:
    return shutil.which("docker") is not None


def _wait_smtp(host: str, port: int, timeout: int = 60) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=2):
                return
        except OSError:
            time.sleep(1)
    raise RuntimeError("mailpit smtp not ready")


@pytest.fixture()
def mailpit():
    if not _docker_available():
        pytest.skip("docker unavailable")
    subprocess.run(
        ["docker", "run", "-d", "--rm", "--network", "host", "--name", "fb-test-mailpit", MAILPIT_IMAGE],
        check=True,
        capture_output=True,
    )
    try:
        _wait_smtp("localhost", 1025)
        yield {"smtp": ("localhost", 1025), "api": "http://localhost:8025"}
    finally:
        subprocess.run(["docker", "rm", "-f", "fb-test-mailpit"], capture_output=True)


@pytest.mark.integration
@pytest.mark.slow
async def test_smtp_delivery_lands_in_mailpit(mailpit: dict) -> None:
    settings = Settings(
        secret_key="x" * 32,
        email_backend="smtp",
        smtp_host="localhost",
        smtp_port=1025,
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
            data = (await http.get("http://localhost:8025/api/v1/messages")).json()
            count = data.get("total", 0)
            if count >= 1:
                break
            time.sleep(1)
    assert count == 1
