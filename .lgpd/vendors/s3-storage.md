# Operador: storage S3-compatível (a definir por deploy; MinIO em dev)

- Razão social / CNPJ ou registro: **pendente — sem deploy produtivo**
- País(es) de tratamento: pendente
- Finalidade: armazenamento de objetos (uploads futuros; hoje sem upload de PII em tela)
- Dados compartilhados: objetos enviados pelo produto (potencialmente com PII, conforme feature) | Sensíveis? não por desenho atual
- Tier: **Alto** (potencial de PII em escala)
- Owner interno: pendente
- Última revisão: 2026-09-16 | Próxima revisão: semestral após contratação

## Checklist (resumo — ficha completa em `vendor-checklist.md` da skill)
- [ ] **🚫 DPA assinado** (12 cláusulas)
- [ ] Criptografia em trânsito (SDK `aioboto3` com TLS) e em repouso (SSE do provedor)
- [ ] RBAC/MFA, certificações, logs de acesso
- [ ] Sub-operadores mapeados
- [ ] **🚫 Base do Art. 33** (preferir região BR)
- [ ] Auxílio DSAR + eliminação com atestado + retenção compatível
- [ ] Incidentes ≤ 24h, sem histórico omisso, canal definido

## Avaliação — storage S3
- Eliminatórios (🚫): **REPROVADO em: DPA, base Art. 33** — bloqueado até contratação com DPA
- Veredito: **REPROVADO — contratar antes de qualquer upload produtivo** (MinIO local/dev fora do escopo: sem PII real)
- Gaps abertos: ver `.lgpd/gaps.md` (DPA com operadores)
