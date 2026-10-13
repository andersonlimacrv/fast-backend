# gallery-proof-gaps — design

## Context

Gallery.tsx:30-34 renders `DEMOS[slug]` when `hasDemo(slug)`, else the source
path text. Item 22 (Tooltip) and 24 (Collapsible) were the only `validated`
entries missing a key — verified by scanning CATALOG × DEMOS keys.

## Decisions

1. **Prova fiel ao uso real, não ao doc-fonte**: o doc do 22 é o GooeyMenu
   (debug overlay); a prova mostra o tooltip real — pill + seta — com as 3
   direções que o produto usa/pode usar: top (kit default), right + center
   (rail da sidebar, `sidebar.tsx:620-623`) e bottom. `openDelay={0}` como o
   `TooltipProvider` do shell (`sidebar.tsx:135`).
2. **Collapsible pelas 3 reveals**: slide (default do sidebar, transição do
   registry), depth (alternativa) e mask (base do Accordion, spring 150/22) —
   mesma estrutura de comparação do demo do Accordion, com legenda por
   variante.
3. **Guarda estrutural**: teste varre `CATALOG` e falha se algum `validated`
   não tiver demo — o fallback "só o caminho do arquivo" deixa de ser
   possível em silêncio.
