# lab-harness — design

## Rotas e acesso

| Rota | Página | Papel |
|---|---|---|
| `/admin/lab` | `pages/admin/lab/Lab.tsx` | Lista de adoção (Components / Blocks) com `n`, `kind`, `status` |
| `/admin/lab/trials` | `pages/admin/lab/Trials.tsx` | Provas vivas dos itens `pending` |
| `/admin/gallery` | `pages/admin/gallery/Gallery.tsx` | Catálogo **validado** (Components / Blocks) com prova + `usedIn` |

Todas staff-only (`RequireStaff` + 403 backend) e sob `/admin`, como Users/Orgs/Audit.
Sidebar Admin: `Gallery` (`Layers`) + `Lab` (`FlaskConical`).
Breadcrumb: `Admin → {Gallery|Lab|Lab → Trials}`.

## Fonte única: `lib/catalog/`

```text
lib/catalog/types.ts    — CatalogClass | CatalogStatus | CatalogKind | RefGroup | CatalogUsage | CatalogEntry
lib/catalog/entries.ts  — CATALOG (23 entradas, 1 por doc de references/components_to_use/)
lib/catalog/index.ts    — barrel + byClass/byStatus/validatedByClass/nn/CLASS_ORDER/CLASS_LABEL
```

- `n` é **imutável** (append-only), compartilhado Lab ↔ Gallery (`nn()` formata `02`).
- `class` = `component` | `block`; `kind` = base/buttons/data/media/shell/identity/feedback.
- `status` = `pending` | `validated` | `dropped` (`stamped` extinto).
- `ref`/`refGroup` apontam o doc-fonte (`animate-ui` | `exemple-layours` | `standalone`); `source` é a implementação ou `null` (not ported).
- `usedIn[]` = `{ label, to?, scope }` — `to` vira link rápido quando existe rota.
- **Crescimento**: novo doc em `references/components_to_use/` → append com o próximo `n`, `status: "pending"`, `source: null`.

## Provas compartilhadas

`components/catalog-demos.tsx` mapeia `slug → ReactNode` (dados neutros, tokens, reduced-motion).
Trials renderiza as provas dos `pending`; Gallery renderiza as mesmas dos `validated`.
**Validar um item = flipar `status` no catálogo**; a prova migra de página sozinha.
`components/catalog-meta.tsx` concentra `StatusBadge` e `UsageList` (usadas pelas duas páginas —
páginas nunca importam de páginas, ADR 0013).

## Fluxo (dono)

1. `/admin/lab` mostra tudo, com `n`/tipo/status.
2. `/admin/lab/trials` prova os `pending` 1-a-1.
3. Aprovado → `status: "validated"` (+ `source`/`usedIn` preenchidos) → aparece em `/admin/gallery` com onde é usado de verdade.
