# custom-ui-avatar-group — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/custom-ui-avatar-group/{proposal,tasks,design}.md`
- [x] 0.2 Fonte lida (`primitives-animate-avatar-group` + demo via `animate-ui.com/r/*.json`) + inventário: `avatar-group.tsx` raiz só com prova+testes, `ui/avatar.tsx` com sidebar em produção (fica), nosso tooltip primitive com `Provider/Tooltip/Trigger/Content/Arrow`

## S1 — Componentes + deleção

- [x] 1.1 `custom-ui/components/avatar-group/primitive.tsx`: vendored (`AvatarGroup` + `AvatarContainer` shift + `AvatarGroupTooltip`); nosso tooltip **composto** (a pílula da sidebar — fix 2026-09-30); sem `'use client'`; reduced-motion
- [x] 1.2 `custom-ui/components/avatar-group/avatar-group.tsx`: API atual (`users`, `max`, `size`) sobre nosso `ui/avatar`; tooltip só o nome; `+N` + `"N online"`; tokens
- [x] 1.3 Deletar `components/avatar-group.tsx` (sem dualidade — dono 2026-09-30)

## S1b — Revisão (dono, 2026-09-30)

- [x] 1.4 `ui/avatar.tsx`: dot fora do corte (`overflow-hidden` interno) + estado `inactive` + padrão (chart-2/muted/hollow, `h-3 w-3`) + `DESIGN.md`
- [x] 1.5 `avatar-group.tsx`: `mode` + `user`/`users` + `onHover` + `tooltip` + `showPresence` (defaults: multiple/true/true/false)

- [x] 1.1 `custom-ui/components/avatar-group/primitive.tsx`: vendored (`AvatarGroup` + `AvatarContainer` shift + `AvatarGroupTooltip`); nosso tooltip **composto** (a pílula da sidebar — fix 2026-09-30); sem `'use client'`; reduced-motion
- [x] 1.2 `custom-ui/components/avatar-group/avatar-group.tsx`: API atual (`users`, `max`, `size`) sobre nosso `ui/avatar`; tooltip só o nome; `+N` + `"N online"`; tokens
- [x] 1.3 Deletar `components/avatar-group.tsx` (sem dualidade — dono 2026-09-30)

## S2 — Prova + testes

- [x] 2.1 `catalog-demos.tsx`: prova com todas as variações (single ± tooltip, presença nos 3 estados, `onHover` off, sizes/overflow)
- [x] 2.2 `ui-catalog.test.tsx`: `describe("avatar-group")` (overlap, `+N`, tooltip, single, presença gated + tokens)

## S3 — Docs

- [x] 3.1 `entries.ts` n=23 (`source: custom-ui/components/avatar-group/` + nota)
- [x] 3.2 `review-design` §13 (linha 23) + §14 (linha `avatar.tsx`: importador atualizado) + CHANGELOG

## S4 — Verificação

- [x] 4.1 Ok visual do dono no card 23 → `status: "validated"` — **validado em 2026-09-30** (API explícita + padrão de presença + tooltip pílula)
- [x] 4.2 Gates: `tsc -b`, `oxlint`, catálogo, build — **verdes em 2026-09-30** (`tsc -b` limpo; catálogo 70/70, `vite build` ok; browser: dots visíveis nos 3 estados, tooltip pill, zero erros)
- [ ] 4.3 Sem commit sem pedido

## S5 — Depois (fora daqui)

- [x] 5.1 Sidebar usa o grupo `single` (dono, 2026-09-30 — validado junto): `app-sidebar.tsx` footer com `mode="single" tooltip={false}`; `ui/avatar.tsx` segue como base interna do composto
