"""Unit tests: template bootstrap (filesystem only)."""

import shutil
import subprocess
from pathlib import Path

import pytest

from scripts.new_project import apply_slot, new_project, validate


@pytest.mark.unit
def test_bootstrap_tree(tmp_path: Path) -> None:
    source = Path(__file__).resolve().parents[3]
    dest = tmp_path / "my-saas"
    new_project("my-saas", dest, source=source)
    assert validate(dest) == []

    text = (dest / "pyproject.toml").read_text()
    assert 'name = "my-saas"' in text
    readme = (dest / "README.md").read_text()
    # Brand header is a banner (no H1): fork carries the new name in the alt.
    assert readme.startswith("<p align=")
    assert 'alt="my-saas' in readme
    assert (dest / "app" / "main.py").exists()
    assert (dest / "Dockerfile").exists()

    if shutil.which("ruff"):
        proc = subprocess.run(["ruff", "check", "app"], cwd=dest, capture_output=True)
        assert proc.returncode == 0, proc.stdout.decode() + proc.stderr.decode()


@pytest.mark.unit
def test_bootstrap_rejects_bad_name_and_nonempty(tmp_path: Path) -> None:
    source = Path(__file__).resolve().parents[3]
    with pytest.raises(ValueError):
        new_project("Bad Name!", tmp_path / "x", source=source)
    occupied = tmp_path / "occ"
    occupied.mkdir()
    (occupied / "f.txt").write_text("x")
    with pytest.raises(ValueError):
        new_project("ok-name", occupied, source=source)


@pytest.mark.unit
def test_apply_slot_rewrites_ports(tmp_path: Path) -> None:
    root = tmp_path / ".env.example"
    root.write_text(
        "WEB_PORT=3001\nAPI_PORT=8001\nPOSTGRES_PORT=5401\nREDIS_PORT=6401\n"
        "DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5401/fastbackend\n"
        "REDIS_URL=redis://localhost:6401/0\n"
        'CORS_ORIGINS=["http://localhost:3001", "http://127.0.0.1:3001"]\n'
        "FRONTEND_URL=http://localhost:3001\n",
        encoding="utf-8",
    )
    client = tmp_path / "client"
    client.mkdir()
    (client / ".env.example").write_text("VITE_API_URL=http://localhost:8001\n", encoding="utf-8")
    apply_slot(tmp_path, 2)
    text = root.read_text(encoding="utf-8")
    for want in (
        "WEB_PORT=3002",
        "API_PORT=8002",
        "POSTGRES_PORT=5402",
        "REDIS_PORT=6402",
        "localhost:5402",
        "localhost:6402",
        "localhost:3002",
        "127.0.0.1:3002",
    ):
        assert want in text
    for gone in ("3001", "8001", "5401", "6401"):
        assert gone not in text
    assert "localhost:8002" in (client / ".env.example").read_text(encoding="utf-8")


@pytest.mark.unit
def test_apply_slot_rejects_out_of_range(tmp_path: Path) -> None:
    with pytest.raises(ValueError):
        apply_slot(tmp_path, 0)
    with pytest.raises(ValueError):
        apply_slot(tmp_path, 100)
