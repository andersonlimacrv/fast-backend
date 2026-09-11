"""Unit tests: changelog → release notes extraction (filesystem only)."""

import pytest

from scripts.release_notes import extract_notes


@pytest.mark.unit
def test_extracts_matching_section(tmp_path) -> None:
    changelog = tmp_path / "CHANGELOG.md"
    changelog.write_text("# Changelog\n\n## [v1.1.0] — 2026-09-12\n\n- cool thing\n\n## [v1.0.0] — old\n\n- old\n")
    notes = extract_notes(changelog, "v1.1.0")
    assert "cool thing" in notes
    assert "old" not in notes


@pytest.mark.unit
def test_missing_section_fails(tmp_path) -> None:
    changelog = tmp_path / "CHANGELOG.md"
    changelog.write_text("# Changelog\n\n## [v1.0.0]\n\n- old\n")
    with pytest.raises(ValueError, match="no CHANGELOG section"):
        extract_notes(changelog, "v9.9.9")


@pytest.mark.unit
def test_empty_section_fails(tmp_path) -> None:
    changelog = tmp_path / "CHANGELOG.md"
    changelog.write_text("# Changelog\n\n## [v1.1.0]\n\n## [v1.0.0]\n\n- old\n")
    with pytest.raises(ValueError, match="empty CHANGELOG section"):
        extract_notes(changelog, "v1.1.0")
