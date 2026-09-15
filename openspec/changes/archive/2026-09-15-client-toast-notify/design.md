## Context

Base-UI 1.8 (`@base-ui/react/toast`): `Toast.Provider` (`limit`, `timeout`, `toastManager`), `Toast.createToastManager()` global (add/close/update/promise fora do React), `Toast.useToastManager()` reativo dentro do renderer, primitivos Portal/Viewport/Root/Content/Title/Description/Action/Close, objeto `{id,title,description,type,timeout,priority,actionProps,data,onClose}`, atributo `data-type` e vars `--toast-*` para estilo. React 19 OK.

## Goals / Non-Goals

**Goals:** um caminho tipado para feedback transitório, chamável de dentro e fora do React, com o visual do tema (tokens + dark).
**Non-Goals:** substituir `ErrorBox`; prometer async nos mutations.

## Decisions

1. **Manager global + hook fino** — `services/notify.ts` cria o manager e o Provider o consome; `hooks/use-toast.ts` expõe os mesmos helpers via `useToastManager()` para componentes. Sem Context próprio (seria provider só para repassar o que o módulo já resolve).
2. **Tipos fechados** — `ToastKind = "success" | "info" | "warning" | "error"`; `confirm` = kind + `actionProps` obrigatória. Renderer mapeia kind→ícone lucide e `data-type`→tinta (success/error usam chart/destructive; warning/info usam accent).
3. **Timeouts**: default 5000 (provider), error 7000, confirm sem auto-dismiss (`timeout: 0`).
4. **CSS no `index.css`** — keyframes `toast-in/out` + swipe via `data-starting-style`/`data-ending-style` + `--toast-swipe-*`; viewport `fixed bottom-4 right-4 z-[100]`.
5. **`notifyFromError`** usa `friendlyError` existente (título por status) — mesma linguagem do inline.
6. **Wiring mínimo real** — success em cada mutate das páginas + ação "Switch" pós-createOrg; nada de toast em erro de form.

## Risks / Trade-offs

- [Base-UI API instável entre minors] → pin exato 1.8.0 + lock; facade própria isola chamadas.
- [Toast fora do Routes não vê router] → confirm com navegação usa `window.location`? Não: actions executam callbacks já no contexto do caller (que tem `navigate`). Sem problema.
- [oxlint `no-unused-vars` nos types] → gates antes do commit.
