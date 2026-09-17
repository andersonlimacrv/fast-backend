"""Unit tests: release file sync tolerates a pruned `.env.example`."""

import pytest

from scripts.auto_release import sync_files


def _scaffold(root, *, example: str):
    (root / "pyproject.toml").write_text('[project]\nversion = "0.1.0"\n', encoding="utf-8")
    app_core = root / "app" / "core"
    app_core.mkdir(parents=True, exist_ok=True)
    (app_core / "settings.py").write_text('    app_version: str = "0.1.0"\n', encoding="utf-8")
    (root / ".env.example").write_text(example, encoding="utf-8")


@pytest.mark.unit
def test_sync_files_skips_missing_app_version_line(tmp_path) -> None:
    _scaffold(tmp_path, example="SECRET_KEY=x\n")
    touched = sync_files(tmp_path, "0.2.0")
    assert 'version = "0.2.0"' in (tmp_path / "pyproject.toml").read_text(encoding="utf-8")
    assert '"0.2.0"' in (tmp_path / "app" / "core" / "settings.py").read_text(encoding="utf-8")
    assert "APP_VERSION" not in (tmp_path / ".env.example").read_text(encoding="utf-8")
    assert all(".env.example" not in t for t in touched)


@pytest.mark.unit
def test_sync_files_updates_app_version_line_when_present(tmp_path) -> None:
    _scaffold(tmp_path, example="SECRET_KEY=x\nAPP_VERSION=0.1.0\n")
    touched = sync_files(tmp_path, "0.2.0")
    assert "APP_VERSION=0.2.0" in (tmp_path / ".env.example").read_text(encoding="utf-8")
    assert any(".env.example" in t for t in touched)
