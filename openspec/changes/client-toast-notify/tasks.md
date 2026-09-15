## 1. Base

- [x] 1.1 `@base-ui/react@1.8.0` pinado (+ lock)
- [x] 1.2 `components/ui/toaster.tsx` (`<AppToaster/>` + renderer por `data-type`)
- [x] 1.3 `hooks/use-toast.ts` (`useNotify`) + `services/notify.ts` (manager global + `notifyFromError`) + constants

## 2. Estilo + montagem

- [x] 2.1 `index.css`: keyframes + viewport + swipe
- [x] 2.2 `App.tsx`: `<AppToaster/>` na raiz

## 3. Wiring + testes + gates

- [x] 3.1 Success toasts nos mutations (org/projeto/member/grant/password/switch/logout); createOrg com ação Switch
- [x] 3.2 Vitest: `notifyFromError` + defaults + kinds
- [x] 3.3 `npm run build` + `lint` + `test:run` verdes; `make e2e` 15/15; commit
