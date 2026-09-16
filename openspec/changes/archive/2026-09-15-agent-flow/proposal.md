## Why

Três agentes de frontend (`ui-designer`, `frontend-implementer`, `design-auditor`) não têm tipo lançável na ferramenta `Task` — funcionam só como runbook sem que isso esteja escrito. E o uso dos 7 lançáveis nunca foi formalizado (prompt autossuficiente, paralelismo, verificação de retorno), então cada sessão improvisa.

## What Changes

- `AGENTS.md` §4: receita de delegação (classificar → prompt autossuficiente com paths/aceite/retorno → paralelizar o independente → não duplicar → verificar com gates → resumir ao usuário).
- `AGENTS.md` §5: coluna `Via` na tabela (`Task` × `runbook`).
- Regras: change aprovada antes de delegar; tester com Postgres real também quando delegado; retorno sempre passa pelos gates antes de commit/archive.

## Capabilities

### New Capabilities

- `agent-flow`: roteamento e invocação correta de subagentes documentados e testados.

### Modified Capabilities

- Nenhuma.

## Impact

- Só `AGENTS.md` + change OpenSpec. Nenhum runtime, nenhum agente novo.
- Validação: estreia real do `docs-writer` via `Task` na change `readme-badges-refresh`; divergência vira registro no verify, não trava o fluxo.

## Non-goals (v2 §21)

Criar tipos de subagente (plataforma); reescrever agentes existentes; mudar permissões.

## Acceptance criteria

1. Tabela §5 com coluna `Via` correta para os 10 agentes (7 `Task`, 3 `runbook`).
2. `openspec validate agent-flow` ok; `archive` após o teste do `docs-writer`.
