## 1. AGENTS.md

- [x] 1.1 §4: receita de delegação em 6 passos + regras (change aprovada antes; Postgres real no tester delegado; gates antes de commit)
- [x] 1.2 §5: coluna `Via` (`Task` × `runbook (sem tipo Task)`) nos 10 agentes

## 2. Prova real

- [x] 2.1 Estrear `docs-writer` via `Task` na change `readme-badges-refresh`; registrar resultado no verify (feito: corpo+espelho delegados, 2 correções inline)
- [ ] 2.2 `openspec validate agent-flow` + `archive`

## 3. Alinhamento --yolo + registry 100% (2026-09-16)

- [x] 3.1 Permissões: executores (`backend-implementer`, `tester`, `frontend-implementer`) → `allow`; leitores intocados
- [x] 3.2 Registry: `allowed-tools` declarado, uso registrado (reformulação, `docs-writer`, triagem LGPD), triagem LGPD nova, seção Patches locais (P1)
- [x] 3.3 Patch P1 nos 3 links Vercel (só `AGENTS.md` do pacote; conteúdo funcional intacto)
- [ ] 3.4 `openspec validate agent-flow` + `archive`
