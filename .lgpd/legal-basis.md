# Bases Legais por Atividade de Tratamento

**Última atualização**: 2026-09-16

> Nenhuma atividade trata dados sensíveis (Art. 5º, II) nem dados de menores; nenhum tratamento se baseia em consentimento (sem marketing, sem tracking). Revisão jurídica pendente (sem Encarregado designado).

## Atividade: conta e autenticação (A001)

- **Finalidade**: criar e autenticar contas de usuário do SaaS
- **Dados tratados**: e-mail, hash Argon2id, flags, timestamps
- **Sensíveis?**: Não
- **Base legal**: Art. 7º, V — execução de contrato
- **Justificativa**: conta é o próprio objeto do contrato SaaS; sem ela o serviço não existe. Consentimento seria redundante e revogável de forma a inviabilizar o contrato
- **LIA**: N/A (não é legítimo interesse)
- **Retenção**: enquanto a conta existir + backups (purge de usuário a definir — gap)
- **Revogação possível?**: via eliminação de conta (endpoint a implementar — gap DSAR)
- **Última revisão**: 2026-09-16

## Atividade: sessões refresh (A002)

- **Finalidade**: manter sessão com rotation e detectar reuse de token
- **Dados tratados**: hash de refresh token, family_id, timestamps, IP, user-agent
- **Sensíveis?**: Não
- **Base legal**: Art. 7º, V — execução de contrato
- **Justificativa**: sessão é meio necessário à execução do contrato; IP/UA limitados ao antifraude de sessão
- **LIA**: N/A
- **Retenção**: famílias revogadas acumulam (purge a definir — gap parcial)
- **Revogação possível?**: sim, a qualquer momento (`logout`, `logout-everywhere`, troca de senha)
- **Última revisão**: 2026-09-16

## Atividade: recovery de senha (A003)

- **Finalidade**: redefinir senha via link de uso único
- **Dados tratados**: e-mail (destinatário), hash de token, IP
- **Sensíveis?**: Não
- **Base legal**: Art. 7º, V — execução de contrato (procedimento a pedido do titular)
- **Justificativa**: solicitado pelo próprio titular; alternativa (suporte manual) é mais invasiva
- **LIA**: N/A
- **Retenção**: purge automático (`password.purge`) de expirados/usados
- **Revogação possível?**: N/A (ato pontual; token expira em 60 min)
- **Última revisão**: 2026-09-16

## Atividade: organizações e memberships (A004)

- **Finalidade**: multi-tenancy, papéis e isolamento por organização
- **Dados tratados**: nomes/slugs de orgs e projetos, vínculos, papéis
- **Sensíveis?**: Não
- **Base legal**: Art. 7º, V — execução de contrato
- **Justificativa**: núcleo do produto contratado (SaaS multi-tenant)
- **LIA**: N/A
- **Retenção**: enquanto o vínculo existir (purge a definir — gap parcial)
- **Revogação possível?**: via remoção de membership / eliminação de conta (endpoint a implementar)
- **Última revisão**: 2026-09-16

## Atividade: auditoria de segurança (A005)

- **Finalidade**: accountability de ações sensíveis e resposta a incidentes
- **Dados tratados**: actor, ação, recurso, `metadata(reason)`, IP, user-agent
- **Sensíveis?**: Não
- **Base legal**: Art. 7º, IX — legítimo interesse (segurança) + Art. 16, I (guarda de registros)
- **Justificativa**: sem trilha, incidentes são ininvestigáveis; interesse do titular (proteção da conta) converge com o do controlador
- **LIA**: [lia/a005.md](./lia/a005.md)
- **Retenção**: indefinida hoje — gap (`AUDIT_RETENTION_DAYS` futuro)
- **Revogação possível?**: não (imutabilidade é a finalidade); mitigado por minimização (sem segredos, testado)
- **Última revisão**: 2026-09-16

## Atividade: administração global (A006)

- **Finalidade**: gestão de contas/orgs por staff/root com trilha
- **Dados tratados**: mesmos de A001/A004, lidos cross-tenant
- **Sensíveis?**: Não
- **Base legal**: Art. 7º, IX — legítimo interesse (operação e segurança da plataforma)
- **Justificativa**: necessário para suporte, moderação e resposta a incidentes; acesso nominal com `reason` auditado e papéis mínimos
- **LIA**: [lia/a006.md](./lia/a006.md)
- **Retenção**: herda das tabelas de origem
- **Revogação possível?**: via eliminação de conta (endpoint a implementar)
- **Última revisão**: 2026-09-16

## Atividade: billing Stripe (A007)

- **Finalidade**: aplicar grants a partir de eventos de assinatura
- **Dados tratados**: `event_id`, tipo, `price_id`, `org_id` (sem cartão — Stripe hospeda)
- **Sensíveis?**: Não
- **Base legal**: Art. 7º, V — execução de contrato (quando a flag está ligada)
- **Justificativa**: cobrança do plano contratado; flag off = zero tratamento
- **LIA**: N/A
- **Retenção**: outbox processado acumula (purge a definir — gap parcial)
- **Revogação possível?**: via cancelamento + eliminação de conta
- **Última revisão**: 2026-09-16

## Atividade: sessão no navegador (A008)

- **Finalidade**: manter sessão no client de visualização (dev)
- **Dados tratados**: tokens opacos em `localStorage`
- **Sensíveis?**: Não
- **Base legal**: Art. 7º, V — execução de contrato
- **Justificativa**: meio técnico necessário; documentado como dev-only (prod = cookies `HttpOnly` + CSRF)
- **LIA**: N/A
- **Retenção**: até logout/expiração
- **Revogação possível?**: sim (`logout`, `logout-everywhere`)
- **Última revisão**: 2026-09-16
