# segmented-usage-bar — design

## Context

A barra do card 07 nasceu do doc (`ExempleLayours.md/CreditUsageCard.md`): `[...Array(75)]` com `flex-1 rounded-sm` e, no doc, `bg-primary`/`bg-muted` sem borda. Na nossa calibração de contraste (`design-contrast-borders`) as células preenchidas ganharam `border` (1px) e as vazias não — o que o dono viu como "espaçamento diferente" entre as barras.

## Goals / Non-Goals

Goals: um componente controlado, com célula uniforme e prova interativa para validar. Non-goals: nova entrada de catálogo, slider em produção, mexer na label/cores fora do que já foi validado.

## Decisions

1. **Célula idêntica em ambos os estados** — todas com `border` e `border-transparent` nas vazias: a soma `borda + fundo` fica igual nas duas, eliminando a assimetria de 2px que o `border-box` aplicava só nas preenchidas. Rejeitado: tirar a borda das preenchidas (perderia o rim `/60` validado e a aresta contra o trilho).
2. **Grid em vez de `flex-1`** — `grid-template-columns: repeat(segments, minmax(0, 1fr))` inline garante trilhas exatamente iguais (o `flex-1` distribui frações e o arredondamento do dispositivo muda célula a célula). Inline porque a contagem é dinâmica e classe Tailwind arbitrária gerada em runtime não entra no build.
3. **Altura por `heightPx` inline** (default 14 = `h-3.5`) — pedido do dono ("altura com um default, mas pode ser passado por parâmetro") e imune ao mesmo problema de classe dinâmica.
4. **Controlado, sem estado** — `value` manda; o componente não guarda nada (o card já clampa). `max` existe para reuso (a barra serve qualquer escala); guard `max <= 0` evita `NaN`.
5. **Fade preservado** (`opacity: 1 - i * 0.004`) — decisão do dono: é o efeito do doc e o componente deve ser validado com ele ligado.
6. **Prova interativa só no lab** — `<input type="range">` na demo do item 07, controlando `usedCreditsPercent`; o card de produção continua sem controles, e o valor da label (`{clamped}%`) e a barra leem o mesmo estado (o pedido: "componente controlável, ligado ao valor mostrado na label"). A prova ganhou também um switch de `animateOnMount` (remonta via `key` para repetir o fill) e a seção **"Modules of this block"** com os módulos renderizados separados e legendados — a modularização visível.
7. **Slider do lab com CSS dedicado** (`.lab-range`) — o thumb nativo é two-tone e o knob era cortado pelo `h-1.5` do input; pseudo-elementos (`::-webkit-slider-thumb`, `::-moz-range-thumb`, tracks) não são endereçáveis por utilitário inline, então o harness usa `@layer components` no `index.css` com tokens (`--primary` no knob + rim `--primary-foreground`, `--muted` no trilho). Rejeitado: `accent-primary` (não estiliza geometria e mantém o two-tone).
8. **Mount fill no card, não na barra** — a label mora no card, então o driver (`animate(0 → alvo)`) vive nele e **um único valor pintado** alimenta label e barra (mesmo racional do 04: um driver, zero drift). `jumpsToTarget` derivado em render evita frame desnecessário com reduced-motion/`false`; o `data-current-value` no root dá o gancho de teste. A barra continua 100% controlada — recebe o pintado em `value` e o real em `ariaValueNow` (o aria não deve anunciar valor intermediário; padrão do 04).
9. **Contrato *entry-only* + perf** (dono, 2026-09-23: o slider criava "um pequeno bug" com `animateOnMount` ligado) — o alvo da entrada é **travado no mount** (`entryTarget`) e uma flag `settled` marca o fim: mudança de prop **durante ou depois** do fill liquida na hora (o cleanup já existente para o tween em voo), então o slider segue o dedo e **nenhum tween de 1s persegue cada tick** nem se sobrepõe. Perf: `onUpdate` arredonda para 1 casa (a precisão da label) e ignora frames no-op antes do `setState`, e o `onComplete` crava o alvo — nada de loop em repouso (verificado: sem setState após assentar). O consumo é um tween curto na entrada; o slider fora dele é render puro. Rejeitado: manter o alvo nas deps (era a origem do bug) e desabilitar o slider durante o fill (o dono quer poder arrastar).
9. **Tipografia do valor** — `font-mono tabular-nums` (decisão do dono na validação; o harness já usava) mantendo `text-2xl font-medium sm:text-3xl`; dígitos tabulares também evitam tremor durante a contagem.
10. **Sem entrada nova no catálogo** — a barra é parte do item 07 (`source` segue `components/billing/credit-usage-card.tsx`); se virar componente de página (KPI, consumo por org), aí ganha entrada própria.

## Risks / Trade-offs

- [Borda transparente nas vazias] → custo zero visual (não pinta) e é o que iguala as caixas; a cor fica por conta do `bg-muted-foreground/70` validado.
- [Teste automatizado não mede pixel] → a igualdade de ritmo é aceita visualmente no lab (0/25/50/75/100, dois temas); o teste automatizado garante a **estrutura** (mesma caixa/contagem/aria).
- [Duplicação de constante] → `segments` default 75 vive no componente; o card não repete a const.
