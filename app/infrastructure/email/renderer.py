"""Jinja email rendering (infrastructure side of the DAG boundary).

Modules never import jinja2 (see `no-provider-imports-in-modules`): they
enqueue `email.template{to,subject,template,context}` via the outbox; the
worker renders here, sends, then redacts the token from the payload.
"""

from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, StrictUndefined, TemplateNotFound

from app.infrastructure.email.sender import TEMPLATES_DIR


class EmailRenderer:
    """Render `template.html/.txt` with StrictUndefined (missing vars fail loudly)."""

    def __init__(self, templates_dir: Path | None = None) -> None:
        self._env = Environment(
            loader=FileSystemLoader(templates_dir or TEMPLATES_DIR),
            undefined=StrictUndefined,
            autoescape=True,
        )

    def render(self, template: str, context: dict[str, Any]) -> tuple[str, str]:
        try:
            html = self._env.get_template(f"{template}.html").render(context)
            text = self._env.get_template(f"{template}.txt").render(context)
        except TemplateNotFound as exc:
            raise ValueError(f"unknown email template: {template}") from exc
        return html, text
