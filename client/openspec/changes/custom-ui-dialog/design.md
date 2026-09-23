# custom-ui-dialog — design

## Context

O item 09 (`Dialog.md` — animate-ui `components-base-dialog`) está `pending`; a base `/ui/dialog.tsx` tem motion embutido (dívida §14) e o único importador é a prova do lab. O irmão destrutivo (03) já tem porte próprio validado em `/custom-ui/components/alert-dialog.tsx`: portal gated por `AnimatePresence` (entrada e saída), backdrop com fade + blur, popup com flip 3D e `from` default `bottom` (DESIGN.md §7, diretriz 6), spring 500/32 (faixa 120–250ms do §7) e reduced-motion.

O doc do 09 descreve o **composto** sobre o primitivo, com `from`, `showCloseButton` e classes de layout próprias — a base `/ui` não tem nada disso (sem botão de fechar, animação `scale/y` de wrapper).

## Goals / Non-Goals

Goals: porte fiel do composto (aesthetics + props do doc) com a coreografia do primitivo e os deltas do nosso sistema; dívida §14 do dialog resolvida; prova na demo do doc. Non-goals: consumidores de produção (não há), mudar `AlertDialog` (03), tokens.

## Decisions

1. **Reusar a arquitetura do 03 (validado) em vez da do `/ui`** — mesma espinha: contexto + `useControlledState`, portal gated por `AnimatePresence` + `keepMounted`, backdrop motion e popup com flip via `Viewport` (o centro não usa `transform`, deixando o transform livre para o flip). Rejeitado: copiar o `/ui/dialog.tsx` (wrapper `motion.div` com `scale/y` sem exit — não tem o flip do doc nem o botão de fechar).
2. **Nome `DialogContent` para o `DialogPopup` do doc** — precedente do 03 (`AlertDialogContent`), que é o nome que a casa já usa; as props do doc são todas portadas (`from`, `showCloseButton`, `transition`). Rejeitado: exportar dois nomes (superfície duplicada).
3. **`from` default `bottom`** (e não `top` como no upstream) — convenção global de overlays do app, registrada no DESIGN.md §7 na validação do 03 (dono). O doc segue disponível via prop.
4. **Spring 500/32** (upstream 150/25) — token do dono para overlays (~0.25s de settle), dentro da faixa de 120–250ms do §7 e igual ao 03; blur travado em 4px e backdrop em 0.15s `easeInOut` (o upstream anima `filter: blur()` no backdrop chapado, invisível — aqui o efeito visível é `backdrop-blur-sm` estático + fade).
5. **`showCloseButton` portado com o X do doc** — botão `absolute top-4 right-4` (o painel ganha `relative` porque aqui ele não é `fixed` — o centramento é do `Viewport`), `opacity-70 → hover:100`, ícone via `lib/icons` e `<span className="sr-only">Close</span>`; foco em `ring-2` (DESIGN.md §8) em vez do `ring-offset-2` do upstream.
6. **Layout copiado do 03 `AlertDialog`** (dono, 2026-09-23: "copie o padrão de AlertDialog para manter consistência visual") — o que o doc traz de layout próprio foi trocado pelo do irmão validado: painel `w-full max-w-md rounded-lg border p-6 shadow-lg` (o doc: `grid gap-4 … sm:max-w-lg`), header `mb-4 gap-1.5` (doc: `gap-2 text-center sm:text-left`), título `text-lg font-bold tracking-tight` (doc: `text-lg leading-none font-semibold`) e footer `mt-5 …` (doc: marginless). O que o 09 tem de próprio e fica: `showCloseButton` (X + sr-only "Close") e `from`/flip.
7. **Superfície `bg-card text-card-foreground`** — mesma escolha do 03 (no dark o `--card` é um degrau acima do `--background`, dando a leitura de "camada por cima"); o doc usa `bg-background`.
8. **Testes de comportamento, não de pixel** — 2 casos (abre/fecha pelo X; `showCloseButton={false}` + `DialogClose`), espelhando o teste do 03; o flip/`from` é validado visualmente no lab.

## Risks / Trade-offs

- [Título com peso diferente do 03] (`font-semibold` do doc vs `font-bold` do nosso 03) → registrado na nota do catálogo; se o dono preferir unificar, é um ajuste de uma classe nos dois (decisão dele na validação).
- [Sem consumidor de produção] → `usedIn: []`; o valor imediato é a dívida §14 e o par overlay completo (03 destrutivo + 09 neutro).
- [Duas nomenclaturas de overlay no doc] (`DialogPopup` upstream vs `DialogContent` nosso) → nota do catálogo aponta o mapeamento.
