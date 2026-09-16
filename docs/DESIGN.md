# DESIGN.md — Guia de Design System para Dashboards &amp; Interfaces Ricas

> **Stack de referência:** Vite + React + TypeScript · Tailwind CSS v4 · shadcn/ui · tema via CSS variables compatível com [tweakcn](https://tweakcn.com/) **Escopo:** dashboards, painéis de dados e sites com interações ricas (scroll, motion, 3D) **Versão:** consolidada a partir de duas pesquisas anteriores + verificação de fatos em setembro de 2026

---

## 📌 Nota desta revisão (setembro/2026)

Esta versão une o melhor das duas pesquisas anteriores e corrige/atualiza alguns pontos que mudaram nos últimos meses:

- **shadcn/ui passou a usar Base UI por padrão**, não mais Radix, desde julho/2026 (`npx shadcn init` já vem assim). Radix continua totalmente suportado, mas seu ritmo de updates caiu desde a aquisição pela WorkOS — isso muda a seção 2 e 5 de ambas as versões anteriores, que ainda tratavam "shadcn = Radix" como verdade única.
- **GSAP** segue 100% gratuito (inclusive plugins antes pagos), com uma ressalva de licença que vale conhecer (seção 9.2).
- **CSS scroll-driven animations nativas** já não estão mais em beta no Safari — o suporte global passou de ~informal para **~82–85% via caniuse**, com Firefox ainda atrás de flag. Isso muda a recomendação de "esperar mais" para "já dá para usar como progressive enhancement com confiança".
- **Figma MCP e Magic MCP ([21st.dev](http://21st.dev))** tiveram nomes de ferramentas e branding atualizados — a seção 10 reflete os nomes atuais.
- Números de adoção (stars, downloads) foram atualizados onde havia fonte confiável de setembro/2026; onde não havia dado fresco confiável, preferi descrever a tendência em vez de citar um número que pode já estar desatualizado.

---

## Sumário

1. [Onde este arquivo vive e como o agente deve usá-lo](https://claude.ai/chat/d1b9117d-a9f1-4eeb-b824-fa6adee156af#1-onde-este-arquivo-vive-e-como-o-agente-deve-us%C3%A1-lo)
2. [Ranking de skills/bibliotecas de design para dashboards](https://claude.ai/chat/d1b9117d-a9f1-4eeb-b824-fa6adee156af#2-ranking-de-skillsbibliotecas-de-design-para-dashboards)
3. [Princípios de design](https://claude.ai/chat/d1b9117d-a9f1-4eeb-b824-fa6adee156af#3-princ%C3%ADpios-de-design)
4. [Tokens: cores, tipografia, espaçamento (compatível com tweakcn)](https://claude.ai/chat/d1b9117d-a9f1-4eeb-b824-fa6adee156af#4-tokens-cores-tipografia-espa%C3%A7amento-compat%C3%ADvel-com-tweakcn)
5. [Componentes base](https://claude.ai/chat/d1b9117d-a9f1-4eeb-b824-fa6adee156af#5-componentes-base)
6. [Layout responsivo](https://claude.ai/chat/d1b9117d-a9f1-4eeb-b824-fa6adee156af#6-layout-responsivo)
7. [Padrões de interação e animação](https://claude.ai/chat/d1b9117d-a9f1-4eeb-b824-fa6adee156af#7-padr%C3%B5es-de-intera%C3%A7%C3%A3o-e-anima%C3%A7%C3%A3o)
8. [Acessibilidade](https://claude.ai/chat/d1b9117d-a9f1-4eeb-b824-fa6adee156af#8-acessibilidade)
9. [Catálogo de skills de animação](https://claude.ai/chat/d1b9117d-a9f1-4eeb-b824-fa6adee156af#9-cat%C3%A1logo-de-skills-de-anima%C3%A7%C3%A3o)
10. [MCPs úteis para o fluxo de frontend](https://claude.ai/chat/d1b9117d-a9f1-4eeb-b824-fa6adee156af#10-mcps-%C3%BAteis-para-o-fluxo-de-frontend)
11. [Outros recursos que enriquecem a UI](https://claude.ai/chat/d1b9117d-a9f1-4eeb-b824-fa6adee156af#11-outros-recursos-que-enriquecem-a-ui)
12. [Resumo executivo](https://claude.ai/chat/d1b9117d-a9f1-4eeb-b824-fa6adee156af#12-resumo-executivo)

---

## 1. Onde este arquivo vive e como o agente deve usá-lo

**Localização recomendada:** `./docs/DESIGN.md`, na raiz do projeto, ao lado de eventuais `./docs/[ARCHITECTURE.md](http://ARCHITECTURE.md)` ou `./docs/[ROADMAP.md](http://ROADMAP.md)`.

Evite `./.ai/DESIGN.md` ou qualquer pasta com ponto na frente: exploradores de arquivo escondem pastas ocultas por padrão, e alguns linters/CI ignoram diretórios `.*`, o que pode fazer o arquivo "desaparecer" de buscas de ferramentas de IA. `./docs/` é visível, é a convenção mais comum em repositórios open-source (facilita onboarding humano) e não conflita com nenhuma ferramenta da stack.

**Como o agente de desenvolvimento deve referenciá-lo:**

- Adicione um ponteiro curto no arquivo de instruções que o agente já lê automaticamente no boot ([`CLAUDE.md`](http://CLAUDE.md), [`AGENTS.md`](http://AGENTS.md), `.cursor/rules/*.mdc` ou `.windsurfrules`, dependendo da ferramenta). Exemplo de trecho a colar nesse arquivo:
  ```markdown
  ## Design system
  Antes de gerar ou alterar qualquer componente de UI, leia `docs/DESIGN.md` por
  completo e siga os tokens, componentes base e padrões de interação definidos
  lá. Não reintroduza cores, espaçamentos ou variantes de componente fora do
  que está documentado — proponha uma alteração ao DESIGN.md primeiro.
  
  ```
- Trate o `DESIGN.md` como **fonte de verdade única** para tokens visuais: o `globals.css` do projeto (seção `@theme`) deve ser gerado a partir dele, não o contrário. Quando o tema for ajustado no tweakcn, o fluxo é: exportar CSS do tweakcn → colar no bloco de tokens do `DESIGN.md` → sincronizar `globals.css`.
- Referencie o arquivo por *path relativo* em prompts de tarefas ("implemente este card seguindo `docs/DESIGN.md#5-componentes-base`") em vez de colar trechos dele — mantém uma única cópia atualizável.
- Registre neste mesmo arquivo, com data, qualquer decisão de design que fuja do padrão (ex.: "2026-09: dashboard de billing usa uma 6ª cor de gráfico por exigência do cliente X") — isso evita que o agente "esqueça" exceções já aprovadas.

---

## 2. Ranking de skills/bibliotecas de design para dashboards

Critérios: adoção pela comunidade, atualidade (releases ativos em 2025–2026), compatibilidade com Vite + React + TS + Tailwind v4 + shadcn, qualidade de documentação e impacto em performance.


| #   | Skill / biblioteca                                          | Categoria                            | Por que ranqueia aqui                                                                                                                                                                                                                                                                                                                                                                      |
| --- | ----------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Tailwind CSS v4**                                         | Motor de estilos                     | Engine reescrita (Oxide/Lightning CSS), tokens nativos via `@theme`, builds completos que caem de segundos para dezenas de milissegundos em projetos grandes. Versão estável atual é a **v4.3** (setembro/2026), com utilitários novos de scrollbar e melhor suporte a `@variant`. É o alicerce de tudo abaixo.                                                                            |
| 2   | **shadcn/ui**                                               | Componentes                          | Não é uma lib instalada via npm — é código copiado para o repo (você é dono do componente). Ultrapassou **120 mil estrelas no GitHub** em setembro/2026 e é hoje o "default" da maioria dos geradores de UI com IA (v0, Cursor, Claude Code). **Desde julho/2026,** `npx shadcn init` **usa Base UI como camada de primitivos por padrão** (Radix continua suportado via flag `-b radix`). |
| 3   | **Base UI**                                                 | Acessibilidade/behavior (primitivos) | Criada por parte do time original do Radix, agora mantida em tempo integral pela MUI. Atingiu **v1.0 estável em dezembro/2025** com ~35 componentes, API baseada em render props (mais moderna que o `asChild` do Radix) e é a escolha padrão do shadcn/ui desde jul/2026. Prefira para projetos novos.                                                                                    |
| 4   | **Radix UI Primitives**                                     | Acessibilidade/behavior (primitivos) | Ainda enorme em uso instalado (a dependência `@radix-ui/react-slot` sozinha soma dezenas de milhões de downloads semanais) e continua sendo uma opção sólida e madura. Porém, desde a aquisição pela WorkOS, o ritmo de releases caiu — principalmente em componentes complexos como Combobox e multi-select. Mantenha em projetos existentes; para novos, avalie Base UI primeiro.        |
| 5   | **tweakcn**                                                 | Editor de tema                       | Segue como o gerador de temas para shadcn/ui mais recomendado pela comunidade (na casa de 10 mil estrelas no GitHub), com preview em tempo real, exportação pronta para Tailwind v4, dezenas de presets e, agora, geração de tema por IA a partir de uma imagem de referência. Continua gratuito e open-source, com créditos de IA pagos opcionais.                                        |
| 6   | **TanStack Table + TanStack Query**                         | Dados tabulares/servidor             | Combinação padrão para tabelas server-side (busca, filtro, paginação) e cache de dados. O núcleo do TanStack Query segue entre os pacotes mais baixados do ecossistema React (dezenas de milhões de downloads semanais) — é a stack canônica em praticamente todo starter de dashboard shadcn atual.                                                                                       |
| 7   | **Zustand**                                                 | Estado de UI local                   | Continua sendo o padrão de facto para estado de cliente (UI, preferências, autenticação) leve, com API mínima e sem boilerplate — o par ideal do TanStack Query, que cuida do estado de servidor.                                                                                                                                                                                          |
| 8   | **Recharts** (ou **Tremor** para prontidão visual imediata) | Gráficos                             | Recharts segue como o padrão seguro para a maioria dos times (SVG, API declarativa e compositável em React); Tremor é a opção mais rápida para dashboards SaaS, com componentes de gráfico já estilizados no padrão shadcn/ui e pouca necessidade de customização.                                                                                                                         |
| 9   | **lucide-react**                                            | Ícones                               | Ícone padrão do ecossistema shadcn (`iconLibrary: "lucide"` no `components.json` gerado pela CLI), tree-shakeable, atualizado com frequência.                                                                                                                                                                                                                                              |
| 10  | **class-variance-authority + clsx/tailwind-merge**          | Utilitários de classe                | Trio que resolve variantes de componente (`cva`) e conflitos de classes Tailwind condicionais. Vale notar: o time do shadcn lançou em 2026 um substituto interno chamado `cn` (motor de merge ~30× mais rápido, mesma API), que pode vir a substituir `tailwind-merge`/`clsx` em projetos novos gerados pela CLI — acompanhe, mas `clsx`+`tailwind-merge` seguem 100% funcionais.          |
| 11  | **React Hook Form + Zod**                                   | Formulários                          | Combinação padrão para formulários performáticos (uncontrolled) com validação de schema tipada — usada pelo próprio gerador `shadcn add form`.                                                                                                                                                                                                                                             |
| 12  | **Motion** (antes Framer Motion)                            | Animação declarativa                 | Ainda a biblioteca de animação mais usada no ecossistema React (dezenas de milhões de downloads semanais somando os pacotes `framer-motion` e `motion`), cobrindo a grande maioria dos casos de uso com gestos e animações de layout embutidos. Ver catálogo completo na seção 9.                                                                                                          |
| 13  | **React Aria (Adobe)**                                      | Acessibilidade estrita               | Alternativa a Radix/Base UI quando WCAG 2.1/2.2 é requisito contratual — mantido pela Adobe, usado no design system Adobe Spectrum, com dezenas de componentes que seguem rigorosamente os padrões ARIA. Use quando os padrões do Radix/Base UI não forem suficientes.                                                                                                                     |


> **Nota sobre a "guerra" Radix vs. Base UI:** nenhuma das duas está errada — são camadas de primitivos por baixo do shadcn/ui, e o `DESIGN.md` não deveria precisar saber qual delas o projeto usa (a menos que exemplos de código usem `asChild`, que é sintaxe do Radix; Base UI usa render props). Documente no início do projeto qual foi escolhida e por quê, para o agente não misturar padrões dos dois.

---

## 3. Princípios de design

Estes princípios seguem a diretriz de *frontend design* usada nesta sessão para evitar a estética "genérica de IA" e ainda assim manter uma base sólida para dados:

1. **Dados em primeiro lugar, decoração depois.** Em um dashboard, a hierarquia visual deve refletir a hierarquia informacional: o número mais importante da tela deve ser o elemento com maior peso visual, não o card com mais sombra.
2. **Uma paleta, papéis claros.** Cada cor tem uma função (`primary` = ação, `destructive` = risco, `muted` = secundário) — nunca decorativa. Evite introduzir uma cor nova "porque ficou bonita"; adicione-a ao token system primeiro.
3. **Movimento com propósito.** Anime apenas o que responde a uma ação do usuário (abrir, expandir, confirmar) ou o que comunica mudança de estado (carregando → carregado, erro). Evite `fade-in` genérico em cada card ao rolar a página — é o efeito mais raso e mais reconhecível como "gerado por IA".
4. **Densidade configurável.** Dashboards de analistas/operadores se beneficiam de modos "compacto" e "confortável" (linha de tabela menor vs. maior) — trate espaçamento como token, não como valor fixo por componente.
5. **Modo claro e escuro como cidadãos de primeira classe.** Ambos os temas devem ser desenhados juntos, não um derivado automático do outro — contrastes de gráficos, por exemplo, quase sempre precisam de ajuste manual entre os dois modos.
6. **Propósito e hierarquia antes de estilo.** Antes de desenhar qualquer tela, defina: qual é a pergunta que este dashboard responde? Qual métrica, se mudasse agora, faria o usuário agir? Essa métrica ganha o maior peso visual; o resto se agrupa logicamente ao redor dela (não sobrecarregue com dados irrelevantes ao objetivo da tela).
7. **Evite os clichês do momento.** Não usar por padrão (a menos que o produto realmente peça): fundo bege quente com sotaque terracota, rótulos em CAPS LOCK com letter-spacing, separadores de metadado com `·`, emoji-como-ícone, ou cards idênticos com a mesma sombra `rgba(0,0,0,.1)` em tudo. Escolha *um* elemento para ser o protagonista visual da tela e mantenha o resto disciplinado.

---

## 4. Tokens: cores, tipografia, espaçamento (compatível com tweakcn)

### 4.1 Estrutura de arquivos

```
src/
  styles/
    globals.css      # @import "tailwindcss" + @theme inline + :root/.dark
tailwind.config.ts    # opcional em v4 — só se precisar de plugins JS legados
components.json       # gerado pela CLI do shadcn (define aliases, iconLibrary, primitivo Radix/Base UI etc.)

```

Desde a v4, o Tailwind expõe todos os design tokens como variáveis CSS nativas, acessíveis em qualquer lugar do CSS — é exatamente esse contrato que o tweakcn explora: ele exporta um bloco `:root { --background: ...; --primary: ...; }` que você cola direto no `globals.css`.

### 4.2 `globals.css` — esqueleto compatível com tweakcn

```css
@import "tailwindcss";
@import "tw-animate-css"; /* substitui tailwindcss-animate na v4 */

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.625rem;

  /* Cores base — camada "semântica" (o que o tweakcn edita) */
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);

  /* Paleta de gráficos — 5 cores dedicadas, nunca reaproveite as semânticas */
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);

  /* Sidebar como sub-tema próprio (dashboards frequentemente precisam disso) */
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  /* ...gráficos e sidebar seguem o mesmo padrão, com valores ajustados manualmente */
}

/* Camada de mapeamento — conecta as variáveis semânticas às utilities do Tailwind.
   É este bloco que faz `bg-primary`, `text-muted-foreground` etc. existirem. */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}

```

**Por que essa separação em duas camadas (**`:root`**/**`.dark` **→** `@theme inline`**)?** É o formato que o tweakcn e a CLI oficial do shadcn já geram — qualquer tema exportado de lá (incluindo os presets da comunidade) cola direto nesse esqueleto sem adaptação. Trocar de tema em runtime vira apenas alternar a classe `dark` na tag `<html>`, sem rebuild. O official theme picker (`ui.shadcn.com/themes`) e o tweakcn exportam exatamente essa estrutura, então qualquer um dos dois serve como fonte do bloco de tokens.

### 4.3 Tipografia

- **Uma família para tudo, ou duas com contraste real.** Para dashboards de dados: uma sans-serif com boa legibilidade em tamanhos pequenos (ex.: Inter, Geist, IBM Plex Sans) para UI e texto corrido, e opcionalmente uma monoespaçada (ex.: JetBrains Mono, Geist Mono) *apenas* para valores numéricos/tabulares onde alinhamento de dígitos importa — nunca como "label decorativo".
- Declare como tokens, não hardcoded:

```css
@theme inline {
  --font-sans: "Inter", "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, monospace;
}

```

- Escala tipográfica sugerida (baseada em razão ~1.25, ajuste conforme densidade do produto):


| Token Tailwind        | Uso                                                               |
| --------------------- | ----------------------------------------------------------------- |
| `text-xs` (12px)      | metadados, timestamps, badges                                     |
| `text-sm` (14px)      | corpo padrão de UI, células de tabela                             |
| `text-base` (16px)    | corpo de leitura longa (raramente o padrão em dashboards densos)  |
| `text-lg`–`text-xl`   | títulos de card, KPIs secundários                                 |
| `text-3xl`–`text-4xl` | KPI principal da tela, com `font-mono tabular-nums` se for número |


### 4.4 Espaçamento e densidade

Use a escala padrão do Tailwind (múltiplos de `0.25rem`) e exponha dois presets de densidade como variável, para não precisar duplicar componentes:

```css
:root { --row-gap: 0.75rem; }         /* modo "confortável" */
[data-density="compact"] { --row-gap: 0.375rem; }

```

```tsx
<TableRow style={{ paddingBlock: "var(--row-gap)" }} />

```

Respeite também uma distância mínima de toque (~24–44px) para alvos interativos em telas menores/touch, mesmo em dashboards "desktop-first" — cada vez mais são acessados em tablets no chão de fábrica ou em campo.

---

## 5. Componentes base

### 5.1 Card de KPI

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  label: string
  value: string
  delta?: number // percentual, positivo ou negativo
}

export function KpiCard({ label, value, delta }: KpiCardProps) {
  const isPositive = (delta ?? 0) >= 0
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-semibold tabular-nums">
            {value}
          </span>
          {delta !== undefined && (
            <span
              className={cn(
                "flex items-center text-sm font-medium",
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
              )}
            >
              {isPositive ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
              {Math.abs(delta)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

```

### 5.2 Tabela de dados (TanStack Table + shadcn)

```tsx
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function DataTable<TData, TValue>({
  columns,
  data,
}: {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

```

> Para listas/tabelas muito longas (milhares de linhas renderizadas de uma vez), combine com `@tanstack/react-virtual` (ou `react-window`) para virtualizar as linhas — sem isso, o scroll começa a travar bem antes dos 10 mil registros.

### 5.3 Gráfico (Recharts + tokens de tema)

Ligue as cores do gráfico às variáveis de tema — nunca hardcode hex em um componente de chart, ou ele quebra ao trocar de tema:

```tsx
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis } from "recharts"

export function TrendChart({ data }: { data: { date: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-chart-1)"
          fill="url(#fillValue)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

```

> Para dashboards internos onde velocidade de entrega importa mais que customização fina, considere **Tremor** em vez de montar o gráfico manualmente com Recharts — ele já entrega o card + gráfico + legenda estilizados no padrão shadcn/ui. Alternativas full-feature quando o produto precisa de tipos de gráfico mais avançados (radar, sankey, treemap): **ECharts** (via `echarts-for-react`) ou **Visx** (composável, baixo nível, da Airbnb).

---

## 6. Layout responsivo

- **Grid, não flex, para o esqueleto da página.** CSS Grid com `grid-template-columns` responsivo é mais previsível que aninhar `flex` para layouts de dashboard com sidebar + conteúdo + painel lateral opcional.
- **Container queries em vez de apenas media queries** para componentes que se repetem em contextos de largura variável (ex.: o mesmo `KpiCard` numa grade de 4 colunas ou dentro de um painel lateral estreito). Tailwind v4 já traz suporte nativo a container queries como API de primeira classe, sem necessidade de plugins externos.

```tsx
<div className="@container">
  <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @2xl:grid-cols-4">
    {/* KpiCards */}
  </div>
</div>

```

- **Breakpoints de página** (sidebar colapsável): `< md` → sidebar vira drawer/sheet; `md–xl` → sidebar em modo ícone (rail); `> xl` → sidebar expandida por padrão. Persista a preferência do usuário (expandida/colapsada) em cookie ou backend, não apenas em estado de sessão em memória.
- **Tabelas em telas pequenas:** não tente espremer todas as colunas — priorize 2–3 colunas essenciais e mova o resto para um painel de detalhe expansível (`Collapsible` do shadcn) por linha.
- **Mobile-first ainda vale para dashboards internos.** Mesmo que o uso principal seja desktop, defina o layout de coluna única primeiro e adicione colunas nos breakpoints maiores (`sm`, `md`, `lg`, `xl` do Tailwind) — evita retrabalho quando o dashboard inevitavelmente é aberto num tablet em campo.

---

## 7. Padrões de interação e animação

Regra geral: **decida a ferramenta pelo tipo de animação, não por preferência pessoal.**


| Tipo de animação                                                                       | Ferramenta recomendada                                                                                                          |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Micro-interação de componente (hover, abrir/fechar menu, toggle)                       | **Motion** (`layout`, `AnimatePresence`) ou CSS/`tw-animate-css` puro quando não há estado de entrada/saída complexo            |
| Reordenação de lista, drag-and-drop de kanban                                          | **Motion** `layout` + `Reorder`, ou `@formkit/auto-animate` para o caso "zero-config"                                           |
| Timeline complexa, sequenciamento preciso, animação orientada a scroll com pinning     | **GSAP + ScrollTrigger** via `useGSAP`                                                                                          |
| Scroll suave de página inteira sincronizado com parallax/WebGL                         | **Lenis** (sincronizado com o ticker do GSAP quando os dois coexistem)                                                          |
| Cena 3D embutida (globo, gráfico volumétrico, hero decorativo)                         | **React Three Fiber + drei**                                                                                                    |
| Ilustração vetorial com estados interativos (onboarding, empty state animado)          | **Rive** (state machine) ou **Lottie/dotLottie** para animação linear exportada do After Effects                                |
| Entrada/saída simples de componente montando/desmontando (modal, toast, item de lista) | **React Transition Group** (`CSSTransition`) quando você só precisa de classes CSS de entrada/saída, sem física ou orquestração |
| Reveal simples ao entrar no viewport, sem JS                                           | **CSS scroll-driven animations** nativas (`animation-timeline: view()`), com fallback — ver seção 9                             |


Diretrizes:

1. **Um momento orquestrado por tela, não um efeito por seção.** Escolha o elemento que mais precisa de destaque (ex.: o hero do dashboard, ou o card de KPI que acabou de mudar) e anime só ele com cuidado; o resto permanece estável.
2. **Sempre respeite** `prefers-reduced-motion`**.** Motion e GSAP suportam isso nativamente com pouca configuração; para CSS puro, envolva a animação em `@media (prefers-reduced-motion: no-preference)`.
3. **Anime propriedades compostas pelo GPU** (`transform`, `opacity`) e evite animar `width`/`height`/`top`/`left` diretamente — layout thrashing é a causa mais comum de scroll travado em dashboards com muitos cards.
4. **Durações curtas para UI, mais longas para storytelling.** Micro-interações: 120–250ms. Transições de página/hero: 400–800ms. Qualquer coisa acima de ~1s deve ter uma razão de storytelling explícita, não ser o padrão de um card.
5. **Bibliotecas de scroll-reveal antigas (AOS, ScrollReveal.js, Locomotive Scroll) não entram no catálogo principal** deste guia (seção 9) — a primeira e a segunda estão com manutenção baixa/inativa, e a função de todas as três hoje é melhor coberta por Lenis (scroll suave) + CSS `animation-timeline` nativo (reveal) ou GSAP ScrollTrigger (quando precisa de precisão). Se herdar um projeto que já usa uma delas, não é motivo de pânico, mas evite adicionar em projetos novos.

Exemplo — reveal de card com Motion, respeitando o padrão de "responde a uma mudança de estado" (aqui, o carregamento de dados):

```tsx
import { motion, AnimatePresence } from "motion/react"

export function KpiGrid({ loading, items }: { loading: boolean; items: Kpi[] }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <AnimatePresence mode="popLayout">
        {!loading &&
          items.map((item) => (
            <motion.div
              key={item.label}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <KpiCard {...item} />
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  )
}

```

---

## 8. Acessibilidade

- **Parta de primitivos acessíveis** (Base UI ou Radix, via shadcn) e não reimplemente foco/teclado/ARIA manualmente para componentes como dropdown, dialog, combobox — é exatamente o problema que esses primitivos já resolvem. Se WCAG 2.1/2.2 for requisito contratual formal, avalie **React Aria** como camada ainda mais rigorosa.
- **Contraste mínimo AA (4.5:1) para texto normal, 3:1 para texto grande/ícones.** Teste os pares gerados pelo tweakcn ou pelo theme picker oficial nos dois modos — presets de tema nem sempre passam AA automaticamente, principalmente em `muted-foreground` sobre `muted`.
- **Foco visível sempre.** Não remova o `outline` padrão sem substituí-lo por um `ring` claramente visível (`focus-visible:ring-2 focus-visible:ring-ring`). Dashboards são frequentemente operados por teclado (usuários avançados, acessibilidade motora).
- **Use elementos nativos quando existirem** (`<button>` em vez de `<div role="button">`) — evita reimplementar semântica e comportamento de teclado que o navegador já dá de graça.
- **Não codifique estado só por cor.** Um valor "negativo" em vermelho também deve ter o ícone de seta para baixo (ver `KpiCard` acima) — daltonismo afeta cerca de 8% dos homens.
- `aria-live` **para dados que atualizam sozinhos.** Se um KPI muda em tempo real (websocket/polling), marque a região com `aria-live="polite"` para leitores de tela, mas sem re-anunciar a cada tick — debounce a atualização.
- **Gráficos precisam de alternativa textual.** Um `<AreaChart>` SVG não é acessível por padrão; forneça um resumo textual (`aria-label` com o insight principal, ex. "Receita subiu 12% nos últimos 30 dias") ou uma tabela de dados alternável.
- **Auditoria contínua:** rode Lighthouse/axe no CI (ver MCP de Chrome DevTools na seção 10) a cada PR que toca componentes visuais, não apenas antes do lançamento. Em desenvolvimento local, `@axe-core/react` roda apenas em modo dev e já alerta no console sobre violações WCAG em tempo real.

---

## 9. Catálogo de skills de animação

Cada ficha segue o formato: nome · descrição · auditoria/segurança · adoção · última mudança relevante · compatibilidade · link.

### 9.1 Motion (antes Framer Motion)

- **Descrição:** biblioteca de animação declarativa para React com motor híbrido (JS + WAAPI nativo), gestos, layout animations e suporte a SSR.
- **Auditoria/segurança:** licença MIT, mantida pela equipe da Framer; sem histórico relevante de CVE.
- **Adoção:** o pacote legado `framer-motion` (v13.x) segue com dezenas de milhões de downloads semanais e mais de 30 mil estrelas no GitHub — ainda a biblioteca de animação mais popular do ecossistema React, mesmo após o rebranding.
- **Última mudança relevante:** rebranding de "Framer Motion" para "Motion" (pacote `motion`, import `motion/react`); os mantenedores a descrevem como a única biblioteca com APIs de primeira classe tanto para JavaScript puro quanto para React, combinando um motor híbrido que mistura animação em JS com APIs nativas do navegador. Ambos os nomes de pacote (`framer-motion` e `motion`) seguem publicados e funcionais — novos projetos devem preferir `motion`.
- **Compatibilidade:** React 18/19, TypeScript nativo, funciona com Tailwind v4 sem fricção (classes + `motion.div`).
- **Link:** [https://motion.dev](https://motion.dev) · `npm install motion`

### 9.2 GSAP (GreenSock) + ScrollTrigger + `useGSAP`

- **Descrição:** motor de animação imperativo de altíssima performance, com plugin `ScrollTrigger` para animações e pinning orientados a scroll, e o hook oficial `useGSAP` para integração limpa com o ciclo de vida do React.
- **Auditoria/segurança:** sem CVEs relevantes conhecidos.
- **Adoção:** referência para animações complexas no estilo jogo e sequências elaboradas; um dos motores mais usados no mercado para trabalho de agência (Awwwards-grade).
- **Última mudança relevante:** desde a aquisição pela Webflow (out/2024), GSAP e **todos** os plugins antes pagos (SplitText, MorphSVG, DrawSVG, ScrollTrigger, ScrollSmoother, Inertia) são 100% gratuitos, inclusive para uso comercial, desde abril/2025 (linha 3.13+). **Ressalva de licença:** o texto do "Standard License" da Webflow proíbe usar GSAP para construir uma ferramenta visual de criação de animações sem código que compita com o próprio Webflow — irrelevante para a esmagadora maioria dos dashboards, mas vale checar se seu produto for, especificamente, um construtor visual de sites/animações.
- **Compatibilidade:** React 18/19 via `@gsap/react`; recomenda-se `gsap.registerPlugin(useGSAP, ScrollTrigger)` explicitamente para evitar bugs de StrictMode.
- **Link:** [https://gsap.com](https://gsap.com) · `npm install gsap @gsap/react`

### 9.3 Lenis (smooth scroll)

- **Descrição:** biblioteca leve de scroll suave, pensada para sincronizar com WebGL/parallax, mantendo scrollbar nativa e suporte a `position: sticky`.
- **Auditoria/segurança:** MIT, mantida pela [darkroom.engineering](http://darkroom.engineering); sem CVEs.
- **Adoção:** projeto de referência da categoria; sucessor direto do descontinuado `@studio-freight/lenis`.
- **Última mudança relevante:** pacote renomeado de `@studio-freight/lenis` para `lenis`; ocupa poucos KB gzip e mantém suporte nativo a acessibilidade (busca com Cmd+F, navegação por teclado, preserva a posição do scroll ao atualizar a página) — um diferencial frente ao GSAP ScrollSmoother e ao Locomotive Scroll.
- **Compatibilidade:** React via `lenis/react` (`<ReactLenis>`); integra-se ao ticker do GSAP com `lenis.on('scroll', ScrollTrigger.update)`.
- **Link:** [https://github.com/darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) · `npm install lenis`

### 9.4 React Three Fiber + drei

- **Descrição:** reconciliador React para Three.js — permite montar cenas 3D declarativamente como componentes React, com `@react-three/drei` fornecendo helpers prontos (câmeras, controles, texto 3D, física).
- **Auditoria/segurança:** MIT, mantido pela Poimandres; ecossistema maduro e amplamente auditado pela comunidade.
- **Adoção:** referência para 3D em React.
- **Última mudança relevante:** o ecossistema em torno do núcleo inclui pacotes complementares como `drei` (helpers), `gltfjsx` (conversão de GLTF em JSX), `postprocessing`, `uikit` (UI renderizada em WebGL), `rapier` (física 3D), `flex` (flexbox para cenas 3D) e `xr` (VR/AR).
- **Compatibilidade:** requer `three` como peer dependency; ótimo para hero decorativo ou visualização 3D de dados — evite em componentes que rendem centenas de vezes por sessão sem necessidade real de 3D (custo de bundle/GPU).
- **Link:** [https://docs.pmnd.rs/react-three-fiber](https://docs.pmnd.rs/react-three-fiber) · `npm install three @react-three/fiber @react-three/drei`

### 9.5 Rive

- **Descrição:** ferramenta de animação vetorial com **state machines** em tempo real — permite que design e lógica de interação (hover, clique, dados) controlem a animação sem escrever a lógica de transição em código.
- **Auditoria/segurança:** runtime open-source (licença MIT no runtime web), com editor proprietário; sem CVEs relevantes reportados.
- **Adoção:** crescimento contínuo da funcionalidade de State Machine da Rive, adotada tanto em UI de produto quanto em desenvolvimento de jogos; runtime gratuito (OSS), com planos pagos por equipe no editor.
- **Compatibilidade:** pacote `@rive-app/react-canvas`; ótimo para ilustrações de empty state e onboarding interativos com poucos KB.
- **Link:** [https://rive.app](https://rive.app) · `npm install @rive-app/react-canvas`

### 9.6 Lottie Web / dotLottie

- **Descrição:** reprodução de animações exportadas do Adobe After Effects (via plugin Bodymovin) como JSON; `dotLottie` empacota essas animações em um formato binário comprimido, reduzindo payload.
- **Auditoria/segurança:** MIT (Airbnb/LottieFiles); amplamente usado em produção, sem CVEs relevantes.
- **Adoção:** padrão de mercado para handoff design→dev de animações vetoriais complexas feitas por motion designers.
- **Compatibilidade:** `@lottiefiles/dotlottie-react` para React; ideal quando a equipe de design já produz animações em After Effects.
- **Link:** [https://lottiefiles.com](https://lottiefiles.com) · `npm install @lottiefiles/dotlottie-react`

### 9.7 Anime.js v4

- **Descrição:** motor de animação JS leve e flexível, com timelines, animação de SVG (`morphTo`, `createMotionPath`), `splitText` para animar texto por caractere/palavra/linha, e um `ScrollObserver` embutido.
- **Auditoria/segurança:** MIT; reescrita completa em TypeScript na v4.
- **Adoção:** alternativa leve ao GSAP para quem não precisa do ecossistema completo de plugins.
- **Última mudança relevante:** a v4 trouxe um wrapper de WAAPI com aceleração de hardware, os núcleos `Timer`/`Animation`/`Timeline`, `Animatable`/`Draggable` para interatividade, suporte a FLIP para animações de layout e o utilitário `stagger`.
- **Compatibilidade:** funciona bem com React via `useEffect`/refs; atenção à unidade de duração — é sempre em milissegundos, não segundos.
- **Link:** [https://animejs.com](https://animejs.com) · `npm install animejs`

### 9.8 @formkit/auto-animate

- **Descrição:** utilitário "zero-config" que anima automaticamente mudanças de layout (adicionar/remover item de lista, abrir/fechar accordion, reordenar) sem escrever nenhuma animação manualmente.
- **Auditoria/segurança:** MIT, mantido pela equipe FormKit; pacote de poucos KB, com um guia próprio catalogando e prevenindo erros comuns documentados (SSR, StrictMode do React 19, containers condicionais).
- **Adoção:** amplamente usado como "primeira animação" em projetos que não querem introduzir uma lib de animação completa.
- **Compatibilidade:** hook `useAutoAnimate()` em React; respeita `prefers-reduced-motion` automaticamente. Requer import dinâmico em apps com SSR (Next.js) para evitar erro de APIs de DOM no servidor.
- **Link:** [https://auto-animate.formkit.com](https://auto-animate.formkit.com) · `npm install @formkit/auto-animate`

### 9.9 React Spring

- **Descrição:** biblioteca de animação baseada em física de molas (spring), com API baseada em hooks (`useSpring`, `useTransition`, `useTrail`), popular também dentro do ecossistema `@react-three/fiber`.
- **Auditoria/segurança:** MIT; projeto maduro e estável.
- **Adoção:** segue popular para animações baseadas em física e interações por gesto, embora com crescimento mais lento que Motion nos últimos anos.
- **Compatibilidade:** React 18/19; considere-a quando precisar de animações que "carregam momentum" (interrupção suave) em vez de tweens de duração fixa.
- **Link:** [https://www.react-spring.dev](https://www.react-spring.dev) · `npm install @react-spring/web`

### 9.10 React Transition Group

- **Descrição:** solução mantida pelo próprio time do React (via `reactjs` no GitHub) para transições de montagem/desmontagem de componentes — não anima propriedades sozinha, apenas gerencia classes CSS de entrada/saída (`<CSSTransition>`, `<TransitionGroup>`).
- **Auditoria/segurança:** licença MIT; manutenção mais leve que as demais desta lista, mas API estável há anos e amplamente testada em produção.
- **Adoção:** ainda muito usada para casos simples (modal, toast, item de lista entrando/saindo) onde uma lib de animação completa seria excesso de engenharia.
- **Compatibilidade:** React 18/19; combine com classes Tailwind (`transition-opacity`) em vez de CSS separado.
- **Link:** [https://reactcommunity.org/react-transition-group/](https://reactcommunity.org/react-transition-group/) · `npm install react-transition-group`

### 9.11 CSS Scroll-Driven Animations nativas (`animation-timeline`)

- **Descrição:** especificação CSS nativa (`scroll-timeline`, `view-timeline`, atalhos `animation-timeline: scroll()`/`view()`) que liga o progresso de uma animação à posição de scroll, rodando na *compositor thread* — sem JavaScript.
- **Auditoria/segurança:** especificação W3C aberta; sem superfície de risco de segurança (é CSS puro).
- **Adoção/suporte de navegador (atualizado set/2026):** Chrome e Edge suportam sem flag desde a versão 115 (jul/2023). **Safari já saiu do beta** — o recurso está disponível desde o Safari 26.0 (lançamento estável, set/2025), com animações "threaded" adicionadas na 26.4 e correções de bugs na 26.5. **Firefox ainda depende de flag** (`layout.css.scroll-driven-animations.enabled`) mesmo em versões recentes (152, jun/2026), embora já esteja ativo por padrão no Nightly e seja prioridade declarada do **Interop 2026**. Com Chrome/Edge + Safari cobertos, o suporte global (caniuse) já passa de ~82%.
- **Compatibilidade:** use com `@supports (animation-timeline: scroll())` e um fallback JS (ex.: `IntersectionObserver`) para o Firefox estável — a especificação **não degrada graciosamente sozinha**: um navegador sem suporte simplesmente ignora a declaração, deixando ativa qualquer animação baseada em tempo que sobrar na regra, o que costuma disparar a animação inteira de uma vez, no lugar errado, assim que a página carrega. Trate como *progressive enhancement* já viável para efeitos decorativos, mas mantenha o fallback.
- **Link:** [https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)

### 9.12 Spline (bônus — 3D no-code)

- **Descrição:** ferramenta de criação e edição de cenas 3D direto no navegador, com exportação para componente React embutível.
- **Auditoria/segurança:** ferramenta proprietária com runtime de reprodução MIT (`@splinetool/react-spline`).
- **Adoção:** popular entre equipes de marketing/produto que precisam de conteúdo 3D mas não têm um especialista dedicado em Three.js.
- **Compatibilidade:** ótimo para heroes 3D custom feitos por designer sem escrever WebGL manualmente; monitore o peso da cena exportada (pode ser pesada em mobile).
- **Link:** [https://spline.design](https://spline.design) · `npm install @splinetool/react-spline`

---

## 10. MCPs úteis para o fluxo de frontend


| MCP                                                                             | Utilidade                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Como integrar                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Figma MCP (oficial, Dev Mode)**                                               | Lê seleção de frame no Figma (layout, variáveis, componentes vinculados) e gera código alinhado ao design system, em vez de trabalhar a partir de screenshot. Ferramentas atuais incluem `get_design_context` (representação React+Tailwind da seleção), `get_variable_defs` (tokens: cor, espaçamento, tipografia), `get_code_connect_map`/`add_code_connect_map` (mapeia nós do Figma para componentes reais do repo), `get_screenshot`, `get_metadata` e `create_design_system_rules` (gera um arquivo de regras para o agente). | Ativar em Figma Desktop: Preferences → Enable Dev Mode MCP Server (roda local em [`http://127.0.0.1:3845/mcp`](http://127.0.0.1:3845/mcp)); ou usar a versão hospedada ([`mcp.figma.com`](http://mcp.figma.com)) via OAuth para não depender do app desktop aberto. Requer seat Dev/Full em plano pago para a versão local; a remota é mais permissiva.                                     |
| **shadcn/ui MCP server** (`shadcn-ui-mcp-server` / MCP oficial embutido no CLI) | Dá ao agente acesso a código-fonte, metadados e exemplos reais dos componentes shadcn/ui — evita "alucinar" props ou variantes que não existem. Vale checar se o servidor que você instalar já sabe distinguir componentes Base UI vs. Radix, já que o projeto pode ter escolhido qualquer um dos dois desde jul/2026.                                                                                                                                                                                                              | `npx shadcn-ui-mcp-server`, com token do GitHub opcional para aumentar rate limit.                                                                                                                                                                                                                                                                                                          |
| **21st MCP** (antes "Magic MCP", [21st.dev](http://21st.dev))                   | Gera e também **busca** (mais de 10 mil) componentes React/Tailwind/shadcn a partir de linguagem natural (`/ui uma navbar responsiva com menu mobile`), publicando o arquivo direto no projeto no estilo do próprio código do time. Produz especificamente React + TypeScript sobre shadcn/ui, Tailwind CSS e Radix/Base UI — casa exatamente com a stack deste guia.                                                                                                                                                               | Instalar via `npx @21st-dev/cli@latest init --client &lt;cursor                                                                                                                                                                                                                                                                                                                             |
| **Chrome DevTools MCP (oficial, Google)**                                       | Conecta o agente a uma instância real do Chrome para rodar auditorias Lighthouse, tracing de performance, inspeção de rede/console, screenshots e depuração de memória — fecha o loop entre "gerar UI" e "validar que ela realmente performa/é acessível". Mantido pelo próprio time do Chrome DevTools, com dezenas de ferramentas organizadas por categoria (input, navegação, performance, rede, debug, emulação, memória).                                                                                                      | `npx chrome-devtools-mcp@latest` (ou `claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest`); use `--headless` em CI. A partir do Chrome M144+, suporta `--autoConnect` para anexar numa sessão já aberta (preserva login/cookies). Sensível a privacidade: o conteúdo do navegador é compartilhado com o cliente MCP — desative telemetria com `CI=1` se necessário. |
| **BrowserTools MCP**                                                            | Alternativa/complemento ao anterior — roda auditorias Lighthouse de acessibilidade, performance e SEO diretamente sobre a página atual, através de uma extensão Chrome dedicada. Útil quando o Chrome DevTools MCP não é uma opção (ex.: restrição de política corporativa a extensões vs. CLI).                                                                                                                                                                                                                                    | Instalar extensão Chrome + `npx @agentdeskai/browser-tools-mcp@latest` + servidor node local.                                                                                                                                                                                                                                                                                               |


---

## 11. Outros recursos que enriquecem a UI

- **Formulários:** `react-hook-form` + `zod` (+ `@hookform/resolvers`) para validação tipada ponta a ponta; o próprio CLI do shadcn (`shadcn add form`) já gera esse padrão.
- **Tabelas/dados server-side:** `@tanstack/react-table` (headless, total controle de markup) combinado com `@tanstack/react-query` para cache/refetch — hoje o padrão de facto para estado de servidor (cache, refetch em segundo plano, estados de loading). Para listas/tabelas muito longas, some `@tanstack/react-virtual` ou `react-window`.
- **Estado de UI local/global:** `zustand` para estado leve compartilhado entre componentes (ex.: sidebar aberta/fechada, filtros ativos) sem o boilerplate do Redux.
- **Drag-and-drop:** `dnd-kit` — biblioteca headless e acessível, comum em quadros kanban dentro de dashboards.
- **Datas:** `date-fns` (tree-shakeable) em vez de `moment` (descontinuado) para formatação/manipulação de datas em tabelas e filtros.
- **Command palette:** `cmdk` (base do componente `Command` do shadcn) para busca rápida `Cmd+K` — cada vez mais esperado em produtos de dashboard densos.
- **Ícones:** `lucide-react` como padrão; para ícones de marca/produto fora do set do Lucide, prefira SVGs otimizados via `svgo` a fontes de ícone.
- **Gráficos alternativos:** quando Recharts/Tremor não cobrem o tipo de visualização (radar, sankey, treemap, mapas), considere **ECharts** (`echarts-for-react`), **Visx** (Airbnb, composável e de baixo nível) ou **Chart.js** (via `react-chartjs-2`).
- **Componentes headless adicionais:** `Headless UI` (Tailwind Labs) como alternativa leve a Radix/Base UI para menus, listbox e combobox simples.
- **Skeleton/loading:** componente `Skeleton` do shadcn combinado com `Suspense` do React 19 para estados de carregamento por seção, em vez de um spinner de página inteira.
- **Otimização de imagens:** lazy-loading nativo (`<img loading="lazy">`) e formatos modernos (WebP/AVIF); o Vite cuida do hashing/otimização automática em build.
- **Boas práticas React:** `React.lazy` + `Suspense` para code splitting; `useMemo`/`useCallback` para evitar re-renderização excessiva; memoização de listas complexas.
- **Validação de acessibilidade em dev:** `@axe-core/react` rodando apenas em modo desenvolvimento, alertando no console sobre violações WCAG em tempo real durante o desenvolvimento local.

---

## 12. Resumo executivo

- **Base obrigatória:** Tailwind CSS v4.3 (tokens nativos em CSS via `@theme`) + shadcn/ui (componentes copiados) + tweakcn (edição visual do tema) — as três peças já se encaixam por convenção, sem trabalho extra de integração.
- **Camada de primitivos: escolha e documente.** Desde jul/2026, `shadcn init` usa **Base UI** por padrão (mantido em tempo integral pela MUI, API de render props, v1.0 estável desde dez/2025); **Radix** continua totalmente suportado (`-b radix`) e é a escolha segura para projetos existentes, mas seu ritmo de updates caiu desde a aquisição pela WorkOS. Novos projetos: prefira Base UI, a menos que já exista uma razão específica para Radix.
- **Estrutura de tokens:** duas camadas — variáveis semânticas em `:root`/`.dark` (o que o tweakcn ou o theme picker oficial exportam) e um bloco `@theme inline` que expõe essas variáveis como utilities Tailwind (`bg-primary`, `text-muted-foreground` etc.).
- **Dados como protagonistas:** para gráficos, `Recharts` é o padrão seguro; `Tremor` acelera quando a estética "pronta" já serve; `ECharts`/`Visx` cobrem casos avançados. Todos devem consumir as cores via `var(--color-chart-N)`, nunca hex fixo.
- **Animação por tipo de necessidade, não por preferência:** `Motion` para micro-interações e estado de UI; `GSAP + ScrollTrigger` para timelines complexas e scroll orquestrado (100% gratuito, com uma ressalva de licença para construtores visuais concorrentes do Webflow); `Lenis` para scroll suave de página inteira; `React Three Fiber` para 3D; `Rive`/`Lottie` para ilustração vetorial interativa; `React Transition Group` para entrada/saída simples; CSS `animation-timeline` nativo já é viável como *progressive enhancement* (Chrome/Edge/Safari cobertos, Firefox ainda atrás de flag), sempre com fallback.
- **Arquivo** `DESIGN.md` **em** `./docs/`, referenciado a partir do arquivo de instruções que o agente já lê no boot (`CLAUDE.md`/`AGENTS.md`/regras do editor) — tratado como fonte de verdade única para tokens, com o `globals.css` gerado a partir dele.
- **MCPs que fecham o loop design→código→validação:** Figma MCP (design→contexto, com `get_design_context`/`get_variable_defs`/`create_design_system_rules`), shadcn MCP + 21st MCP (contexto→código, o antigo Magic MCP), Chrome DevTools MCP oficial do Google (código→auditoria de performance/acessibilidade) — os três cobrem o ciclo completo dentro do próprio editor do agente.
- **Acessibilidade não é opcional em dashboard:** contraste AA, foco visível, nunca codificar estado só por cor, e alternativa textual para gráficos — validado continuamente via MCP de DevTools/Lighthouse, não apenas antes do lançamento.

---

## Decisões deste projeto (fast-backend) — log datado (§1)

- **2026-09 (PR2):** sem Google Fonts — `index.css` usa stacks 100% do sistema (offline-safe, LGPD-limpo); nada de `@import` de terceiros.
- **2026-09 (PR2):** `--radius: 0rem` mantido do tema tweakcn (identidade sharp); mapeamento `@theme inline` é superconjunto do esqueleto §4.2 (popover/sidebar extras vindos do export).
- **2026-09 (PR2):** sem `tw-animate-css` — animação via `motion` (PR3) + keyframes de toast existentes; nada duplicado.
- **2026-09 (PR2):** densidade via `--row-gap` (confortável default, `[data-density="compact"]` opt-in); alvos touch `h-9` (36px) dentro da faixa §4.4.
- **2026-09 (PR6):** links de texto usam `text-foreground` + `decoration-primary` (lima `text-primary` sobre fundo claro reprova AA — pego pelo axe); avatar usa `text-foreground` sobre `bg-muted` pelo mesmo motivo. Baselines visuais por plataforma (`{platform}`) por divergência de fontes.

