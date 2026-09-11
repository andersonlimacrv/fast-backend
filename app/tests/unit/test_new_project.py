"""Unit tests: template bootstrap (filesystem only)."""

import shutil
import subprocess
from pathlib import Path

import pytest

from scripts.new_project import new_project, validate


@pytest.mark.unit
def test_bootstrap_tree(tmp_path: Path) -> None:
    source = Path(__file__).resolve().parents[3]
    dest = tmp_path / "my-saas"
    new_project("my-saas", dest, source=source)
    assert validate(dest) == []

    text = (dest / "pyproject.toml").read_text()
    assert 'name = "my-saas"' in text
    assert (dest / "README.md").read_text().startswith("# my-saas")
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
