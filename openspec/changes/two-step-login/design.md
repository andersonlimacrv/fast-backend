## Context

`Auth.tsx:10-64` (form único, `navigate("/")` já migrado p/ `ROUTES.app`); `AuthContext:83-91` (`login(email,password)`); `service.py:82-105` (throttle → load → verify → mint); `hashing.py:39-74` (`verify`/`verify_and_update`); Dialog disponível em `@base-ui/react/dialog` (mesma lib do `Toast` em `toaster.tsx:1`).

## Goals / Non-Goals

**Goals:** email-primeiro sem oráculo (resposta, corpo e custo); modal acessível reutilizando a forma.
**Non-Goals:** revelar existência; alterar contrato/throttling.

## Decisions

1. **Always-advance** — a etapa 1 só valida formato; qualquer email válido mostra a senha. Erro de credencial só após tentativa real, genérico (`friendlyError` 401 existente). Rejeitado: checagem de existência (oráculo explícito, contradiz forgot-202).
2. **Dummy verify lazy no service** (`self._dummy_hash` gerado no 1º miss, `secrets.token_hex`) — iguala o custo Argon2 sem custo de startup nem migração. Rejeitado: sleep fixo (frágil a hardware distinto) e hash em settings (segredo parado à toa).
3. **`LoginForm` desacoplado de rota** — props `onDone` opcional; `LoginPage` e `LoginModal` embrulham. Rejeitado: duplicar a forma (divergiria).
4. **Modal = Base-UI Dialog** — foco/Esc/portal prontos, mesma dependência do toast; sem CSS de animação custom (trivialmente `prefers-reduced-motion`-safe).

## Risks / Trade-offs

- [`register` 409 continua enumerável → aceito e documentado: registro precisa dizer "email em uso"; mitigação é throttling, já existente] → ADR.
- [Dummy hash por instância de service → workers distintos têm hashes distintas; irrelevante, só custo importa] → sem estado compartilhado.
- [Teste de timing real é flaky → não assertar tempo; assertar chamada `verify` + corpo idêntico] → determinístico.

## Migration Plan

Sem migração. Deploy normal; comportamento observável só em latência de email-inexistente (agora ≈ real).

## Open Questions

- Nenhuma bloqueante.
