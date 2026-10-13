# gooey-menu-gallery — design

## Context

`Tooltip.md` descreve o GooeyMenu, não um tooltip (`review-design.md` §6).
O componente rodava só no `/health` (Runtime inspector) com o glyph "N" do
registry; o dono gostou do efeito e pediu o item direto na Gallery, sem o N.

## Decisions

1. **Item próprio, n=26** (numeração é append-only, `types.ts`): o 26 passa a
   ser o dono do GooeyMenu; o 22 fica só com o tooltip real (pill + seta).
   A utilização `Health (debug overlay)` migra do 22 para o 26.
2. **`kind: "feedback"`** (dono): o menu é um overlay de status/debug.
3. **Trigger = `Info`** (dono): arte "N" sai; efeito goo e springs intactos.
   `GooGlyph` vira export morto → removido do `lib/icons` (higiene do
   `icons-audit`), teste de SVG decorativo fica com o `GradientCode`.
4. **Prova com dados reais do Health** (Client/API/Ready/Errors) — é o uso de
   produção; legenda registra o escopo debug-only e a troca do trigger.
5. **2 camadas** (dono, 2026-10-09): o filtro goo borra + recontrasta tudo
   que entra nele — stroke/sombra legítimos viram borrão dobrado ("dois
   divs"). A camada filtrada carrega só silhuetas (`bg-muted` sem borda)
   guiadas pelos mesmos variants (clone invisível das linhas mantém o auto
   height); a UI real fica por cima, sem filtro, com a borda da casa
   (`border border-border`, raio por token; sem sombra — dono). O painel
   nítido faz fade-in após a expansão (~250ms) e fade-out rápido (0.1s) no
   fecho, revelando o blob recolhendo com o goo.
6. **Cor do goo por `--chart-*`** (dono, 2026-10-09): auditoria — a silhueta
   `bg-muted` sumia no dark (`--muted` 0.2405 vs `--background` 0.1913, ΔL
   0.05; no light 0.8124 vs 1.0, ΔL 0.19). Os `--chart-1…5` têm o MESMO valor
   em light/dark no tema (tweakcn), então a cor do efeito lê igual nos dois.
   Trial no Lab com 4 opções via prop `blobClassName` (default `bg-chart-2`):
   chart-2 0.6326 (ΔL 0.37/0.44) · chart-3 0.5351 (0.46/0.34) · chart-4
   0.5679 (0.43/0.38) · chart-5 0.4843 (0.52/0.29). Os dois blobs usam a
   MESMA cor (o blur mistura RGB no pescoço do merge). **Veredito do dono:
   chart-2**, com amend — silhueta a **60% de opacidade**; a opacidade vai no
   container da camada filtrada (post-filter), porque o `feColorMatrix` do
   goo satura alpha a partir de ~0.35 (60% dentro do filtro renderizaria
   opaco). Prop removida. **Teste do dono**: `primary` @ 60% no lugar do
   chart-2 — mesmo valor nos 2 temas (0.8487), ΔL 0.15 light / 0.66 dark;
   **validado pelo dono em 2026-10-09** (sutil no light, forte no dark).
