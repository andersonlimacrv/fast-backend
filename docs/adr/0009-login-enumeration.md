# ADR 0009 — Login sem oráculo de enumeração (two-step + dummy Argon2)

- Status: aceito (implementado na change `two-step-login`, 2026-09-15: dummy verify + testes de indistinguibilidade em PG real)
- Data: 2026-09-15
- Referência congelada: `references/implementation_v2.md` §3 (auth), §23
- Decisão do usuário: email-primeiro que nunca revela existência

## Contexto

O corpo do 401 já era genérico (`InvalidCredentialsError`), mas email desconhecido pulava o Argon2 (`service.py:89-91` antes da change) — só o tempo de resposta separava "não existe" de "senha errada". Um login em duas etapas que revelasse existência (estilo Google) contradiria o `forgot` 202-genérico.

## Decisão

1. **Always-advance no client** (`LoginForm`): etapa 1 só valida formato; qualquer email válido mostra a senha; erro só após tentativa real, genérico.
2. **Dummy `verify` no service**: hash falsa lazy por instância (`secrets.token_hex`), `verify` descartado no caminho desconhecido — custo ≈ caminho real. Rejeitado: sleep fixo (frágil por hardware) e hash em settings (segredo parado).
3. **`register` 409 mantido**: registro precisa dizer "email em uso"; mitigação é throttling (existente). Tradeoff aceito e registrado aqui.
4. Prova por teste, não por timing (flaky): `verify` chamado nos dois caminhos (hasher decorado) + corpo/status 401 idênticos em PG real.

## Consequências

- Positivas: enumeração por resposta, corpo e custo fechada no login.
- Negativas: +1 Argon2 verify por tentativa com email inexistente (custo = o do caminho real; throttling limita abuso).
- Reversão: nova ADR (nunca editar esta).
