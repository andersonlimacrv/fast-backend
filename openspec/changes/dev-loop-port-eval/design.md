# dev-loop-port-eval — design

## Context

`Makefile:23-29` carrega as portas do `.env` via
`scripts/env_ports.py --make` para dentro de variáveis Make, com fallback
silencioso para os defaults quando o helper não roda. A troca de OS expôs dois
defeitos independentes: deps do frontend ausentes e parsing inválido do
resultado do helper.

## Decisions

1. **Separador `;` fica no script; o split é no Make.** `scripts/env_ports.py`
   emite `KEY=VALUE;KEY=VALUE;` porque `$(shell ...)` dobra newlines em espaços
   — uma atribuição por linha viraria um único assignment com lixo no valor.
   O erro foi assumir que `$(eval)` interpreta `;` como separador de
   statements. O Make passa a fazer o split explícito:

   ```make
   $(foreach assignment,$(subst ;, ,$(ENV_PORTS)),$(eval $(assignment)))
   ```

   Rejeitado: emitir newline no script (não sobrevive ao `$(shell)`);
   `$(eval $(subst ;,$(newline),...))` (correto, mas exige `define` de newline
   e é mais difícil de ler para valores que são sempre portas). O `foreach`
   mantém o fallback (lista vazia → nada acontece) e a precedência: o helper
   omite chaves presentes no ambiente, e os `?=` continuam cobrindo o resto.
2. **Guarda, não instalação automática.** `_check-web-deps` verifica
   `$(CLIENT_DIR)/node_modules/vite` (diretório do pacote; funciona em
   Linux/macOS/Windows, diferente de `-x .bin/vite`, que não é portável) e
   falha com `run 'make web-install' first`. Auto-`npm ci` no `dev` seria uma
   instalação surpresa (rede, minutos) e mascararia o estado do `node_modules`.
   Aplicado a `dev` e aos targets web que usam o binário: `web`, `web-lint`,
   `web-test`, `web-build`, `web-e2e-install`, `web-e2e`, `web-e2e-update`,
   `e2e-build`, `e2e-full`. `web-install` fica fora (é o remédio).
3. **Regressão testada no Make real.** Um unit test cria um `.env` temporário
   com portas conhecidas, roda `make -n dev ENV_FILE=...` (dry-run, sem
   executar Docker/Vite) e asserta `--port 3002 --strictPort` e ausência de
   `3002;API_PORT`. `skipif` quando `make` ou `bash` não existem (o Makefile
   usa `SHELL := bash`). Isso teria pego o bug exato.
4. **Fallback preservado.** Continua `2>/dev/null` + defaults `?=`; `make
   env-check` segue sendo o gate que falha em portas inválidas. O objetivo é
   não travar o parse do Make por causa do helper.

## Risks / Trade-offs

- `$(foreach)` divide por espaço; valores com espaço quebrariam. O contrato do
  `--make` é só portas numéricas, validado por `resolve()`, então o risco é
  nulo hoje. Documentado no comentário do Makefile.
- O teste de regressão invoca `make` + `uv run` (alguns segundos); fica no
  tier unit e é skip em ambientes sem Make/Bash.
- `_check-web-deps` é um target de pré-requisito; em `make -j` ele pode rodar
  em paralelo com outros checks, mas não muta nada.

## Migration

Nenhuma. Apenas Make/scripts/docs/testes.
