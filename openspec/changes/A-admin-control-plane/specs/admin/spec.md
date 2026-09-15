# spec delta: `admin` (change A-admin-control-plane, PT-BR)

## Requirement: Bootstrap de root único via CLI

O sistema SHALL criar o root (`is_superuser=true`) exclusivamente via `scripts/bootstrap_root.py` com `BOOTSTRAP_KEY` comparada em tempo constante; a 2ª tentativa SHALL falhar fechada (exit≠0) mesmo com key válida (índice parcial `uq_single_root`).

#### Scenario: Segundo bootstrap negado

- **WHEN** o CLI roda com key válida havendo root existente
- **THEN** exit≠0 AND nenhum 2º root existe AND resposta não revela dados (log genérico).

## Requirement: Hierarquia root > staff > por-org

O sistema SHALL tratar `is_superuser ⇒ is_staff` (CHECK); só root SHALL gerenciar staff/root; desabilitar ou remover privilégio do último root SHALL retornar 409 (`LastRootProtectedError`).

#### Scenario: Staff tenta criar staff

- **WHEN** staff chama `POST /admin/staff/{id}/grant`
- **THEN** 403 AND audit registra a tentativa negada.

## Requirement: Admin como operações auditadas com reason

Toda mutação `POST /admin/*` SHALL exigir `reason` (≥8 chars) e SHALL gravar `audit.metadata={reason, success, ...}`; schemas nunca SHALL expor `is_superuser/is_staff` para escrita.

#### Scenario: Disable sem reason

- **WHEN** `POST /admin/users/{id}/disable` sem `reason`
- **THEN** 422 AND nenhum estado muda.
