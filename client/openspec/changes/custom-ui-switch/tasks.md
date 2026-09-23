# custom-ui-switch — tasks

## S0 — Change (esta change)

- [x] 0.1 `client/openspec/changes/custom-ui-switch/{proposal,tasks,design}.md`
- [x] 0.2 Inventário dos switches do app (ui/switch usado por Grants, toggle do card, theme-toggle) + medição de contraste light/dark

## S1 — Componente base

- [x] 1.1 `custom-ui/components/switch.tsx`: trilho pill + knob com spring (`layout`), `startContent`/`endContent` com o lado ativo aceso, `role="switch"`/`aria-checked`, foco `ring-2`, reduced-motion
- [x] 1.2 API: controlado/não controlado (`useControlledState`), `width`/`height`, `knobClassName`/`trackClassName`, `transition`, `disabled`
- [x] 1.3 Cores pela **linguagem do Checkbox validado**: ativo = **fundo verde cheio** (`bg-primary`) com knob claro e conteúdos coloridos pelo que está embaixo (9.11:1 no par `primary-foreground`/`primary`); inativo = `bg-background` + borda; `transition-colors duration-500`
- [x] 1.4 Camada de contorno (`design-contrast-borders`), alphas **calibrados pelo dono na validação**: ON `border-primary-foreground/30` e OFF `border-border/50`, iguais no trilho e no knob (mais suaves que o 3:1 geral por decisão estética)

## S2 — Reuso

- [x] 2.1 `theme-toggle.tsx`: o base **não** é usado — o dono decidiu (2026-09-23) que o controle de tema é escolha de estado (sun|moon), não on/off, e volta à implementação própria (restaurada do HEAD, sem primary)
- [x] 2.2 Catálogo: `25 Switch` (`component`/`base`, `ref: SwitchModeToggle.md`, `usedIn: []` — sem consumidor ainda)
- [x] 2.3 Prova no registro de demos (default, off, disabled, small, large, controlado com conteúdo nas metades)

## S3 — Testes + docs

- [x] 3.1 `ui-catalog.test.tsx`: toggle não-controlado + `onCheckedChange`, controlado, `disabled` (35/35 verdes; o teste do theme-toggle segue passando na versão própria)
- [x] 3.2 `review-design.md` §13 (linha do 25) + §15 fechada pela `design-contrast-borders`
- [x] 3.3 `CHANGELOG.md` `[Unreleased]`

## S4 — Verificação

- [x] 4.1 **Ok visual do dono** em `/admin/lab/trials` (card 25) → `status: "validated"` (dono, 2026-09-23; ele mesmo ajustou os alphas das bordas)
- [ ] 4.2 Gates quando pedidos: `tsc+build`, vitest, e2e full, `oxlint`
- [ ] 4.3 Sem commit sem pedido

## S5 — Depois (changes próprias, fora daqui)

- [x] 5.1 Contraste no light (`--ring` + camadas de contorno) → feita na change `design-contrast-borders`
- [x] 5.2a Convergir o toggle do `CreditUsageCard` (07) para este base (dono, 2026-09-23: "deve usar o switch que criamos") — 40×20 controlado, `onCheckedChange` → `onAutoSwitchChange`, `aria-label` + `shrink-0`; o botão `role="switch"` artesanal foi removido
- [ ] 5.2b Convergir `Grants` (hoje em `ui/switch`) para este base
