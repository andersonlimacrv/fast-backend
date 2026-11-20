# custom-ui-copy-button — design

## Context

`custom-ui/components/copy-button.tsx` já era o porte do `CopyButton` do animate-ui, mas numa versão magra: hover/tap num `motion.span` externo, `ui/button` como base visual e um **fade** na troca de ícone. O componente composto do site (`components-buttons-copy`) tem cva própria (7 variantes, tamanhos quadrados) e a troca de ícone por `AnimatePresence mode="popLayout"` com `scale + blur` — que é a assinatura visual.

## Goals / Non-Goals

Goals: portar o composto (estética + efeito) mantendo a API documentada e a produção intacta. Non-goals: portar o `primitives-buttons-button` inteiro (o hover/tap cabe no `motion.button`), editar `/ui`, validar pelo dono.

## Decisions

1. **Portar o composto com cva local, não reusar o `ui/button`** — as variantes e os tamanhos do site são quadrados (`size-9` etc.) e o `ui/button` é a base shadcn (não se edita). A cva fica no arquivo do `custom-ui`, como no site. Rejeitado: passar `variant`/`size` para o `ui/button` (não cobre as variantes do site e misturaria semântica).
2. **Troca de ícone por `AnimatePresence mode="popLayout"` + `scale`/`blur`** — é o efeito do site; o nosso era um fade de 0.12s. `popLayout` mantém o botão sem “pular” quando o glyph sai e entra. Rejeitado: manter o fade (era o que não parecia com o site).
3. **Default do cva = site (`variant: default`, `size: default`) e produção com `variant="ghost"` explícito** — o componente fica fiel ao site; os usos inline ao lado de IDs (Orgs/Users) mantêm o visual discreto que já tinham. Rejeitado: mudar o default para `ghost` (menos fiel) e deixar a produção preenchida (regressão visual silenciosa).
4. **`tapScale` exposto (0.95); `hoverScale` do upstream removido** — o dono rejeitou o crescimento no hover (2026-09-19, mesma decisão do Checkbox), então o botão reage só ao **press**. A prop `hoverScale` não é exposta (não deixamos knob morto) e o `whileHover` saiu do elemento. Rejeitado: manter o default 1.05 com a prop para desligar (era o pedido explícito: retirar).
5. **Sem `console.error` e com timer limpo** — clipboard negado segue no ícone de copiar (sem log com o conteúdo, alinhado ao §6 do RULES) e o `setTimeout` é limpo no unmount (o upstream não limpa). Rejeitado: copiar o `console.error` do site.
6. **Elemento é `motion.button` simples** — o primitive do site usa `Slot`/`asChild`; nenhum consumidor nosso usa isso, e o `Slot` do repo vive em `custom-ui/components/slot.tsx`. Se aparecer necessidade, é aditivo.

## Risks / Trade-offs

- [Trocar de `ui/button` para cva local muda detalhes de foco/sombra] → foco vai a `ring-2` (DESIGN.md §8) e as sombras seguem as do site (`shadow-xs`); registrado no `review-design` §13.
- [Produção tocada em 3 pontos] → apenas `variant="ghost"` explícito, preservando o visual anterior; nenhum outro comportamento muda.
- [`filter: blur()` na troca de glyph] → bounded (4px), 0.25s, já é exceção consciente da mesma família registrada no §13 (alert-dialog).
