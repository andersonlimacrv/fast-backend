# Runbook de Resposta a Incidentes — fast-backend

**Base**: Res. CD/ANPD nº 15/2024 + Art. 48 LGPD (skill `lgpd-incident-response`, modo preparatório).
**Prazos**: ANPD **3 dias úteis** + titulares **3 dias úteis** (mesmo gatilho); complementar em até 20 dias úteis; registro **5 anos**.

## Teste de notificação (Art. 5º Res. 15/2024 — cumulativo)

Notificar **se e somente se**: (A) risco/dano relevante **E** (B) categoria envolvida:
I sensíveis · II crianças/adolescentes/idosos · III financeiros · IV **autenticação** · V sigilo legal · VI larga escala.
Nosso perfil típico: **IV (credenciais/tokens)** e/ou VI. Só A → documentar interno. Nada → registrar mesmo assim.

## T+0h — Detecção

- Registrar timestamp exato do conhecimento da afetação (marco do prazo).
- Acionar Encarregado imediatamente (pendente designação — gap crítico).

## T+0h a T+4h — Contenção (comandos deste repo)

- [ ] Revogar sessões: `POST /auth/logout-everywhere` (usuário) ou `tokens_valid_after=now` + `revoke_all_for_user` (massa)
- [ ] Conter conta: `POST /admin/users/{id}/disable` (staff+, com `reason`)
- [ ] Rodar secrets: `SECRET_KEY`, `BOOTSTRAP_KEY`, `STRIPE_WEBHOOK_SECRET`, senhas SMTP/S3 (fora do repo)
- [ ] Preservar evidências: snapshot do Postgres, `audit_log` (append-only — **não purgar**), logs da app com `request_id`, dump do outbox
- [ ] Fechar vetor: feature flag off (`BILLING_ENABLED`), `ADMIN_ENABLED` se admin comprometido
- [ ] Acionar operadores conforme `.lgpd/vendors/` (SMTP/S3/Stripe/VPS)
- [ ] Comunicação interna restrita (need-to-know). **Não destruir nada.**

## T+4h a T+24h — Avaliação

- [ ] Categorias afetadas (nunca temos sensíveis/menores por desenho — confirmar no caso concreto)
- [ ] Nº estimado de titulares (queries em `users`/`audit_log`, sem expor além do necessário)
- [ ] Vetor/causa raiz preliminar
- [ ] Teste do Art. 5º documentado por escrito (Encarregado + jurídico)
- [ ] Decisão notificar/não-notificar **por escrito**

## T+24h a T+72h — Comunicação

- ANPD: 12 itens (`templates/notification-anpd.md`) via https://www.gov.br/anpd
- Titulares: 7 itens em linguagem simples (`templates/notification-subject.md`), individualizado; coletivo (site + imprensa, mín. 3 meses) se inviável

## T+72h+ — Pós-incidente

- [ ] Mitigação contínua + forense completa + causa raiz (5 whys/post-mortem)
- [ ] Atualizar `.lgpd/incidents/log.md` (+ retenção até data + 5 anos)
- [ ] Remediação com prazos/responsáveis; considerar `lgpd-audit` modo legacy
- [ ] Lições aprendidas → atualizar este runbook
- [ ] Complemento à ANPD em até 20 dias úteis se algo mudou
