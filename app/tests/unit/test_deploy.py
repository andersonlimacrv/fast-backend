"""Unit tests: deploy decision logic (no SSH, no docker)."""

import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

import pytest

from scripts.deploy import image_for, ready_state, rollback_target, should_rollback


@pytest.mark.unit
def test_image_for_validates() -> None:
    assert image_for("ghcr.io/org/app", "ABCDEF1") == "ghcr.io/org/app:abcdef1"
    with pytest.raises(ValueError):
        image_for("not-a-repo", "abcdef1")
    with pytest.raises(ValueError):
        image_for("ghcr.io/org/app", "xyz")
    with pytest.raises(ValueError):
        image_for("ghcr.io/org/app", "abc")


@pytest.mark.unit
def test_should_rollback_gate() -> None:
    assert should_rollback(["ready", "down"]) is False
    assert should_rollback(["degraded", "down"]) is True
    assert should_rollback([]) is True
    assert should_rollback(["down", "ready", "ready"], required_ready=2) is False


@pytest.mark.unit
def test_rollback_target_skips_failed() -> None:
    assert rollback_target(["aaa1111", "bbb2222", "ccc3333"], "ccc3333") == "bbb2222"
    assert rollback_target(["aaa1111"], "aaa1111") is None
    assert rollback_target([], "aaa1111") is None


@pytest.mark.unit
def test_ready_state_probe() -> None:
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self) -> None:
            body = b'{"status": "ready"}' if self.path == "/ok" else b'{"status": "x"}'
            code = 200 if self.path in ("/ok", "/bad") else 503
            self.send_response(code)
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, *args: object) -> None:
            pass

    server = HTTPServer(("127.0.0.1", 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}"
    try:
        assert ready_state(f"{base}/ok") == "ready"
        assert ready_state(f"{base}/bad") == "degraded"
        assert ready_state(f"{base}/nope") == "down"
        assert ready_state("http://127.0.0.1:1/") == "down"
    finally:
        server.shutdown()
