## 1. Change (esta change)

- [x] 1.1 `openspec/changes/docs-first-user-bootstrap/{proposal,tasks,design}.md` + aprovação do dono

## 2. Descoberta (help + exemplo)

- [x] 2.1 `Makefile`: help do `admin-bootstrap` menciona `ROOT_EMAIL` + prompt (min 8, email válido)
- [x] 2.2 Decisão registrada: `ROOT_EMAIL` fora do `.env.example` (env-check marcaria drift em todo clone)

## 3. Runbook + README

- [x] 3.1 `docs/DEPLOYMENT.md` (+pt-BR): subseção dev-first-run + checklist de entradas do `bootstrap failed` + nota `getpass`/Git Bash
- [x] 3.2 `README.md` (+pt-BR): pointer de 1º usuário no Getting Started
- [x] 3.3 `client/README.md`: `ROOT_EMAIL` + min 8 + email válido na seção admin

## 4. Gates

- [x] 4.1 Grep do aceite 1 + espelhos EN/PT conferidos lado a lado
- [x] 4.2 `git status --short` só docs; sem segredos; sem commit sem pedido
