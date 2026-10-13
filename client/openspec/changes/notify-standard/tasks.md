# notify-standard — tasks

## S0 — Change + auditoria

- [x] 0.1 Auditoria read-only do estado atual (push Base-UI + blocks + gaps)
- [x] 0.2 `client/openspec/changes/notify-standard/{proposal,tasks,design}.md` + lib `gooey-toast@0.2.2` verificada (npm metadata + README) e registrada

## S1 — Blocks

- [x] 1.1 `ErrorBox`: `actionLabel`/`onAction` (retry slot, espelho do `EmptyState`)
- [x] 1.2 `notify.confirm` migrado: `admin/Users` (5 ações destrutivas) → `AlertDialog` bloqueante de página; `orgs/Orgs` aviso de criado → `success` (switch segue por linha)
- [x] 1.3 `confirm` aposentado (fachada, `ConfirmAction`, teste, ramo `actionProps`, mock do Projects) + re-export `friendlyError` removido
- [x] 1.4 Regra push-vs-block em `CLIENT-STRUCTURE.md` + item no checklist `code-reviewer`
- [x] 1.5 Inventário `pages/*/blocks/`: zero movimentações (só imports compartilhados)

## S2 — Costura

- [x] 2.1 `services/notify.provider.ts` com o wiring Base-UI; `notify.ts` = só contrato
- [x] 2.2 `toaster.tsx` + `notify.test.ts` consomem o provider; nenhuma página importa o manager
- [x] 2.3 Gates S1+S2 (sem mudança visual/comportamental) — **verdes em 2026-10-13** (`tsc` limpo, oxlint só warnings pré-existentes, 168/168 — menos o teste do `confirm` removido, `vite build` ok)

## S3 — Swap goey-toast (após ok do dono no desenho)

- [x] 3.1 Correção de alvo: instalada a lib errada (`gooey-toast` vanilla) e revertida; instalada a certa pinada `goey-toast@0.5.0` (+ `sonner` transitiva + `framer-motion@13.3.0` peer — mesma major do nosso `motion@13.3.0`: bundle +52 kB raw/+14 kB gzip). Vetting — **verdes em 2026-10-13**: `tsc` limpo, suite 170/170, `vite build` ok, oxlint sem achado; por código-fonte: `prefers-reduced-motion` nativo + `spring={!reduceMotion}` global (§7.2), `theme` light/dark + RTL nativos, Escape/swipe/timestamp/progress nativos, `maxQueue` + `queueOverflow` nativos, `icon` ReactNode (nossos ícones), `classNames` por parte; `notify.promise` exposto (loading→success/error, erro via `friendlyError`)
- [x] 3.2 Adapter atrás da costura (defaults do site: bottom-right, spring/bounce, Escape, swipe, timestamp; da casa: `maxQueue={3}` nativo, durations 5s/7s, ícones `lib/icons`, `theme` reativo pela classe `.dark`); wiring Base-UI removido (`toaster.tsx` = mount do `GooeyToaster`, `use-toast.ts` sem Base-UI, mock do Projects atualizado); wrapper shadcn NÃO instalado via CLI (`components/ui` intocada — porte fino em `custom-ui`)
- [x] 3.3 Prova = testes de integração jsdom (contrato, promise, mount/props) + visual ao vivo (qualquer toast do app); sem entrada no catálogo (toaster não é item — evita scope creep)
## S4 — Guia do agente

- [x] 4.1 `docs/guides/notify.md` + `notify.pt-BR.md` (contrato, variações do site, blocks, proibido, testes) + ponteiros em `CLIENT-STRUCTURE.md` e `code-reviewer`
- [ ] 3.4 Sem commit sem pedido
