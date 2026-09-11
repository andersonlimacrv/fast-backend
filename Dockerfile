# fast-backend — multi-stage: deps / dev / migrate / prod.
ARG PYTHON_VERSION=3.12

FROM ghcr.io/astral-sh/uv:python${PYTHON_VERSION}-bookworm-slim AS deps
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
WORKDIR /code
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

FROM deps AS dev
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --extra dev
COPY . .
CMD ["uv", "run", "uvicorn", "app.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000", "--reload"]

FROM deps AS migrate
COPY alembic.ini ./
COPY app ./app
CMD ["uv", "run", "alembic", "upgrade", "head"]

FROM python:${PYTHON_VERSION}-slim-bookworm AS prod
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PATH="/code/.venv/bin:$PATH"
RUN useradd --create-home --uid 10001 appuser
WORKDIR /code
COPY --from=deps /code/.venv /code/.venv
COPY alembic.ini ./
COPY app ./app
RUN mkdir -p /code/var/storage && chown -R appuser:appuser /code/var
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/healthz')"
CMD ["uvicorn", "app.main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000"]
