# icons-audit — design

## Decisions

1. **Regra de ouro confirmada por evidência**, não só por convenção: grep em
   todo `client/src` mostra imports de `react-icons*`/`lucide-react` só dentro
   de `lib/icons.tsx`; os 18 pontos de uso no `custom-ui` importam todos de
   `@/lib/icons`.
2. **Mortos fora**: 11 nomes sem nenhum uso no client (`BadgeCheck`, `Bell`,
   `ChartColumn`, `ChevronsLeft`, `ChevronsRight`, `Clock`, `Database`,
   `Globe`, `Inbox`, `Send`, `Tag`) — removidos; `tsc` + suite cheia provam
   que nada quebrava por eles.
3. **SVG funcional não é ícone**: anel do `circular-progress` e `filter#goo`
   ficam locais (são renderização do componente, não artwork reutilizável —
   ao contrário de `GooGlyph`/`GradientCode`, centralizados).
