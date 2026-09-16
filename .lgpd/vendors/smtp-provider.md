# Operador: provedor SMTP (a definir por deploy)

- Razão social / CNPJ ou registro: **pendente — sem deploy produtivo; preencher ao escolher**
- País(es) de tratamento: pendente
- Finalidade: entrega de e-mails transacionais (recovery de senha via `email.template`)
- Dados compartilhados: e-mail do destinatário, link de reset (uso único, 60 min) | Sensíveis (Art. 11)? não
- Tier: **Alto** (PII em escala quando ativo)
- Owner interno: pendente (Encarregado não designado)
- Última revisão: 2026-09-16 | Próxima revisão: semestral após contratação

## 1. Contrato e base legal
- [ ] **🚫 DPA assinado** cobrindo as 12 cláusulas (ver `lgpd-dpa`)
- [ ] Papel definido (operador) correto
- [ ] Finalidade bate com A003 do data-map
- [ ] Base legal do compartilhamento (Art. 7º, V — ver `legal-basis.md#a003`)

## 2. Segurança (Art. 46)
- [ ] TLS obrigatório (`SMTP_USE_TLS=true` já exigido em prod pelo código)
- [ ] RBAC/MFA na conta do provedor
- [ ] Certificações: `{quais? validade?}`
- [ ] Logs de entrega disponíveis
- [ ] Gestão de vulnerabilidades do provedor

## 3. Sub-operadores
- [ ] Lista disponível e atualizada
- [ ] Notificação prévia de novos sub-operadores
- [ ] Obrigações equivalentes

## 4. Transferência internacional
- [ ] **🚫 Base do Art. 33 presente** (provedores BR preferidos; senão Cláusulas-Padrão Res. 19/2024)
- [ ] Países de destino mapeados
- [ ] Avaliação de risco registrada

## 5. Direitos do titular e retenção
- [ ] Auxílio em DSAR no SLA
- [ ] Eliminação ao fim do contrato + atestado
- [ ] Retenção compatível (nossos resets expiram em 60 min + purge)

## 6. Incidentes
- [ ] Notificação ≤ 24h contratual
- [ ] **🚫 Sem histórico de incidentes não comunicados**
- [ ] Canal de segurança definido

## 7. Operacional
- [ ] DPA versionado aqui, com link
- [ ] Revisão semestral agendada
- [ ] Owner interno definido

Modelo contratual: [`dpa-template.md`](./dpa-template.md) (preencher por vendor com jurídico).

## Avaliação — provedor SMTP
- Itens atendidos: 1/19 (só TLS, por exigência do código)
- Eliminatórios (🚫): **REPROVADO em: DPA, base Art. 33, histórico** — bloqueado até contratação com DPA
- Veredito: **REPROVADO — substituir/contratar antes do primeiro deploy produtivo com SMTP real** (Mailpit dev não conta: sem PII real)
- Gaps abertos: ver `.lgpd/gaps.md` (DPA com operadores)
