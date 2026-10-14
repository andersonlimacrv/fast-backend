# custom-ui-dropdown-menu — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/custom-ui-dropdown-menu/{proposal,tasks,design}.md`
- [x] 0.2 Inventário: pacote vendored em `custom-ui/components/dropdown-menu/` (radix + `Highlight`), consumido pelo shell (sidebar) e pelos menus do card 07; **sem prova no lab**

## S1 — Prova

- [x] 1.1 `catalog-demos.tsx`: `DropdownMenuDemo` com a superfície do doc — `Label`, grupos com `Shortcut`, `Sub` ("Invite users"), `CheckboxItem`, `RadioGroup`/`RadioItem`, item `disabled` e `variant="destructive"`
- [x] 1.2 Segundo trigger com o placement do shell (`side="top" align="end"`, o rodapé da sidebar)

## S2 — Testes

- [x] 2.1 Sub-menu: abre pelo trigger e seleciona o item aninhado
- [x] 2.2 `menuitemcheckbox`: alterna e reporta via `onCheckedChange`
- [x] 2.3 `menuitemradio`: seleciona um valor do grupo

## S3 — Docs

- [x] 3.1 `entries.ts` n=10 (nota: prova própria adicionada; consumo pelo card = evidência)
- [x] 3.2 `review-design` §13 linha 10 + CHANGELOG

## S4 — Verificação

- [x] 4.1 Ok visual do dono no card 10 (dois placements, sub-menu, checkbox/radio, destrutivo) → `status: "validated"` — **validado em 2026-09-23**
- [ ] 4.2 Gates: `tsc`, `oxlint`, catálogo, build
- [ ] 4.3 Sem commit sem pedido

## S5 — Depois (fora daqui)

- [ ] 5.1 Se um dia a sidebar sair do pacote, manter a prova viva (a demo é o contrato visual do item 10)
