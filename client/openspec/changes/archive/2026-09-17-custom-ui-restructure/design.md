# custom-ui-restructure — design

## Árvore-alvo

```
custom-ui/
  components/
    sidebar/sidebar.tsx              (shell; pasta pelo exemplo do dono)
    dropdown-menu/dropdown-menu.tsx  (estilizado) + primitive.tsx (comportamento)
    sheet/sheet.tsx                  + primitive.tsx
    tooltip/tooltip.tsx              + primitive.tsx
    collapsible.tsx                  (camada única)
    slot.tsx                         (util avulso)
  effects/
    highlight.tsx                    (compartilhado)
```

## Regras (vão p/ `docs/CLIENT-STRUCTURE.md`)

1. Base shadcn em `/ui`; tudo custom em `/custom-ui` (nunca o inverso).
2. Um componente = uma entrada em `components/`: pasta quando há 2+ arquivos
   (`<nome>.tsx` estilizado + `primitive.tsx` comportamento); arquivo avulso
   quando camada única; exemplo com pasta dedicado (`sidebar/`).
3. Efeito compartilhado vai em `effects/` (hoje: `highlight`).
4. Proibido recriar níveis `primitives/`, `radix/`, `animate/` (o par antigo
   morreu nesta change); imports sempre `@/components/custom-ui/...`.

## Alternativas consideradas

- Manter dualidade components/primitives: rejeitado (dono; ambiguidade de onde criar).
- Tudo flat em `custom-ui/`: rejeitado — pastas por par distinguem as camadas.
