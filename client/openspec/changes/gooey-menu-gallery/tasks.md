# gooey-menu-gallery — tasks

## S0 — Change

- [x] 0.1 `client/openspec/changes/gooey-menu-gallery/{proposal,tasks,design}.md` + pedido do dono

## S1 — Glyph + ícones

- [x] 1.1 `gooey-menu.tsx`: `<GooGlyph>` → `<Info size-5>`; 2 camadas — blob filtrado (silhuetas sem stroke; borda/sombra dentro do goo borra e dobra, o artefato "dois divs") + superfície nítida por cima com a borda da casa (`border border-border`, raio por token `rounded-lg`, sem shadow — dono); springs intactos (dono 2026-10-09)
- [x] 1.2 `lib/icons.tsx`: remover `GooGlyph`; `icons.test.tsx` ajustado

## S2 — Catálogo + prova

- [x] 2.1 `entries.ts`: item 26 (feedback, Health) + item 22 sem gooey
- [x] 2.2 `catalog-demos.tsx`: `"gooey-menu"` (linhas estilo Health) + teste de hover

## S3 — Docs + verificação

- [x] 3.1 `review-design.md` (§6 + ledger 26) + CHANGELOG
- [ ] 3.2 Ok visual do dono no card 26 (agora no Lab — ver S4)
- [x] 3.3 Gates: `tsc -b`, `oxlint`, vitest, build — **verdes** (`tsc` limpo; oxlint sem achado; suite 169/169; `vite build` ok)
- [ ] 3.4 Sem commit sem pedido

## S4 — Trial de cor do efeito (dono, 2026-10-09)

- [x] 4.1 Auditoria: `bg-muted` some no dark (`--muted` 0.2405 vs `--background` 0.1913, ΔL 0.05; light 0.19); `--chart-*` têm o mesmo valor nos 2 temas (tweakcn + `index.css`)
- [x] 4.2 Trial com `blobClassName` + 4 variações (v1 chart-2 … v4 chart-5) — veredito do dono: v1 chart-2, com amend: 60% de opacidade (`opacity-60` post-filter — o matrix do goo satura alpha ≥ ~0.35); prop removida e demo de volta a 1 instância
- [x] 4.3 Teste do dono: silhueta **`primary`** @ 60% no lugar do chart-2 (mesmo valor nos 2 temas, 0.8487 — ΔL 0.15 light / 0.66 dark) — **aprovado em 2026-10-09**
- [x] 4.4 Eyeball do dono nos 2 temas — ok em 2026-10-09
- [x] 4.5 Pós-ok: `validated` → Gallery
