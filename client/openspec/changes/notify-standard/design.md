# notify-standard — design

## Estado auditado (2026-10-13, só leitura)

Push: `services/notify.ts` (fachada sobre `Toast.createToastManager` global,
kinds + `confirm` + `fromError`, limite 3, 5s/7s) + `AppToaster` (`toaster.tsx`,
montado 1× em `App.tsx:54`, bottom-right, borda por kind, swipe/ação/fechar)
+ `use-toast.ts` (`useNotify` retorna a fachada). Usos: `success` em mutações
(~10 páginas), sessão expirada via evento (`lib/api.ts:44` →
`services/session.ts`), erros pontuais via `error/fromError`.
Blocks: `ErrorBox` (cargas, ~15 páginas + forms + require-staff, mesma
linguagem via `friendlyError`), `EmptyState`/`ErrorOne` (`error-state.tsx`),
`AlertDialog` bloqueante (header decreta substituir `confirm` — migração
parcial). `pages/*/blocks/` não existe (tudo inline ou compartilhado).

## Decisões

1. **Push = mutação + global/sessão; nunca form inline nem falha de carga.**
   Block = contextual persistente (carga→`ErrorBox`, vazio→`EmptyState`,
   rota→`ErrorOne`, escolha→`AlertDialog`). Mesma falha nunca nos dois canais.
2. **`confirm` tem duas semânticas e morre**: destrutivo/bloqueante
   (`admin/Users`) → `AlertDialog`; aviso de criado (`orgs/Orgs`) →
   `success` (ação dispensável). Com ele morrem `ConfirmAction` e o ramo
   `actionProps` do teste.
3. **Costura antes do swap**: contrato em `notify.ts`, provider em
   `notify.provider.ts`; páginas e hook só conhecem o contrato. Trocar a lib
   = 1 adapter + visuais.
4. **goey-toast@0.5.0** (MIT, React + Sonner + framer-motion; a lib do site
   goey-toast.vercel.app — NÃO confundir com a `gooey-toast` vanilla, instalada
   por engano e revertida na mesma sessão): `GooeyToaster` + `gooeyToast`
   (`success/error/warning/info/promise/dismiss/update`), 6 posições, presets
   (`smooth/bouncy/subtle/snappy`), timestamp/progress/Escape/swipe nativos,
   `maxQueue` + `queueOverflow` nativos, dark mode + RTL, `classNames` por
   parte, `icon` ReactNode (nossos ícones `lib/icons`), `fillColor/borderColor`
   por toast. Mount da casa (`toaster.tsx`, porte fino do wrapper shadcn para
   `custom-ui` — `components/ui` intocada): bottom-right (default do site),
   `theme` reativo, `spring={!reduceMotion}`, `maxQueue={3}`. Durations da
   casa (5s/7s) em vez dos 4s default. Riscos registrados: mantenedor único
   v0.x; `framer-motion@13.3.0` duplica o `motion@13.3.0` no bundle (+52 kB
   raw/+14 kB gzip medido); skill `SKILL.md` da lib NÃO instalada (regra do
   SKILLS-REGISTRY exige auditoria + registro — follow-up opcional).
