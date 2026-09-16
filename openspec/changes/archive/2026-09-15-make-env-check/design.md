## Context

`Settings` (`app/core/settings.py`) já valida em runtime e falha alto; `_check-env` só checa existência do arquivo. Precedente de scripts testados: `test_new_project.py`, `test_release_notes.py` em `app/tests/unit/`. Convenção Makefile: lógica >5 linhas → `scripts/`.

## Goals / Non-Goals

**Goals:** feedback em <1s, legível, sem vazar segredo nem tocar no `.env`.
**Non-Goals:** substituir o validator de `Settings` (ele continua a autoridade); sync.

## Decisions

1. **Script standalone stdlib, sem importar `app/`** — roda com o Python do sistema, antes mesmo do `uv sync`; evita acoplar DX a dependências.
2. **Regras duplicadas (não importadas) de propósito** — importar validators exigiria venv + Settings (que lê env do processo e falha no primeiro erro só). Duplicação pequena, documentada no cabeçalho do script; divergência futura aparece porque os testes unit espelham os casos de `test_settings_validation.py`.
3. **Exit codes distintos** (`0/1/2`) — permite `setup` falhar e CI futuro distinguir "sem arquivo" de "drift".
4. **`setup`, não `dev`** — `setup` é o caminho de primeira vez; `dev` já pressupõe ambiente pronto e falharia duas vezes pelo mesmo motivo.

## Risks / Trade-offs

- [Duplicação de regras vs Settings → testes espelho + comentário no script; divergência vira falha de teste, não bug silencioso] → aceito.
- [`.env` com valores multilinha/quote → parser simples cobre `KEY=valor` (formato do nosso `.env.example`); linha não-parseável é ignorada com aviso, nunca erro] → sem falsos exit 1.

## Migration Plan

Sem migração. Rollback = reverter commit.

## Open Questions

- Nenhuma bloqueante.
