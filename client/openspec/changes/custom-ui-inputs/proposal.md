# custom-ui-inputs — proposal

## Why

O item 14 (`Inputs`) já é um porte fiel do doc (`floating-input.tsx` + `ui/input`), mas diverge da referência Watermelon (`registry.watermelon.sh/r/floating-input.json`, 2026-09-30) num ponto visual: o campo usa `bg-input` enquanto o upstream usa `bg-transparent` — com o fill, o chip flutuado da label (`bg-background`) vira um patch contrastante em vez de fundir com o fundo (dono, 2026-09-30). Além disso, `defaultValue`/`value` inicial não flutua a label (sobrepõe o texto) — quirk herdado do upstream.

## What Changes

- **`floating-input.tsx`**: campo `bg-input` → `bg-transparent` (verbatim upstream; `ui/input` já é `bg-background`); `hasValue` inicial derivado de `value`/`defaultValue` (delta documentado — pré-preenchido já abre flutuado); resto intacto.
- **Prova**: variações rotuladas (email, password, pré-preenchido, disabled, plain).
- **Testes**: bg transparente, pré-preenchido flutua, disabled, tipos.
- **Docs**: `entries.ts` n=14, `review-design` §13 (linha 14) + CHANGELOG.

## Non-goals

Validar o item (fica `pending` até o ok visual).

## Acceptance criteria

1. Card `14 Inputs`: campo funde com o fundo, chip da label sem patch; pré-preenchido abre flutuado.
2. Gates: `tsc -b`, oxlint, catálogo e build verdes.
