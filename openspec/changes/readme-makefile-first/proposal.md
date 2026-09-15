## Why

README.md e README.pt-BR.md mostram comandos raw (`cp`, `uv sync`, `uvicorn`, `docker compose`, `python scripts/new_project.py`) antes do `make`, embora o `Makefile` seja o entrypoint único do repo (`Makefile:1-2`, `docs/Makefile.md:1-7`). Usuário relatou fricção: perguntou "não tem comandos make?" após receber o comando raw do scaffold. README atual cita `make help` só no fim (`README.md:94`), sem jornada make-first.

Regra aplicável: `docs/RULES.md §9` — docs de usuário em inglês + variante `.pt-BR.md` com banner de alternância; `AGENTS.md §4.1` — respostas PT-BR, código/identificadores em inglês.

## What Changes

- `README.md` + `README.pt-BR.md`: reescrever seções Getting started / Test / Build / Backup / New project para `make`-first, com sub-bloco colapsável ou nota "por baixo dos panos" mapeando cada target ao comando real (sem duplicar o manual completo).
- Fonte da verdade continua `Makefile` + `docs/Makefile.md` / `docs/Makefile.pt-BR.md`; README apenas aponta (`make help` como índice).
- Bilíngue obrigatório: toda edição no `README.md` tem espelho em `README.pt-BR.md` (e vice-versa). Se `docs/Makefile*.md` precisar de ajuste de clareza, ajustar nos dois idiomas juntos.
- Zero mudança em `app/`, `Makefile`, `scripts/`.

## Capabilities

### New Capabilities

- (vazio)

### Modified Capabilities

- `oss-presence`: README passa a onboarding make-first com disclosure do comando subjacente.
- `project-template`: seção "New project from here" passa a `make new-project` como canônico, script raw como fallback documentado.

## Impact

- Arquivos: `README.md`, `README.pt-BR.md`; opcional `docs/Makefile.md`, `docs/Makefile.pt-BR.md` (só clareza, sem novo target).
- Comportamento da API inalterado; nenhum contrato, migração ou workflow muda.
- Risco baixo: docs-only. Risco principal é divergência README ↔ Makefile — mitigado pela regra "README aponta, não duplica".

## Non-goals (v2 §21)

- Novo target make, mudança em `scripts/new_project.py`, i18n de outros docs, GitHub Pages, logo/brand, OpenAPI publicado.
- Reescrever `docs/ARCHITECTURE.md`, `SCALING.md`, `DEPLOYMENT.md`, `guides/`.

## Acceptance criteria

1. `README.md` e `README.pt-BR.md`: Getting started, Test/verify, Build/deploy, Backup, New project usam `make` como comando principal; cada bloco tem o equivalente raw visível ("por baixo dos panos" / "under the hood").
2. `make new-project name=x dest=../x` é o exemplo canônico de scaffold nos dois READMEs; `python scripts/new_project.py ...` aparece só como fallback.
3. Ambos os READMEs linkam `make help` + `docs/Makefile.md` / `docs/Makefile.pt-BR.md` como manual; nenhum comando documentado diverge do `Makefile` real (conferência por `grep`/`diff` manual).
4. Paridade EN/PT-BR: mesma estrutura de seções, mesmos comandos, banners de alternância preservados (`README.md:3`, `README.pt-BR.md:3`).
5. `git status --short` mostra só os arquivos de docs previstos; sem segredo commitado.
