# root-mode — design

## Context

Root sem identidade visual (dono, 2026-10-01). Imagens de referência: card
"Modo Root" (coroa + subtítulo + chevron + borda lateral) e badge informativa
discreta. Fonte normativa: `app/modules/admin/policies.py` + `router.py`.

## Decisions

1. **Crown, não cadeado** (dono: testar coroa); `lib/icons` via regra de ouro.
2. **Dentro do menu do usuário** (dono): card + grupo "Ações root", só root —
   sem trigger novo, sem rota nova.
   **Correção (dono)**: o badge NÃO substitui o botão — a pílula compacta
   `Root` fica empilhada acima do botão do usuário (escondida no rail);
   o botão segue intacto (avatar + email + papel).
3. **Enumeração honesta**: só Grant/Revoke staff são `current_root`; o resto
   do admin é staff. Nada inventado.
4. **Matriz estática por nível** (dono: card legenda + detalhe): linhas fixas
   espelhando `policies.py`; `capabilitiesFor()` pura e testada.
5. **Sem coroa no Administration** (é staff); coroa só no root-only.
   **Revisão (dono)**: itens gated da sidebar levam coroa sutil em
   `text-muted-foreground/20` (20% da cor atual).
6. **Tokens + `ring-2`** (casa); dark/light sem branches.
