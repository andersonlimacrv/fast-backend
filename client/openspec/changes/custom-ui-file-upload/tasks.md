# custom-ui-file-upload — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/custom-ui-file-upload/{proposal,tasks,design}.md` + aprovação do dono

## S1 — Transição

- [x] 1.1 Lista + resumo com `AnimatePresence` + `height: auto` (spring 150/22), entrada e saída
- [x] 1.2 `motion-reduce`: seco (sem animar)

## S2 — Regra

- [x] 2.1 `DESIGN.md` §7: "tamanho anima, nunca snap seco" + FileUploader como referência

## S3 — Prova + testes

- [x] 3.1 `catalog-demos.tsx`: demo do 13 exercita adicionar/remover
- [x] 3.2 `ui-catalog.test.tsx`: blocos aparecem/somem + contadores

## S4 — Docs + verificação

- [x] 4.1 `entries.ts` n=13 (nota) + CHANGELOG
- [x] 4.2 Ok visual do dono no card 13 → `status: "validated"` — **validado em 2026-10-09**
- [x] 4.3 Gates: `tsc -b`, `oxlint`, catálogo, build — **verdes em 2026-10-01** (`tsc` limpo; catálogo 76/76; `vite build` ok; browser: altura 21→98px no spring, recolhe total, zero erros)
- [ ] 4.4 Sem commit sem pedido

## S5 — Quebra seca no fim da exclusão (dono, follow-up)

- [x] 5.1 Row: exit zera `borderWidth` + `marginBottom` (gap do pai vira `mb` por item), `overflow` persistente, `popLayout`
- [x] 5.2 Section: sem `layout`, exit em tween; espaçamento via margens animadas
- [x] 5.3 Drop-zone: entra/sai animado (limite de 6 sem snap)
- [x] 5.4 Gates + prova no browser (excluir 1 de 2, excluir último, encher até o limite) — gates verdes (`tsc` limpo, oxlint só warnings pré-existentes, catálogo 76/76, `vite build` ok); browser validado pelo dono em 2026-10-09
- [x] 5.5 Flip `last:mb-0` (dono: snap só ao excluir o ÚLTIMO) — `mb-2` uniforme nas rows + `-mb-2` estático no container (resumo segue a 16px, sem seletor que flipa)
