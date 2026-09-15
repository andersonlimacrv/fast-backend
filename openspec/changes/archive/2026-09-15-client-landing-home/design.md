## Context

`App.tsx:20-29` (`Protected`), `:38` (index = Dashboard), `:51` (`*` → `/`); `constants.ts:14-29` (`ROUTES`); `useAudit.ts:4` (padrão de hook); `services/grants.ts:7` (padrão de helper puro testado); `index.html` sem terceiros.

## Goals / Non-Goals

**Goals:** landing informativa e resiliente; `/~` como home logada; zero regressão nas rotas existentes.
**Non-Goals:** modal/two-step, auth nova, analytics.

## Decisions

1. **Layout público separado** (não reutilizar `Layout`) — o `Layout` carrega seletor de org, logout e footer de sessão; landing tem header próprio mínimo (marca + status + Login/Criar conta). Rejeitado: condicionais no `Layout` (poluiria o shell logado).
2. **Fallback estático versionado no código** (`DEFAULT_META`: versão do `client/README`? não — literal `"unknown"` + módulos sem flag) — landing informa "offline" em vez de mentir dados. Rejeitado: esconder seções (página esqueleto confunde).
3. **Descrições dos módulos em `services/meta.ts`** (EN, 1 linha cada) — conteúdo é domínio de apresentação, não transporte; testável por snapshot? não — por chaves (toda `key` do `/meta` tem descrição; chave desconhecida ganha fallback genérico, nunca quebra).
4. **Redirects declarativos** (`Navigate`) — `/` logado → `/~`; `Protected` → `/`. Rejeitado: guardar "returnTo" (escopo extra; follow-up).

## Risks / Trade-offs

- [Rota `/~` pode estranhar proxy reverso → char unreserved (RFC 3986); aceite cobre direto + refresh] → fallback: renomear p/ `/app` sem custo.
- [SEO irrelevante (ferramenta dev local)] → sem meta-tags além de `title`/lang existentes.

## Migration Plan

Aditivo + 3 linhas movidas (`App.tsx`, `constants.ts`). Rollback = reverter commit.

## Open Questions

- Nenhuma bloqueante.
