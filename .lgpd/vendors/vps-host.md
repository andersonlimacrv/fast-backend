# Operador: hospedagem VPS (a definir por deploy)

- Razão social / CNPJ ou registro: **pendente — sem deploy produtivo**
- País(es) de tratamento: pendente (preferir BR)
- Finalidade: hospedar API, worker, Postgres, Redis, backups cifrados
- Dados compartilhados: **base inteira** (todas as tabelas do data-map) | Sensíveis? não por desenho (verificado em L2)
- Tier: **Crítico** (acesso à base completa) — revisão trimestral após contratação
- Owner interno: pendente
- Última revisão: 2026-09-16 | Próxima revisão: trimestral após contratação

## Checklist (resumo)
- [ ] **🚫 DPA assinado** (12 cláusulas)
- [ ] Criptografia: TLS (Caddy, já no runbook) + disco cifrado do provedor
- [ ] RBAC/MFA, certificações, logs de acesso ao painel
- [ ] Sub-operadores (datacenter) mapeados
- [ ] **🚫 Base do Art. 33** se fora do BR
- [ ] Auxílio DSAR; eliminação de discos ao fim do contrato + atestado
- [ ] Incidentes ≤ 24h; sem histórico omisso

Modelo contratual: [`dpa-template.md`](./dpa-template.md) (preencher por vendor com jurídico).

## Avaliação — VPS
- Eliminatórios (🚫): **REPROVADO em: DPA, base Art. 33** — bloqueado até contratação com DPA
- Veredito: **REPROVADO — contratar antes do primeiro deploy com dados reais**
- Gaps abertos: ver `.lgpd/gaps.md` (DPA com operadores)

---

## Fora de escopo (registrado, não fichado)

- **Mailpit/MinIO locais**: sem PII real — N/A.
- **GitHub Actions (CI)**: executa testes, sem acesso a PII de titulares — N/A (código-fonte ≠ dado pessoal; segredos de CI fora do escopo LGPD).
- **Dependências npm/pip**: bibliotecas, não operadores (sem envio de dados).
- **Cliente SPA em dev**: `localhost`, sem terceiros — N/A.
