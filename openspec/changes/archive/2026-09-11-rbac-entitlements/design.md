## Context

Pós-Fase 3: papéis existem no `Membership` e viajam no `TenantContext`, mas nada os consome; não há grants. Billing (Fase 7) precisará apenas escrever grants — a leitura já fica pronta aqui.

## Goals / Non-Goals

**Goals:**
- Autorização em duas camadas distintas: papel (quem manda) e entitlement (o que o plano permite).
- Zero seed: defaults em código, override em banco.

**Non-Goals:**
- Cobrança, trials,bpp webhooks; papéis por recurso; auditoria.

## Decisions

1. **`require_role` mora em `tenancy/public`** — o papel é atributo do vínculo tenant, não do plano; `entitlements` não precisa saber de RBAC.
2. **Defaults em código (`DEFAULT_ENTITLEMENTS`), override em banco** — sem seed em `create_organization` (que violaria o DAG), sem migration de dados; `None`/ausente = default; `limit=None` = ilimitado/ligado.
3. **Grant `{org_id, key, limit NULL, enabled}`** — booleano (`projects.access`) e cota (`projects.max`) na mesma tabela; `enabled=false` vence qualquer limite.
4. **Checagem de cota com `SELECT COUNT` na transação de create** — suficiente p/ v1 (sem `FOR UPDATE` em contador; documentar corrida benigna: 2 creates simultâneos podem estourar em 1 — aceitar, como a maioria dos SaaS; endurecer na Fase 7 se billing exigir).
5. **Grants geridos por `admin+` via API** — sem admin SQL; `member` recebe 403 (prova viva do `require_role`).
6. **Projetos como vitrine, não como regra** — o gating vive nas deps (`require_role`, `require_entitlement`); qualquer módulo futuro as reusa sem copiar lógica.

## Risks / Trade-offs

- [Corrida em cota documentada acima] → aceitar no v1.
- [Defaults em código divergem do marketing do plano] → mitigação: `GET /grants` expõe o resolvido (default vs override), fonte única de verdade p/ debug.
- [Alternativa rejeitada: seed de grants no `create_organization`] → violaria o DAG (`organization → entitlements` é para cima).
