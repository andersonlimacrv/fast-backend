"""Unit tests: port assignments for Make (tmp files, never the real .env)."""

import pytest

from scripts.env_ports import main, resolve


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
