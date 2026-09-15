## Context

Vite 8 + React 19 + TS estrito (`verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`), alias `@/*` no tsconfig + vite, shadcn `new-york` em `components/ui` (intocável), Tailwind v4 CSS-first. Sem React Query por decisão (SPA de visualização dev; `useEffect` + hooks próprios bastam). `oxlint` + `tsc -b` já existem. Estilo vigente: `import type` separado, `void promise` em handlers, `cn()` para classes.

## Goals / Non-Goals

**Goals:**
- Cada conceito tem uma casa; cada página compõe em vez de repetir.
- Transporte sem DOM (testável em Node), domínio sem React (testável puro), React só em hooks/contexts/pages.
- Zero mudança de comportamento: mesmos endpoints, payloads, fluxos.

**Non-Goals:**
- Abstração especulativa (sem `data-table` genérico, sem client de query).

## Decisions

1. **Transport recebe `onUnauthorized` injetado** — `lib/api.ts` nunca toca `window`/`localStorage`; `services/session.ts` fornece o callback (limpa + emite `SESSION_EVENT`). Refresh único (`refreshPromise`) permanece no transporte.
2. **Services finos com trabalho real, não pass-through burro** — cada service normaliza algo: grants parseia limit, audit unifica o alias de metadata, session guarda o evento. O resto estabiliza assinatura para os hooks.
3. **`useAsync` com guarda de unmount** — flag `cancelled` (falta hoje; StrictMode remonta e pode setar state largado).
4. **`external/` = fora do nosso backend** — estreia com `theme.ts` (DOM); nada de HTTP nosso entra aqui.
5. **`contexts/` no plural, `auth/` removido** — segue a convenção pedida (hooks, lib+constants, contexts, services, external); `App.tsx` atualiza 1 import.
6. **Vitest sem MSW nesta change** — services/hooks testados puro + `renderHook`; páginas ficam p/ follow-up com MSW.
7. **Troca `refresh_token: ""` nunca clobbera** — regra já implementada no transporte, preservada e coberta por teste.

## Risks / Trade-offs

- [Mover tipos quebra `verbatimModuleSyntax`] → build (`tsc -b`) como gate; `import type` preservado.
- [Duplicar tipos TS vs Pydantic] → aceito (fronteira explícita); E2E 15/15 detecta deriva.
- [oxlint pode implicar com novos arquivos] → `npm run lint` no gate antes do commit.
- [Alternativa rejeitada: TanStack Query] → runtime + cache semântico desnecessários p/ SPA dev; hooks próprios (~40 linhas) bastam.
