# RIPD — Administração global (A006)

**Versão**: v1-draft · 2026-09-16 · **Decisão pendente de Encarregado/jurídico**
**Skill**: `lgpd-ripd` (metodologia: teste Res. 2/2022 Art. 4 + ISO 31000)

## 1. Identificação
Atividade A006 (admin cross-tenant staff/root) · Controlador: fast-backend (razão social a preencher) · Encarregado: pendente · Equipe: backend-implementer · Data: 2026-09-16.

## 2. Contexto e objetivo
Operar a plataforma: suporte, moderação, contenção de incidentes. Sem acesso administrativo não há operação — mas é o acesso mais amplo do sistema (leitura/escrita cross-tenant por humanos).

## 3. Descrição do tratamento
`POST /admin/*` → `require_staff/require_root` → `SuperuserContext(reason=...)` explícito → Postgres direto → audit `admin.*` com `reason+success`. Single-root (`uq_single_root`), `reason` obrigatório (≥8). Sistemas: Postgres + `audit_log`. Operadores: nenhum.

## 4. Necessidade e proporcionalidade
Acesso nominal mínimo por operação (sem export em lote, sem leitura irrestrita programática). Alternativas consideradas: escopos por operação (melhoria futura, `.lgpd/lia/a006.md`); self-service DSAR reduziria necessidade (L7, change futura).

## 5. Princípios (Art. 6º)
Finalidade/adequação/necessidade: atendidos com ressalva (leitura ampla justificada por operação + audit). Transparência: `PRIVACY.md` declara o acesso. Segurança: papéis mínimos, root único, `reason` obrigatório. Demais: N/A.

## 6. Base legal
Art. 7º, IX — legítimo interesse, com LIA em `.lgpd/lia/a006.md` (decisão pendente).

## 7. Direitos do titular
Oposição a ato administrativo concreto via `PRIVACY_CONTACT`; eliminação segue fluxo DSAR (L7). Sem decisão automatizada (Art. 20 N/A).

## 8. Riscos (ISO 31000)

| ID | Risco | P | I | Nível | Status |
|---|---|---|---|---|---|
| R001 | Insider abusa do acesso (leitura/alteração indevida) | 2 | 5 | 10 (alto) | mitigado parcial (reason auditado, papéis mínimos; sem revisão periódica de acessos — gap) |
| R002 | Comprometimento de conta staff/root | 2 | 5 | 10 (alto) | mitigado parcial (mesmas proteções de A001 + `logout-everywhere`; sem MFA — gap) |
| R003 | `reason` genérico esvazia accountability | 3 | 3 | 9 (médio) | aberto (sem validação semântica; mitigação futura: catálogo de motivos) |
| R004 | Erro operacional (disable em massa, membership errada) | 2 | 3 | 6 (médio) | mitigado parcial (confirmação na UI + último-owner/root protegidos) |

## 9. Salvaguardas
Técnicas: `require_staff/require_root`, single-root parcial-único, `reason` ≥8 obrigatório, audit append-only, mesmas de A001 p/ credenciais. Administrativas: mudanças só via change aprovada; sem acesso direto ao banco fora de runbook. Organizacionais: a definir (revisão trimestral de acessos staff — proposto).

## 10. Risco residual
**Médio**: R001/R002 persistem sem MFA e sem revisão periódica de acessos. Aceitável **condicionado** a: implementar MFA p/ staff/root + revisão trimestral (registrar como follow-ups) e manter trilha íntegra.

## 11. Consulta a partes interessadas
Técnica: feita. Titulares/Encarregado/jurídico/seg-info: **pendentes**.

## 12. Decisão
- [ ] Prosseguir como planejado
- [ ] Prosseguir com modificações: {quais (ex.: MFA, revisão trimestral)}
- [ ] Não prosseguir
- [ ] Consultar ANPD previamente

**Aprovado por**: {Encarregado} · **Data**: {—}

## 13. Revisão
Anual ou ao mudar: modelo de papéis, incidente envolvendo staff, novo endpoint privilegiado.
