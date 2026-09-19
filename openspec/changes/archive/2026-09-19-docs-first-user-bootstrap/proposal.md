## Why

O bootstrap do root funciona, mas a documentação do "primeiro usuário" está espalhada e com lacunas no ponto exato onde um dev trava (provado na prática em 2026-09-17): `ROOT_EMAIL` não aparece no `make help`, no `.env.example` nem no README raiz — só numa menção de passagem no DEPLOYMENT e no `argparse`; senha min 8 chars só existe no código; não há walkthrough dev-first-run; e o `bootstrap failed` genérico (fail-closed por desenho) não tem troubleshooting. Resultado: tentativa com `ROOT_EMAIL` sem `@` e banco zerado, sem pista da causa.

## What Changes

Docs-only, sem runtime:

1. `Makefile` help do `admin-bootstrap`: menciona `ROOT_EMAIL` + prompt de senha (min 8, email válido).
2. `docs/DEPLOYMENT.md` (+pt-BR): subseção "First user in dev" (migrate → env-check → bootstrap → login → SQL de conferência) + checklist de entradas para o `bootstrap failed` (sem revelar causas — só regras de entrada) + nota `getpass`/Git Bash.
3. `README.md` (+pt-BR): pointer de 1º usuário no Getting Started.
4. `client/README.md`: `ROOT_EMAIL` + senha min 8 + email válido na seção admin.

## Capabilities

### New Capabilities

- Nenhuma (higiene de docs).

### Modified Capabilities

- `guides-docs`: primeiro uso documentado de ponta a ponta.

## Impact

- Alterados: `Makefile` (só texto de help), `docs/DEPLOYMENT.md` (+pt-BR), `README.md` (+pt-BR), `client/README.md`.
- `ROOT_EMAIL` propositalmente FORA do `.env.example`: o `env-check` marca toda chave do example ausente no `.env` como drift — adicioná-la quebraria o check de todo clone existente.

## Non-goals

Mudar mensagens fail-closed, validar email (change `bootstrap-email-validation`), traduzir docs internas, tocar código/testes.

## Acceptance criteria

1. `make help` mostra `ROOT_EMAIL`; `grep -r ROOT_EMAIL` nos docs de usuário acha runbook + help + client/README.
2. Dev novo executa só o documentado (migrate → env-check → bootstrap → login → SQL) e termina com root logado.
3. Espelhos EN/PT-BR lado a lado; `git status` só docs.
