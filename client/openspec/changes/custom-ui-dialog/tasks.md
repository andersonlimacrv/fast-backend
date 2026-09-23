# custom-ui-dialog — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/custom-ui-dialog/{proposal,tasks,design}.md`
- [x] 0.2 Fonte lida (`references/components_to_use/AnimateUi/Dialog.md`) + registry upstream (`components-base-dialog` e `primitives-base-dialog` via `animate-ui.com/r/*.json`) + inventário de importadores da base (`catalog-demos`, `ui-catalog.test`)

## S1 — Componente

- [x] 1.1 `custom-ui/components/dialog.tsx`: `Dialog`/`DialogTrigger`/`DialogClose`/`DialogPortal`/`DialogOverlay`/`DialogContent`/`DialogHeader`/`DialogFooter`/`DialogTitle`/`DialogDescription` sobre Base UI Dialog + motion
- [x] 1.2 Coreografia do primitivo: portal com `AnimatePresence` + `keepMounted` (entrada E saída), backdrop com fade 0.15s + `backdrop-blur-sm`, popup com flip 3D (`from`, `perspective(500px)`, `scale 0.8→1`, blur 4px) e spring 500/32
- [x] 1.3 Do composto: `showCloseButton` (default `true`, X com sr-only "Close" + `ring-2` de foco); **layout copiado do 03 `AlertDialog`** (dono, 2026-09-23): painel `w-full max-w-md … p-6 shadow-lg`, header `mb-4 gap-1.5`, título `text-lg font-bold tracking-tight`, descrição `text-sm text-muted-foreground`, footer `mt-5 flex-col-reverse gap-2 sm:flex-row sm:justify-end`; e `from` default **`bottom`** (DESIGN.md §7, diretriz 6)
- [x] 1.4 Deltas nossos: `bg-card text-card-foreground`, ícones via `lib/icons`, `ring-2` (DESIGN.md §8), reduced-motion instantâneo

## S2 — Prova + testes

- [x] 2.1 `catalog-demos.tsx`: prova do 09 passa a importar do `custom-ui`; demo do doc (form "Edit profile" com `Input`s + Salvar/Cancelar) como default + variantes rotuladas `variant: from="top"` e `variant: showCloseButton=false` (o card 03 ganhou o mesmo prefixo `variant:`)
- [x] 2.2 `ui-catalog.test.tsx`: abrir/fechar pelo X e `showCloseButton={false}` fechando pelo `DialogClose`

## S3 — Docs

- [x] 3.1 `entries.ts` n=9 (`source: custom-ui/components/dialog.tsx`, nota)
- [x] 3.2 `review-design.md` §13 (linha 09) + §14 (dívida `dialog.tsx` → convergida)
- [x] 3.3 `CHANGELOG.md` `[Unreleased]`

## S4 — Verificação

- [x] 4.1 **Ok visual do dono** em `/admin/lab/trials` (card 09) → `status: "validated"` (dono, 2026-09-23; pediu o layout do 03 e as variantes rotuladas antes do ok)
- [ ] 4.2 Gates: `tsc`, `oxlint`, catálogo, build
- [ ] 4.3 Sem commit sem pedido

## S5 — Depois (fora daqui)

- [ ] 5.1 Avaliar consumir o porte em telas de produção (não há uso hoje; o 03/09 cobrem os dois semânticos de overlay)
