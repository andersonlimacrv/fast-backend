# DSAR — Workflow e Direitos do Titular (Art. 18)

**Versão**: v1 — especificação (2026-09-16)
**Skill**: `lgpd-dsar` (endpoints Next.js da skill adaptados para FastAPI abaixo)
**SLA**: 15 dias corridos (Art. 19, II) — inexistente operacionalmente hoje (gap)

## Mapa dos 9 direitos → estado atual

| # | Direito | Estado hoje | Proposta |
|---|---|---|---|
| I | Confirmação de existência | ✅ `GET /auth/me` (autenticado) | manter |
| II | Acesso aos dados | 🟡 parcial (`/auth/me` + `GET /organizations`; sem bundle) | `GET /auth/me/export` (JSON: perfil, orgs, memberships, grants, audit próprio) |
| III | Correção | 🟡 parcial (só troca de senha) | `POST /auth/me/email-change` (novo e-mail + verificação por link, invalida sessões) |
| IV | Anonimização/bloqueio do desnecessário | 🟡 parcial (admin `disable`; sem self-service) | incluir no fluxo de eliminação |
| V | Portabilidade | 🔴 inexistente | `GET /auth/me/export?format=portable` (mesmo bundle de II, JSON canônico) |
| VI | Eliminação | 🔴 inexistente (só `disable` por staff) | `POST /auth/me/erasure` (job diferido + cascata + prova; respeita retenção L5) |
| VII | Info sobre compartilhamento | 🟡 `PRIVACY.md` declara; sem endpoint | `GET /auth/me/sharing` (SMTP/S3/Stripe por deploy, do L4) |
| VIII | Info sobre não consentir | N/A (nenhum tratamento por consentimento) | nada a fazer |
| IX | Revogação de consentimento | N/A (idem) | nada a fazer |
| — | Revisão de decisão automatizada (Art. 20) | N/A (sem decisões automatizadas) | nada a fazer |

## Intake (3 canais mínimos)

1. **API self-service**: endpoints acima (autenticado = identidade verificada).
2. **Formulário web**: futuro (hoje: login two-step existe; DSAR via `PRIVACY_CONTACT`).
3. **Canal do Encarregado**: `PRIVACY_CONTACT` documentado; Encarregado ainda não designado (gap crítico).

## Verificação de identidade

- Autenticado: suficiente. Não pedir dado adicional como condição (Art. 6º, III).
- Eliminação: exigir confirmação dupla (senha atual +Digitação do e-mail) + invalidar todas as sessões no ato.

## Fulfillment (quando implementado)

- Acesso completo: job Taskiq gera bundle → outbox `email.template` avisa titular → download autenticado com expiração.
- Correção de e-mail: link de verificação p/ novo endereço (reuso do padrão `password_resets`); `tokens_valid_after=now` + revoke geral na troca.
- Eliminação: checar retenção (L5); sem obrigação → hard delete com cascade (`users` → credentials, tokens, resets, memberships; orgs owned transferidas ou anonimizadas — decisão de produto pendente); com obrigação → bloqueio lógico.
- Toda etapa gera audit: `dsar.received/fulfilled/rejected` (novas ações `admin.*`-like, com `reason`).

## SLA operacional (a implementar)

Fila com `due_at = received + 15d`, alertas em 10d/13d (Taskiq beat), dashboard staff (reuso de `/admin/*`), registro de prova por 5 anos.

## Status (formato da skill, adaptado)

- Endpoints: 1/9 completos (I), 3 parciais (II, III, VII), 3 inexistentes (V, VI + correção de e-mail), 3 N/A
- UI: sem tela "Meus Dados" (Account tem senha/logout; estender na implementação)
- SLA configurado: não (gap)
- Backlog atual: 0 pedidos (sem canal formal)
- Próximo: proposta de change `dsar-endpoints` (fora desta auditoria)
