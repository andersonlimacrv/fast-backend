# Tabletop Exercise — resposta a incidentes (anual, mínimo)

**Como rodar**: mesa com Encarregado + backend + ops, cronômetro ligado. Para cada cenário: triar, decidir notificação (teste Art. 5º), estimar tempo até comunicação. Se > 3 dias úteis, o processo está quebrado — corrigir runbook.

## Cenário 1 — Vazamento de e-mails via endpoint (probabilidade alta)
`GET /organizations/{id}/members` (ou similar) passa a responder sem auth por regressão. ~todos os usuários expostos (e-mails + vínculos). Treina: detecção via audit anômalo, contenção (revert + `logout-everywhere` em massa?), Art. 5º (IV autenticação? e-mails sozinhos: avaliar VI larga escala).

## Cenário 2 — Insider com privilégio excessivo (médio)
Staff usa `/admin/*` fora do propósito (reason genérico). Treina: detecção via `audit_log` (`reason` vazio/genérico), contenção (`revoke staff` + `disable` + invalidar sessões), decisão de notificação, revisão de `AdminContext`.

## Cenário 3 — Comprometimento do provedor (baixo, alto impacto)
VPS/SMTP/S3 com acesso indevido. Treina: acionamento de operador (`.lgpd/vendors/`), rotação total de segredos, avaliação de escopo via backups + audit, comunicação em 72h.

## Cenário 4 — Onda de reuse de refresh tokens (médio)
Explosão de `RefreshTokenReuseError` (famílias revogadas em massa). Treina: distinguir ataque de bug no client, contenção (`tokens_valid_after` global), comunicação preventiva aos titulares.

## Registro
Anotar data, participantes, tempos medidos e ações corretivas abaixo. Próximo drill sugerido: anual a partir de 2026-09-16.

| Data | Participantes | Tempo até decisão | Tempo até comunicação (simulado) | Ações |
|---|---|---|---|---|
| _—_ | _—_ | _—_ | _—_ | _—_ |
