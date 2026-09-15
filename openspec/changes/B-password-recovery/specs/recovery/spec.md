# spec delta: `recovery` (change B-password-recovery, PT-BR)

## Requirement: Forgot genérico com throttling

O sistema SHALL responder `202` idêntico para email existente ou não; SHALL criar reset + outbox só se usuário ativo existe; rajada SHALL retornar 429 sem vazar existência.

#### Scenario: Enumeração neutra

- **WHEN** `POST /forgot` com email inexistente
- **THEN** 202 AND nenhuma linha em `password_resets` AND nenhum e-mail.

## Requirement: Reset como boundary event single-use

O sistema SHALL aceitar token válido uma única vez (`used_at` + `FOR UPDATE`); sucesso SHALL rotacionar hash, setar `tokens_valid_after=now`, revogar refresh family e invalidar demais pendentes; reuse/expirado SHALL retornar 400 genérico.

#### Scenario: Reuse negado

- **WHEN** `POST /reset` com token já usado
- **THEN** 400 AND sessões do usuário permanecem no estado pós-primeiro-reset.

## Requirement: Force-reset administrativo sem segredo

`POST /admin/users/{id}/force-password-reset` (staff+, `reason`) SHALL revogar sessões, gerar recovery e retornar `{status:accepted}` sem incluir token/link.

#### Scenario: Member tenta force-reset

- **WHEN** member chama force-reset
- **THEN** 403 AND nenhuma sessão é revogada.
