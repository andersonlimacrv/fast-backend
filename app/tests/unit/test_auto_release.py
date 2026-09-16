"""Unit tests: auto-release pure functions (tmp files, no git/network)."""

import pytest

from scripts.auto_release import finalize_changelog, next_version, parse_version, sync_files


@pytest.mark.unit
def test_parse_version_accepts_both_prefix_styles() -> None:
    assert parse_version("v1.2.3") == (1, 2, 3)
    assert parse_version("0.1.0") == (0, 1, 0)
    assert parse_version("main") is None
    assert parse_version("v1.2") is None


@pytest.mark.unit
def test_next_version_bumps_patch_from_highest_tag() -> None:
    assert next_version(["0.1.0"]) == "0.1.1"
    assert next_version(["v1.2.3", "0.9.9", "not-a-version"]) == "1.2.4"
    assert next_version([], bump="minor") == "0.2.0"
    assert next_version(["v1.2.3"], bump="major") == "2.0.0"
    with pytest.raises(ValueError, match="unknown bump"):
        next_version(["v1.0.0"], bump="weekly")


@pytest.mark.unit
def test_finalize_consolidates_two_unreleased_sections() -> None:
    text = "# Log\n\n## [Unreleased]\n\n- aaa\n\n## [Unreleased] — Stuff\n\n- bbb\n\n## [0.1.0]\n\n- old\n"
    out = finalize_changelog(text, "0.1.1", "2026-09-15", "PR title")
    assert "## [v0.1.1] — 2026-09-15" in out
    assert "- aaa" in out and "- bbb" in out
    assert out.count("## [Unreleased]") == 1
    assert "## [0.1.0]\n\n- old" in out  # history untouched
    assert out.index("## [v0.1.1]") < out.index("## [Unreleased]") < out.index("## [0.1.0]")


@pytest.mark.unit
def test_finalize_falls_back_to_pr_title_when_empty() -> None:
    out = finalize_changelog("# Log\n\n## [Unreleased]\n", "0.1.1", "2026-09-15", "Cool PR")
    assert "- Cool PR" in out
    assert "## [v0.1.1]" in out


@pytest.mark.unit
def test_finalize_without_unreleased_inserts_before_first_section() -> None:
    out = finalize_changelog("# Log\n\n## [0.1.0]\n\n- old\n", "0.1.1", "2026-09-15", "Cool PR")
    assert "## [v0.1.1]" in out and "- Cool PR" in out


@pytest.mark.unit
def test_sync_files_updates_all_three(tmp_path) -> None:
    (tmp_path / "app" / "core").mkdir(parents=True)
    (tmp_path / "pyproject.toml").write_text('version = "0.1.0"\n', encoding="utf-8")
    (tmp_path / "app" / "core" / "settings.py").write_text('    app_version: str = "0.1.0"\n', encoding="utf-8")
    (tmp_path / ".env.example").write_text("APP_VERSION=0.1.0\n", encoding="utf-8")
    touched = sync_files(tmp_path, "0.1.1")
    assert len(touched) == 3
    assert 'version = "0.1.1"' in (tmp_path / "pyproject.toml").read_text(encoding="utf-8")
    assert 'app_version: str = "0.1.1"' in (tmp_path / "app" / "core" / "settings.py").read_text(encoding="utf-8")
    assert "APP_VERSION=0.1.1" in (tmp_path / ".env.example").read_text(encoding="utf-8")


@pytest.mark.unit
def test_sync_files_fails_loudly_on_missing_pattern(tmp_path) -> None:
    (tmp_path / "pyproject.toml").write_text("no version here\n", encoding="utf-8")
    (tmp_path / "app" / "core").mkdir(parents=True)
    (tmp_path / "app" / "core" / "settings.py").write_text("x = 1\n", encoding="utf-8")
    (tmp_path / ".env.example").write_text("A=1\n", encoding="utf-8")
    with pytest.raises(ValueError, match="pattern not found"):
        sync_files(tmp_path, "0.1.1")
