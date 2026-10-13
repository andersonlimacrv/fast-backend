# Guia de notificações — push vs blocks (PT-BR)

> [English](notify.md) | 🇧🇷 Português (BR)
>
> Contrato: `client/src/services/notify.ts`. Provider:
> `services/notify.provider.ts` (`goey-toast` por trás). Mount: `AppToaster`
> no `App.tsx` (uma vez). Change:
> `client/openspec/changes/notify-standard/`. Regra:
> `docs/CLIENT-STRUCTURE.md` ("Notificações").

## 1. A divisão (decida antes de codar)

| Sinal | Canal | API |
|---|---|---|
| Resultado de mutação (criado/atualizado/excluído/trocado) | **Push** (transiente, global) | `notify.success/info/warning/error` |
| Tarefa assíncrona com fases | **Push lifecycle** | `notify.promise` |
| Evento global/sessão (expiração, reconexão) | **Push** | `notify.*` a partir de services |
| Falha de carga, persiste até corrigir | **Block** | `ErrorBox` (+ retry) |
| Lista vazia, nada ainda | **Block** | `EmptyState` |
| Falha de rota (página 403/404/500) | **Block** | `ErrorOne` |
| Escolha bloqueante (destrutiva/irreversível) | **Block** | `AlertDialog` |
| Validação de campo de form | **Inline** (nunca push, nunca block) | texto de erro do campo |

A mesma falha nos dois canais é bug. `friendlyError` é a linguagem única
compartilhada por `notify.fromError` e `ErrorBox` — nunca escreva uma segunda
cópia do mapeamento status→texto.

## 2. Contrato push (único import que as páginas precisam)

```ts
import { notify } from "@/services/notify"; // ou useNotify() dentro do React

notify.success("Project created", created.name);
notify.error("Save failed", detail);       // 7s de persistência, demais 5s
notify.fromError(err);                     // ApiError → título+detalhe amigáveis
notify.promise(saveTask, {
  loading: "Saving",
  success: "Saved",                        // string | (data) => string
  error: "Save failed",                    // string | (err) => string
  description: { success: <Text/>, error: (err) => <Text/> }, // opcional
});
notify.close(id);
```

Tipos: `ToastKind`, `NotifyInput`, `NotifyPromiseLabels` — todos de
`services/notify`. `notify.promise` retorna a promise original (aguardável);
título `error` string mantém o detalhe da rejeição via `friendlyError`.

## 3. Variações do site (goey-toast) — o que está exposto, o que é do mount

O mount é dono de: `position` (bottom-right), `theme` (reativo ao `.dark`),
`spring` (desligado com reduced-motion), `maxQueue={3}`. O provider é dono
de: ícones por kind (`lib/icons`), durações (5s/7s). **Não configure isso por
chamada.** Defaults do site mantidos: spring/bounce, Escape, swipe,
timestamp, gap/offset.

Exposto hoje pelo contrato: `description` (string — texto puro; precisa de
corpo ReactNode ou botão de ação? estenda o contrato antes, numa change nova
— nunca importe `goey-toast`/`sonner` na página), `duration` via override
`timeout` (justifique valores não-padrão), lifecycle `notify.promise`.
Disponível mas não exposto: `update`, `classNames`/`fillColor` por toast
(só tokens, com motivo do dono), `preset`, `showProgress`. Pergunte antes de
adicionar superfície — cada adição é contrato + testes + docs.

## 4. Blocks — onde e como

- Block específico de página → `pages/{page}/blocks/` (ex.:
  `pages/admin/blocks/UserError.tsx`). Nada compartilhado mora em `pages/`.
- Só primitivos compartilhados → `components/feedback.tsx` (`ErrorBox` com
  retry `actionLabel`/`onAction`), `components/error-state.tsx`
  (`EmptyState`, `ErrorOne`),
  `components/custom-ui/components/alert-dialog.tsx`.
- `ErrorBox` recebe o `error` cru (ele mesmo roda `friendlyError`).

## 5. Proibido

- Importar `goey-toast`, `sonner`, `framer-motion` ou
  `services/notify.provider` em páginas/hooks/services (só o contrato).
- Segundo ponto de mount (só `AppToaster`), segunda linguagem de erro,
  toast-com-ação (`confirm` aposentado — escolha bloqueante é `AlertDialog`).
- Push para validação ou falha de carga; block + push para a mesma falha.
- Cores fora dos tokens, fontes custom, sombras novas nos visuais de toast.

## 6. Testes e verificação

- Testes de página mockam `@/services/notify` (o contrato — ver
  `Projects.test.tsx`); o mapeamento do provider está coberto em
  `notify.test.ts` (kinds, durações, promise, props do mount, live region).
- Gates: `tsc -b`, `oxlint`, vitest, `vite build`; conferir nos dois temas +
  reduced-motion para qualquer mudança visual em push ou blocks.
