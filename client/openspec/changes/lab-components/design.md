# lab-components — design

## Context

Catálogo em `lib/catalog/` (`lab-harness`): `n` estável, `class`/`kind`, `status`, `usedIn`. Provas no registro compartilhado `components/catalog-demos.tsx` — Trials mostra `pending`, Gallery mostra `validated`. Owner (2026-09-19): só `404PageNotFound` está validado; todo o resto será revisto 1-a-1.

## Goals / Non-Goals

Goals: primeiro item validado ponta a ponta (404), prova do segundo pronta (Accordion), ledger atualizado. Non-goals: validar pelo dono, portar itens novos, tocar `references/`.

## Decisions

1. **404 validado por inspeção + prova compacta** — `ErrorOne` em produção na rota `*`; a prova na Gallery é o próprio `ErrorOne` em caixa reduzida (`className="min-h-0 py-8"`, twMerge resolve o `min-h-[60vh]`). Sem doc-fonte rico em `references/`, demo elaborada seria teatro.
2. **`usedIn` do 404 em texto, sem link** — a "rota" é o catch-all `*`; link rápido não faz sentido, então fica a descrição (regra do dono: link quando existe rota, senão texto).
3. **Accordion segue `pending`** — prova viva pronta (single + `multiple`) e nota de não-porte registrada; `status` só vira `validated` com o ok do dono.
4. **Sem duplicar prova entre páginas** — os dois itens usam o mesmo registro; validar é flipar `status`.

## Risks / Trade-offs

- [Accordion pode revelar gap no primitivo durante a validação] → vira decisão registrada (ajuste mínimo aqui ou change própria).
- [Gallery quase vazia no início (só 1 item)] → é o desenho: o catálogo é o resultado da validação, não um mostruário automático.
