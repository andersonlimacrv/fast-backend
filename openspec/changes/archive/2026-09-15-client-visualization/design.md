## Context

Backend v1.0.0 entregue e congelado (`app/main.py`, `app/modules/*/router.py`); nenhum `app/` muda. Falta só visualização HTTP. Constraints: Vite SPA (veto a Next.js), Tailwind v4 CSS-first, shadcn `new-york`, tweakcn via variáveis oklch, `docs/RULES.md §8` (frontend era non-goal do v1 → isolar em `/client/`), `CORS_ORIGINS=[]` por default. Backend ainda não rodado nesta máquina — shapes validados no código, não no fio.

## Goals / Non-Goals

**Goals:**

- Scaffold Vite React-TS isolado que roda com `npm run dev` e `VITE_API_URL`.
- Auth com refresh ciente de rotation/reuse + seletor de org (`switch-organization`).
- Telas legíveis para health, auth, orgs/members, projects, grants, audit.

**Non-Goals:**

- SSR, Next.js, PWA, i18n completo, testes e2e com browser, checkout Stripe, mudança de contratos `app/`.

## Decisions

- **Vite `react-ts` + `react-router-dom` (SPA) over Next.js**: usuário vetou Next; visualização não precisa de SSR/SEO. Alternativa descartada: Next App Router.
- **Tailwind v4 `@tailwindcss/vite` CSS-first over `tailwind.config.js`**: v4 remove config JS; `@theme` em `src/index.css` é o caminho oficial e o único compatível com tweakcn. Alternativa descartada: v3 com config.
- **shadcn `new-york` + `components.json` + alias `@/*` over hand-rolled UI**: reutiliza Button/Input/Card/Dialog/Select/Table/Sonner já testados; tweakcn gera vars nesses tokens. Alternativa: MUI/Chakra (pesados, fora do pedido).
- **tweakcn como bloco `:root/.dark` oklch over tema manual**: garante contraste e `dark` por classe (`@custom-variant dark`). Preservar nomes `--background/--primary/--muted/--border/--ring/--radius/--chart-*/--sidebar-*`.
- **Skill `vercel-labs/agent-skills@vercel-react-best-practices` (713k installs) como runbook principal; `igorwarzocha/opencode-workflows@vite-shadcn-tailwind4` (117) só como referência auditada**: primeira é oficial e popular; segunda é match exato mas com poucos installs → não instalar sem auditoria, registrar ambas em `docs/SKILLS-REGISTRY.md` antes de qualquer `npx skills add` (regra do repo).
- **Fetch + `AuthContext` com fila de refresh over axios-interceptors**: sem dependência extra; 1 refresh em voo (Promise compartilhada), retry 1x, reuse→logout. TanStack Query avaliado e adiado (overkill p/ visualização).
- **Tokens em `localStorage` (dev-only) over cookies HttpOnly**: backend v1 usa Bearer header, não cookie; documentar nunca usar em prod sem BFF.

## Risks / Trade-offs

- [Risk] `CORS_ORIGINS=[]` bloqueia `localhost:5173` → Mitigação: documentar `CORS_ORIGINS=http://localhost:5173` no `.env` local + tela Health mostra erro de CORS legível.
- [Risk] Backend não rodado → shapes de erro/audit podem divergir → Mitigação: camada `api.ts` tolerante (`unknown`→mensagem) + validação final contra `docker-compose up` + `readyz`.
- [Risk] Reuse de refresh derruba family inteira (by design) → Mitigação: UX trata como logout global esperado.
- [Risk] Skill de poucos installs com script malicioso → Mitigação: ler `SKILL.md` antes, pin por SHA/tag, instalar em `.opencode/skills/` do repo, nunca global sem registro.
- [Risk] Tailwind v4 + shadcn versions drift → Mitigação: pinar `tailwindcss@^4`, `@tailwindcss/vite@^4`, `react@^18/19` conforme template Vite no dia da execução; `npm run build` como gate.

## Migration Plan

1. Merge só adiciona `/client/` + docs; backend continua deployável sozinho.
2. Rollback: apagar `/client/` não afeta `app/`.
3. Deploy da SPA fora do escopo (visualização local); se publicar, servir `dist/` estático atrás do mesmo domínio ou liberar CORS explícito.

## Open Questions

- Gerenciador: `npm` vs `pnpm`? (default `npm` salvo objeção — não muda specs/design).
- Porta da API local fixa em `8000`? (default sim via `VITE_API_URL=http://localhost:8000`).
