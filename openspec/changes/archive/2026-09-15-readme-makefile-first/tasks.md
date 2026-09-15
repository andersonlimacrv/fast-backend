## 1. Levantar verdade (leitura, sem editar)

- [x] 1.1 Ler `Makefile` (targets + variáveis `?=`) e `docs/Makefile.md` + `docs/Makefile.pt-BR.md`
- [x] 1.2 Ler `README.md` + `README.pt-BR.md` e anotar blocos a converter (getting started, test, build, backup, new-project)
- [x] 1.3 Confirmar pares bilíngues afetados: `README.md` ↔ `README.pt-BR.md` (obrigatório); `docs/Makefile.md` ↔ `docs/Makefile.pt-BR.md` (se tocar)

## 2. Escrever change (este diretório)

- [x] 2.1 `proposal.md` (why/what/capabilities/impact/non-goals/acceptance)
- [x] 2.2 `design.md` (contexto, goals, decisões make-first + under-the-hood + bilíngue atômico)
- [x] 2.3 `specs/oss-presence/spec.md` (delta MODIFIED: README make-first)
- [x] 2.4 `specs/project-template/spec.md` (delta MODIFIED: scaffold canônico via make)
- [x] 2.5 Pedir aprovação do usuário antes de editar qualquer README (regra de ouro `AGENTS.md §3`) — aprovado em 2026-09-15

## 3. Implementação (APÓS aprovação — não fazer agora)

- [x] 3.1 Reescrever `README.md`: Getting started → `make setup` + `make api`/`make up`; Test → `make test-unit`/`make check`; Build → `make build`; Backup → `make backup`/`make restore`; New project → `make new-project`; cada bloco com nota under-the-hood + link `docs/Makefile.md`
- [x] 3.2 Espelhar tudo em `README.pt-BR.md` (mesma estrutura, comandos idênticos, link `docs/Makefile.pt-BR.md`)
- [x] 3.3 Se necessário, ajuste fino de clareza em `docs/Makefile.md` + `docs/Makefile.pt-BR.md` em par — não necessário (manual já completo)
- [x] 3.4 Verificar: `git status --short` só com docs previstos; `grep` por comandos raw como canônico não acha mais nada; diff EN↔PT-BR confere estrutura

## 4. Gate + verify

- [x] 4.1 `make help` e `make help-unclassified` continuam ok (Makefile intocado — sanity por inspeção; `make help` falha neste Windows por falta de `awk`, sem regressão)
- [x] 4.2 Revisão leitora: `code-reviewer` (Standards + Spec) nos dois READMEs — verificado em 2026-09-15
- [x] 4.3 Solicitar `/openspec-verify` ou aprovação manual antes de archivar — verificado, pronto para archive + sync
