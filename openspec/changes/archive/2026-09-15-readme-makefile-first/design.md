## Context

Pós-v1.0.0: `Makefile` é o entrypoint único (203 linhas, seções Setup/Database/Tests/Verify/Docker/Run/Ops/Meta) e `docs/Makefile.md` + `docs/Makefile.pt-BR.md` são o manual completo. README atual inverte a ordem: ensina raw primeiro, relega `make help` a uma linha no fim. Resultado: usuário descobre o `make` por acidente. `scripts/new_project.py:82-86` e `Makefile:175-177` fazem o mesmo; README deve ensinar o wrapper.

## Goals / Non-Goals

**Goals:**
- README make-first nos dois idiomas, com disclosure honesto do comando subjacente (confiança + aprendizado).
- Uma fonte da verdade: `Makefile` manda; README resume e aponta; `docs/Makefile*.md` detalha.
- Paridade EN/PT-BR verificável por diff de estrutura.

**Non-Goals:**
- Mudar targets, variáveis `?=` ou receitas; criar docs novas; traduzir docs internas.

## Decisions

1. **Make-first com "por baixo dos panos" inline** — cada bloco README mostra `make ...` em destaque e, logo abaixo, o comando real em `<details>` ou nota curta. Alternativa rejeitada: só `make` sem disclosure (mágica opaca, ruim p/ debug/CI); só raw (estado atual, fricção relatada).
2. **README resume, manual detalha** — tabela completa de variáveis/targets fica em `docs/Makefile*.md`; README tem ~5 blocos (setup, test, build, backup, new-project) + link `make help`. Evita divergência tripla (Makefile × manual × README).
3. **Bilíngue atômico** — cada hunk em `README.md` tem hunk espelho em `README.pt-BR.md` no mesmo commit/change; banners `🇬🇧/🇧🇷` preservados. Se `docs/Makefile*.md` mudar, mudar o par junto (regra `docs/RULES.md §9`).
4. **Mapeamento verificado contra o `Makefile` real** — antes de escrever, extrair receitas de `make setup|sync|migrate|api|worker|up|test|lint|build|backup|new-project` e colar o equivalente exato (ex.: `make sync` → `uv sync --extra dev`, `make api` → `uvicorn app.main:create_app --factory ...`). Nada inventado.
5. **Docs-only, sem gate novo** — verificação é leitura + `git status --short` + `grep` de paridade; sem teste pytest (nenhum comportamento runtime muda).

## Risks / Trade-offs

- [README diverge do Makefile com o tempo] → mitigação: README aponta (`make help`, `docs/Makefile.md`), não replica tabela; change inclui checklist de conferência.
- [Bloco "under the hood" polui leitura rápida] → mitigação: formato colapsável/nota curta, quickstart limpo em 3 linhas.
- [`<details>` não renderiza em algum espelho] → fallback: nota em itálico/blockquote simples, sem HTML obrigatório.
