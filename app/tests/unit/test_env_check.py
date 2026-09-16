"""Unit tests: env drift report (tmp files, never touches the real .env)."""

import pytest

from scripts.env_check import check_env, main, parse_env

SECRET = "s3cr3t"  # short on purpose: invalid AND must never be echoed


def _write(path, text: str):
    path.write_text(text, encoding="utf-8")
    return path


@pytest.mark.unit
def test_parse_skips_comments_blanks_and_garbage(tmp_path) -> None:
    env, skipped = parse_env(_write(tmp_path / ".env", "# comment\n\nKEY=value\nstrange line\n123bad=x\n"))
    assert env == {"KEY": "value"}
    assert skipped == 4


@pytest.mark.unit
def test_clean_pair_exits_zero(tmp_path) -> None:
    example = _write(tmp_path / ".env.example", "SECRET_KEY=x\nTENANCY_MODE=single\n")
    env = _write(tmp_path / ".env", "SECRET_KEY=" + "y" * 40 + "\nTENANCY_MODE=row\n")
    code, report = check_env(env, example)
    assert code == 0
    assert "Result: OK" in report


@pytest.mark.unit
def test_missing_keys_listed_exactly(tmp_path) -> None:
    example = _write(tmp_path / ".env.example", "KEEP=1\nAPP_VERSION=0.1.0\nBOOTSTRAP_KEY=\n")
    env = _write(tmp_path / ".env", "KEEP=1\n")
    code, report = check_env(env, example)
    assert code == 1
    assert "APP_VERSION" in report and "BOOTSTRAP_KEY" in report


@pytest.mark.unit
def test_invalid_values_named_without_echo(tmp_path, capsys) -> None:
    example = _write(tmp_path / ".env.example", "SECRET_KEY=x\nTENANCY_MODE=x\nLOGIN_MAX_ATTEMPTS=x\n")
    env = _write(
        tmp_path / ".env",
        f"SECRET_KEY={SECRET}\nTENANCY_MODE=schema\nLOGIN_MAX_ATTEMPTS=many\n",
    )
    code, report = check_env(env, example)
    assert code == 1
    assert "SECRET_KEY" in report and "TENANCY_MODE" in report and "LOGIN_MAX_ATTEMPTS" in report
    assert SECRET not in report
    assert SECRET not in capsys.readouterr().out


@pytest.mark.unit
def test_main_never_prints_values(tmp_path, capsys, monkeypatch) -> None:
    _write(tmp_path / ".env.example", "SECRET_KEY=x\n")
    _write(tmp_path / ".env", f"SECRET_KEY={SECRET}\n")
    monkeypatch.chdir(tmp_path)
    assert main(["--env-file", ".env", "--example", ".env.example"]) == 1
    assert SECRET not in capsys.readouterr().out


@pytest.mark.unit
def test_missing_file_exits_two(tmp_path) -> None:
    code, report = check_env(tmp_path / ".env", tmp_path / ".env.example")
    assert code == 2
    assert "not found" in report


@pytest.mark.unit
def test_extra_keys_warn_without_failing(tmp_path) -> None:
    example = _write(tmp_path / ".env.example", "KEEP=1\n")
    env = _write(tmp_path / ".env", "KEEP=1\nMY_EXPERIMENT=1\n")
    code, report = check_env(env, example)
    assert code == 0
    assert "MY_EXPERIMENT" in report
