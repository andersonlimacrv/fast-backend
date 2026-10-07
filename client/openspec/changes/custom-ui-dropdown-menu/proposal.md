# custom-ui-dropdown-menu — proposal

## Why

O item 10 (`DropdownMenu.md`) está `pending` **sem prova no lab**: o pacote já é o componente vendored em `custom-ui/components/dropdown-menu/` (radix + `Highlight`, pedido do dono, §11) e já roda em produção na sidebar, mas o Trials não tem demo dele — sem prova, ele não é validável (e o dono acabou de consumi-lo também nos menus do card 07). O doc traz a superfície composta que a sidebar **não** exercita: `CheckboxItem`, `RadioGroup`/`RadioItem`, `Sub`/`SubTrigger`/`SubContent`, `Label`, `Shortcut`, `variant="destructive"`, item `disabled` e os placements `side`/`align`.

## What Changes

- **Prova nova no lab** (`catalog-demos.tsx`, `DropdownMenuDemo`), fiel ao demo do doc + o padrão do shell:
  - menu completo "My Account": `Label` + grupo com `Shortcut`s, `Sub` ("Invite users" → Email/Message/More…), `CheckboxItem` ("Compact rows"), `RadioGroup` (Confortável/Denso), `disabled` ("API") e `variant="destructive"` ("Log out");
  - segundo trigger com o **placement do rodapé da sidebar** (`side="top" align="end"`), o uso real do shell.
- **Testes** (`ui-catalog.test.tsx`, `describe("dropdown-menu")`): + casos da superfície composta — sub-menu abre e seleciona o item aninhado; `menuitemcheckbox` alterna e reporta; `menuitemradio` seleciona no grupo.
- **Docs**: nota do item 10 no `entries.ts` (prova própria adicionada; o consumo pelo card segue como evidência), `review-design` §13 (linha do 10) e CHANGELOG.
- **Sem mudança de código no pacote** — ele é o porte; o trabalho é prova + validação (o dono confere no lab e o item vai para a Gallery).

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `lab-harness`: item 10 ganha prova viva (era o único pending com pacote pronto e sem demo).

## Impact

- Novos: change `custom-ui-dropdown-menu`.
- Alterados: `client/src/components/catalog-demos.tsx` (demo), `ui-catalog.test.tsx` (+3), `client/src/lib/catalog/entries.ts` (nota do 10), `docs/review-design.md` §13, `CHANGELOG.md`.
- **Intocados**: `custom-ui/components/dropdown-menu/**` (vendored, sem edição), tokens, páginas.

## Non-goals

Editar o pacote (o contrato vendored está congelado desde 2026-09-16); migrar a sidebar (já usa); criar variantes novas.

## Acceptance criteria

1. `/admin/lab/trials` → card `10 DropdownMenu`: o menu completo abre com label/grupos/shortcuts, o sub-menu "Invite users" abre ao lado, o checkbox alterna, o radio marca um por vez, o item `disabled` não responde e o destrutivo aparece em vermelho.
2. O segundo trigger abre **acima** alinhado à direita (`side="top" align="end"`) como o rodapé da sidebar.
3. Teclado: setas navegam, Enter seleciona, Esc fecha e o foco volta ao trigger; o highlight animado do pacote acompanha.
4. Gates: `tsc`, `oxlint`, catálogo e build verdes.
