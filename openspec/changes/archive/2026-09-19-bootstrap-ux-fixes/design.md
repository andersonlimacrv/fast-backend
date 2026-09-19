## Context

`amain` lê email de `--email`/`ROOT_EMAIL`, senha de um `getpass` único, settings do `.env` (pydantic) e chave de `--key`/`BOOTSTRAP_KEY` (environ). A receita `make` não ponteia os dois mundos: `.env` nunca é exportado. Resultado: documentado ≠ funcional.

## Goals / Non-Goals

Goals: caminho feliz funciona com só `.env` + `ROOT_EMAIL`; typo de senha não queima o one-shot; falha de uso explica em vez de genericar. Non-goals: prompt interativo de email, mensagens fail-closed distintas, tocar serviço.

## Decisions

1. **Chave via `grep ^BOOTSTRAP_KEY=` do `$(ENV_FILE)` na receita** — cirúrgico: só essa var viaja para o script (não `set -a` no `.env` inteiro, que quebraria em valores com espaço como `CORS_ORIGINS`). Rejeitado: `set -a; . .env` (parsing frágil) e exigir export manual (foi o que mordeu).
2. **Receita exige email com mensagem de uso** — `ROOT_EMAIL` de env OU `make admin-bootstrap email=...`; ausente → uso, exit 1. Uso não é segredo nem oráculo (anterior ao gate da chave). Rejeitado: prompt interativo de email (getpass sem eco p/ email confunde; email aparece no terminal de todo jeito).
3. **Duplo prompt, comparação simples** — `!=` basta (saída idêntica de todo jeito, sem oráculo de timing relevante em CLI interativo). Ordem: vazio → senha1 → curta?→ senha2 → match → settings/bootstrap. Rejeitado: checar curta só após as duas (pior UX: digita 2x para ouvir "curta").
4. **`--key` explícito/`BOOTSTRAP_KEY` exportado vencem o `.env`** — precedência preservada: a receita só injeta quando a var já não vem no ambiente.
5. **Docs da change 1 reescritas junto** — comandos sem export manual; checklist ganha "BOOTSTRAP_KEY no `.env` (a receita lê sozinha)".

## Risks / Trade-offs

- [`grep|cut` na receita assume `KEY=value` simples] → formato do `.env` é `KEY=...` sem espaços na chave (garantido pelo `parse_env`); valor hex sem espaços. Aceito com teste? Receita make não tem teste — mitigado por inspeção + runbook.
- [Dois prompts quebram automação que pi peava a senha via stdin] → `getpass` com stdin não-TTY já falhava fechado antes; sem regressão real. CI usa `bootstrap()` direto (testes), não `amain`.
