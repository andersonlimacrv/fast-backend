# run-action-button-type — design

## Context

Owner verdict (2026-10-09): item 16 behavior ok, type too big for the app.
House type scale: `text-sm font-medium` (buttons, sidebar, uploaders).

## Decisions

1. **Só escala, sem redesign** — altura 64px, stages e larguras idle/done
   intactos; só a largura running encolhe (360 → 320) porque o label maior
   ("Sharing Survey Report") precisa de menos espaço a 14px.
2. **Ícones acompanham** (`h-6` → `h-5`): ícone 24px ao lado de texto 14px
   herdaria o mesmo problema de escala.
3. **Tokens intocados** — auditoria S0: zero hardcode (sem hex/zinc/`text-[…]`
   de cor); mudar token aqui seria churn sem pedido.
4. **Centro só onde não há X** (dono, correção): idle + done ganham
   `justify-center`; o running tem o affordance de cancelar e segue
   `justify-between` — centralizar ali deslocaria o label ou exigiria tirar
   o X do fluxo, o que não foi pedido.
