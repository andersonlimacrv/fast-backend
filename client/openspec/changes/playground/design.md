# playground — design

## Rotas e acesso

| Rota | Página | Acesso |
|---|---|---|
| `/playground` | `pages/playground/Playground.tsx` (índice: fila + status) | staff (`RequireStaff`, como a Gallery) |
| `/playground/components` | `pages/playground/Components.tsx` (demos vivas) | staff |
| `/playground/blocks` | `pages/playground/Blocks.tsx` (placeholder até `ExempleLayours`) | staff |

Sidebar Admin ganha `Playground` (`FlaskConical`, após Gallery).
Breadcrumb: `Playground`, `Playground → Components`, `Playground → Blocks`.

## Convenções seguidas

- `CLIENT-STRUCTURE.md`: pasta por rota, sem `index.tsx`; `ROUTES` fonte.
- DEMO sidebar: trigger/tooltip/painel como `ProjectsGroup`.
- Ficha por item: doc origem → rebate 3 docs → skills (`impeccable` critique,
  `web-design-guidelines` a11y, `vercel-react-best-practices` perf) →
  responsivo → decisão (aplicar/adaptar/descartar/deferir) → ledger.
- Ledger de decisões vive nas tasks desta change (S2+).
