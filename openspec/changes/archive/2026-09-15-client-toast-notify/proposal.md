## Why

A SPA informa tudo inline (`ErrorBox`) ou em silêncio: mutations bem-sucedidas (criar org/projeto, trocar tenant, logout) não dão feedback transitório, e eventos globais (sessão expirada) dependem de banner local por página. O shadcn atual padroniza isso em toast Base-UI (`type`, `actionProps`, manager global). Sem padrão, cada página inventa o seu.

## What Changes

- Dep `@base-ui/react` 1.8.0 (pin exato).
- `components/ui/toaster.tsx`: `<AppToaster/>` (Provider + Portal + Viewport + renderer com ícone por `data-type`, Action, Close), montado na raiz do `App.tsx`.
- `hooks/use-toast.ts`: `useNotify()` tipado (`success/info/warning/error/confirm`) sobre `Toast.useToastManager()`.
- `services/notify.ts`: mesmos helpers sobre o manager global (fora do React) + `notifyFromError(err)`.
- `lib/constants.ts`: `TOAST_LIMIT`, `TOAST_TIMEOUT_MS`.
- `index.css`: keyframes enter/exit/swipe (Tailwind v4 puro).
- Wiring: success toasts nos mutations (org/projeto/member/grant/password/switch/logout); createOrg com ação "Switch". Erros de form permanecem inline.
- Vitest: mapeamento `notifyFromError` + defaults.

## Capabilities

### New Capabilities

- (vazio — estende `client-architecture`)

### Modified Capabilities

- `client-architecture`: regra de feedback (transitório via notify, erro de form inline).

## Impact

- Só `client/` (+ lock). Nenhum endpoint muda; E2E 15/15 como rede.

## Non-goals

- `toast.promise`, sons, migrar `ErrorBox` para toast, sonner.

## Acceptance criteria

1. `npm run build` + `lint` + `test:run` verdes.
2. Toast manual por tipo (success/info/warning/error/confirm) renderiza com ícone e some sozinho.
3. `make e2e` 15/15; `git status` sem segredo.
