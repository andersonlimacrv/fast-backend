# custom-ui-avatar-group — design

## Context

O item 23 usa um `AvatarGroup` próprio na raiz (`overlap`, `+N`, `"N online"`) enquanto o dono quer o **`primitives/animate/avatar-group`** (hover desloca o avatar + tooltip por avatar), moldando nosso avatar para dentro e usando nosso tooltip (2026-09-30).

## Goals / Non-Goals

Goals: o primitivo pedido com nosso avatar dentro, nosso tooltip, nosso overflow. Non-goals: convergir o `ui/avatar` (follow-up); validar o item.

## Decisions

1. **Vendored fiel, tooltip COMPOSTO nosso** — o upstream importa o tooltip animate; aqui o primitive usa o **composto** `custom-ui/components/tooltip/tooltip` (a mesma pílula `bg-primary` + seta da sidebar — dono 2026-09-30; a primeira versão usou o primitive nu e o visual diferiu). O export `Arrow` separado morreu: nosso Content já renderiza a seta, como na sidebar. Rejeitado: vendorizar outro tooltip (duplicata).
2. **Pasta `avatar-group/`** — regra do CLIENT-STRUCTURE (2 arquivos), precedente do tabs.
3. **Nosso avatar dentro** — o demo usa shadcn `Avatar/Image/Fallback`; aqui cada filho é o nosso `ui/avatar` (foto + iniciais + dot). Rejeitado: trocar pelo shadcn (perderia presença + regra de ouro dos ícones/avatares).
4. **Overflow nosso** — `max`/`+N` + `"N online"` ficam (o doc não tem, mas é nosso molde validado em uso). O `+N` é estático (sem tooltip/shift — é contador, não usuário).
5. **Tooltip só o nome** — dono (o demo mostra só o nome; presença segue no dot + aria).
6. **Deleção total do raiz, `ui/avatar` fica** — sem dualidade no grupo; sidebar intocada (follow-up S5.1).
7. **Sem fotos externas na prova** — iniciais (offline-first; o demo usa twimg URLs).
8. **Testes por comportamento** — overlap, `+N`, tooltip, presença; jsdom não mede o shift (lab).

## Revisão (dono, 2026-09-30)

9. **API explícita com defaults** — `mode` (multiple|single), `onHover`, `tooltip`, `showPresence`: sempre definidas na API, com defaults (multiple/true/true/false) em vez de TS obrigatório. `single` recebe `user` único (sem shift, só tooltip opt-in); `multiple` com `onHover={false}` cobre grupo estático com tooltips.
10. **Padrão de presença** — 3 estados por token (online `bg-chart-2`, offline `bg-muted-foreground`, inactive hollow com anel `muted-foreground`), `h-3 w-3 border-2 border-background`, canto inferior-direito; `showPresence` default off. Causa do dot invisível: `overflow-hidden` no root + offset negativo = corte; o overflow desce para o wrapper interno.

## Risks / Trade-offs

- [Tooltip aninhado no overlap] → cada avatar tem seu `Tooltip` próprio (como no doc); `side="top"` default com `sideOffset` do doc (25).
- [`whileTap` no container] → upstream tem (`whileTap="hover"`); mantido com guard reduced-motion (casa).
