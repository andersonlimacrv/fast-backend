"""Unit tests: port assignments for Make (tmp files, never the real .env)."""

import shutil
import subprocess
from pathlib import Path

import pytest

from scripts.env_ports import main, resolve

REPO_ROOT = Path(__file__).resolve().parents[3]


def _write(path, text: str):
    path.write_text(text, encoding="utf-8")
    return path


@pytest.mark.unit
def test_resolve_prefers_env_over_example_over_defaults(tmp_path) -> None:
    env = _write(tmp_path / ".env", "WEB_PORT=3002\n")
    example = _write(tmp_path / ".env.example", "WEB_PORT=3001\nAPI_PORT=8001\n")
    resolved = resolve(env, example)
    assert resolved["WEB_PORT"] == 3002
    assert resolved["API_PORT"] == 8001
    assert resolved["POSTGRES_PORT"] == 5401
    assert resolved["REDIS_PORT"] == 6401


@pytest.mark.unit
def test_resolve_rejects_invalid_port(tmp_path) -> None:
    env = _write(tmp_path / ".env", "API_PORT=many\n")
    with pytest.raises(SystemExit):
        resolve(env, tmp_path / ".env.example")


@pytest.mark.unit
def test_make_output_skips_environ_overrides(tmp_path, monkeypatch, capsys) -> None:
    env = _write(tmp_path / ".env", "WEB_PORT=3002\nAPI_PORT=8002\n")
    monkeypatch.setenv("API_PORT", "9000")
    assert main(["--env-file", str(env), "--example", str(tmp_path / ".env.example"), "--make"]) == 0
    out = capsys.readouterr().out
    assert "WEB_PORT=3002" in out
    assert "API_PORT=" not in out  # CLI/env override wins; Make ?= keeps it
    # Semicolon-separated transport: Make $(shell) folds newlines into spaces,
    # so plain lines would collapse into one value. The Makefile splits on `;`.
    assert ";" in out
    assert "\n" not in out


@pytest.mark.unit
def test_makefile_eval_keeps_ports_clean(tmp_path) -> None:
    """Regression: `$(eval $(ENV_PORTS))` used to leave WEB_PORT=3002;API_PORT=..."""
    make = shutil.which("make")
    if make is None or shutil.which("bash") is None:
        pytest.skip("GNU make + bash required for the Makefile regression test")
    env = _write(
        tmp_path / ".env",
        "WEB_PORT=3002\nAPI_PORT=8002\nPOSTGRES_PORT=5402\nREDIS_PORT=6402\n",
    )
    result = subprocess.run(
        [make, "-f", str(REPO_ROOT / "Makefile"), "-n", "dev", f"ENV_FILE={env}"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert result.returncode == 0, result.stderr
    # `-n` prints the recipes without executing Docker/Vite.
    assert "cd client && npm run dev -- --port 3002 --strictPort" in result.stdout
    assert "http://localhost:3002 |" in result.stdout
    assert "http://127.0.0.1:8002/docs" in result.stdout
    assert "3002;API_PORT" not in result.stdout
