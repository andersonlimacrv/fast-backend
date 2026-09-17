---

title: Animated Circular Progress Bar

date: 2024-05-28

description: Animated Circular Progress Bar is a component that displays a circular gauge with a percentage value.

author: luis-codex

published: true

---

&lt;ComponentPreview name="animated-circular-progress-bar-demo" /&gt;

## Installation

&lt;Tabs defaultValue="cli"&gt;

&lt;TabsList&gt;

  &lt;TabsTrigger value="cli"&gt;CLI&lt;/TabsTrigger&gt;

  &lt;TabsTrigger value="manual"&gt;Manual&lt;/TabsTrigger&gt;

&lt;/TabsList&gt;

&lt;TabsContent value="cli"&gt;

```bash

npx shadcn@latest add @magicui/animated-circular-progress-bar

```

&lt;/TabsContent&gt;

&lt;TabsContent value="manual"&gt;

&lt;Steps&gt;

&lt;Step&gt;Copy and paste the following code into your project.&lt;/Step&gt;

```tsx

import { cn } from "@/lib/utils"

interface AnimatedCircularProgressBarProps {

  max?: number

  min?: number

  value: number

  gaugePrimaryColor: string

  gaugeSecondaryColor: string

  className?: string

}

export function AnimatedCircularProgressBar({

  max = 100,

  min = 0,

  value = 0,

  gaugePrimaryColor,

  gaugeSecondaryColor,

  className,

}: AnimatedCircularProgressBarProps) {

  const circumference = 2  *Math.PI*  45

  const percentPx = circumference / 100

  const currentPercent = Math.round(((value - min) / (max - min)) * 100)

  return (

    &lt;div

      className={cn("relative size-40 text-2xl font-semibold", className)}

      style={

        {

          "--circle-size": "100px",

          "--circumference": circumference,

          "--percent-to-px": `${percentPx}px`,

          "--gap-percent": "5",

          "--offset-factor": "0",

          "--transition-length": "1s",

          "--transition-step": "200ms",

          "--delay": "0s",

          "--percent-to-deg": "3.6deg",

          transform: "translateZ(0)",

        } as React.CSSProperties

      }

    &gt;

      &lt;svg

        fill="none"

        className="size-full"

        strokeWidth="2"

        viewBox="0 0 100 100"

      &gt;

        {currentPercent &lt;= 90 &amp;&amp; currentPercent &gt;= 0 &amp;&amp; (

          &lt;circle

            cx="50"

            cy="50"

            r="45"

            strokeWidth="10"

            strokeDashoffset="0"

            strokeLinecap="round"

            strokeLinejoin="round"

            className="opacity-100"

            style={

              {

                stroke: gaugeSecondaryColor,

                "--stroke-percent": 90 - currentPercent,

                "--offset-factor-secondary": "calc(1 - var(--offset-factor))",

                strokeDasharray:

                  "calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)",

                transform:

                  "rotate(calc(1turn - 90deg - (var(--gap-percent)  *var(--percent-to-deg)*  var(--offset-factor-secondary)))) scaleY(-1)",

                transition: "all var(--transition-length) ease var(--delay)",

                transformOrigin:

                  "calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)",

              } as React.CSSProperties

            }

          /&gt;

        )}

        &lt;circle

          cx="50"

          cy="50"

          r="45"

          strokeWidth="10"

          strokeDashoffset="0"

          strokeLinecap="round"

          strokeLinejoin="round"

          className="opacity-100"

          style={

            {

              stroke: gaugePrimaryColor,

              "--stroke-percent": currentPercent,

              strokeDasharray:

                "calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)",

              transition:

                "var(--transition-length) ease var(--delay),stroke var(--transition-length) ease var(--delay)",

              transitionProperty: "stroke-dasharray,transform",

              transform:

                "rotate(calc(-90deg + var(--gap-percent)  *var(--offset-factor)*  var(--percent-to-deg)))",

              transformOrigin:

                "calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)",

            } as React.CSSProperties

          }

        /&gt;

      &lt;/svg&gt;

      &lt;span

        data-current-value={currentPercent}

        className="animate-in fade-in absolute inset-0 m-auto size-fit delay-(--delay) duration-(--transition-length) ease-linear"

      &gt;

        {currentPercent}

      &lt;/span&gt;

    &lt;/div&gt;

  )

}

```

&lt;Step&gt;Update the import paths to match your project setup.&lt;/Step&gt;

&lt;/Steps&gt;

&lt;/TabsContent&gt;

&lt;/Tabs&gt;

## Usage

```tsx showLineNumbers

import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar"

```

```tsx showLineNumbers

&lt;AnimatedCircularProgressBar /&gt;

```

## Props

| Prop                  | Type     | Default | Description                                   |

| --------------------- | -------- | ------- | --------------------------------------------- |

| `className`           | `string` | `-`     | The class name to be applied to the component |

| `max`                 | `number` | `100`   | The maximum value of the gauge                |

| `min`                 | `number` | `0`     | The minimum value of the gauge                |

| `value`               | `number` | `0`     | The current value of the gauge                |

| `gaugePrimaryColor`   | `string` | `-`     | The primary color of the gauge                |

| `gaugeSecondaryColor` | `string` | `-`     | The secondary color of the gauge              |

## Credits

- Credit to [@luis-code]([https://luis-code.vercel.app/](https://luis-code.vercel.app/))

