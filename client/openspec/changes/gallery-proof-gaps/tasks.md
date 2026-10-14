# gallery-proof-gaps — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/gallery-proof-gaps/{proposal,tasks,design}.md` + pedido do dono

## S1 — Provas no registry

- [x] 1.1 `tooltip:` — top (default) + right (rail) + bottom, `openDelay={0}`
- [x] 1.2 `collapsible:` — slide (sidebar default) + depth + mask (spring 150/22)

## S2 — Testes

- [x] 2.1 Collapsible: abre/fecha nos dois sentidos (já coberto no `ui-catalog`)
- [x] 2.2 Tooltip: a prova do registry revela no hover
- [x] 2.3 Guarda: `validated` ⇒ `hasDemo` (nenhum card cai no fallback)

## S3 — Docs + verificação

- [x] 3.1 `entries.ts` n=22 e n=24 (notas) + CHANGELOG
- [ ] 3.2 Ok visual do dono nos cards 22/24 da Gallery
- [x] 3.3 Gates: `tsc -b`, `oxlint`, vitest, build — **verdes** (`tsc` limpo; oxlint só warnings pré-existentes; catálogo 78/78; suite 168/168; `vite build` ok)
- [ ] 3.4 Sem commit sem pedido
