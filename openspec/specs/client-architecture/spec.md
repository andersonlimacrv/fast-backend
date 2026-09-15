# client-architecture Specification

## Purpose
TBD - created by archiving change client-frontend-architecture. Update Purpose after archive.
## Requirements
### Requirement: Layered frontend architecture

The SPA SHALL organize code in `lib/` (transport + constants, no React/DOM), `services/` (domain, no React), `hooks/` (React data layer), `contexts/` (session), `external/` (non-backend integrations), `components/` and `pages/` (composition only), with imports flowing `pages -> hooks -> services -> lib`.

#### Scenario: No direct transport in pages
- **WHEN** the tree is grepped for `@/lib/api` under `src/pages`
- **THEN** nothing matches; pages obtain data exclusively via hooks

#### Scenario: DOM-free transport
- **WHEN** `src/lib/api.ts` is grepped for `window` or `localStorage`
- **THEN** nothing matches; session side-effects live in `services/session.ts`

#### Scenario: Gates stay green
- **WHEN** `npm run build`, `npm run lint` and `npm run test:run` execute
- **THEN** all three exit 0 (tsc + vite, oxlint, vitest)

