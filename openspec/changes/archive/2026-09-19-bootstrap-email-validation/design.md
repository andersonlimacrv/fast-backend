## Context

`create_superuser` canoniza sem validar formato; schemas HTTP validam via `EmailStr` (que exige `email-validator`, já instalado). O CLI é o único caminho sem gate — e o mais perigoso (one-shot).

## Goals / Non-Goals

Goals: typo nunca vira root permanente; genérico preservado; sem rede no gate. Non-goals: DNS/deliverability, normalização extra, tocar o serviço/HTTP.

## Decisions

1. **Validar no CLI, não no serviço** — `create_superuser` é usado por caminhos já validados; o gate pertence à borda CLI (`bootstrap()`). Rejeitado: validar no serviço (muda contrato compartilhado sem necessidade).
2. **`check_deliverability=False`** — sem DNS: funciona offline/CI, não vaza o email do root, e formato é a propriedade que importa. Rejeitado: deliverability (rede no bootstrap, flake, privacidade).
3. **Ordem: chave → formato → DB** — chave primeiro preserva a semântica existente (testes de key sem DB seguem válidos); formato antes do DB garante 0 linhas no typo. Falha em qualquer gate → mesmo `ValueError` genérico (sem oráculo).
4. **Helper puro separado** — `validate_root_email()` testável sem DB nem settings; `bootstrap()` só a chama.

## Risks / Trade-offs

- [`email-validator` rejeita endereços exóticos válidos (quoted local-part)] → aceito: root bootstrap quer endereço operacional, não cobertura RFC completa.
