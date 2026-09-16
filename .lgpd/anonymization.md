# Anonimização — avaliação L6 (2026-09-16)

**Veredito**: N/A para o estado atual — registrado com fundamento, não por omissão.

## Varredura

- Pipelines de analytics/DW/ML no código: **nenhum** (grep por analytics, warehouse, dataframe, pandas, spark: zero ocorrências funcionais).
- Datasets públicos/exportados: **nenhum**.
- Superfície mais próxima: contagens do `GET /admin/overview` (só números, sem PII) e `audit_log` operacional (não é analytics).

## Guardrails já atendidos (evidência)

- Tokens (refresh/reset) são SHA-256 de **256 bits aleatórios** — o anti-padrão da skill ("hash sem salt de campo de baixa entropia como CPF") **não se aplica**: não há hashing de campo de baixa entropia em lugar nenhum.
- IDs internos (`users.id`, `org_id`) aparecem em URLs e logs — **não são tratados como pseudônimos** em lugar nenhum (correto per skill).

## Gatilhos de reavaliação (quando L6 volta a valer)

1. Introduzir analytics/eventos de produto, DW ou exportação de datasets → pseudonimizar na ETL + k-anonymity (k ≥ 5) antes de qualquer saída, com teste de re-identificação (linkage/inference/singling-out).
2. Publicar qualquer estatística agregada → revisar generalização/supressão antes.

## Status (formato da skill, adaptado)

- Pipelines de analytics revisados: 0 existentes
- Datasets pseudonimizados/anonimizados: 0 (nada a tratar)
- Próximo: lgpd-dsar (L7)
