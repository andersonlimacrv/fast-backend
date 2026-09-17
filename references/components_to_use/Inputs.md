Install dependencies:

```bash

npm: npm install motion/react

yarn: yarn add motion/react

pnpm: pnpm add motion/react

bun: bun add motion/react

```

Copy-paste this component to /components/ui folder:

```tsx

demo.tsx

import { FloatingInput } from "./original";

export default function FloatingInputDemo() {

  return (

    &lt;div className="flex flex-col gap-4 items-center justify-center p-10 max-w-sm mx-auto"&gt;

      &lt;FloatingInput label="Email Address" type="email" /&gt;

      &lt;FloatingInput label="Password" type="password" /&gt;

    &lt;/div&gt;

  );

}

floating-input-base.tsx

import { cn } from "@/lib/utils";

import { useState } from "react";

interface FloatingInputProps extends React.InputHTMLAttributes&lt;HTMLInputElement&gt; {

  label: string;

}

export function FloatingInput({ label, className, ...props }: FloatingInputProps) {

  const [focused, setFocused] = useState(false);

  const [hasValue, setHasValue] = useState(false);

  return (

    &lt;div className="relative"&gt;

      &lt;input

        className={cn(

          "peer w-full px-4 py-3 border rounded-lg bg-input outline-none",

          "border-border focus:border-primary transition-colors",

          className

        )}

        placeholder=" "

        onFocus={() =&gt; setFocused(true)}

        onBlur={(e) =&gt; {

          setFocused(false);

          setHasValue([e.target](http://e.target).value !== "");

        }}

        onChange={(e) =&gt; setHasValue([e.target](http://e.target).value !== "")}

        {...props}

      /&gt;

      &lt;label

        className={cn(

          "absolute left-4 top-3 text-muted-foreground transition-all duration-200 pointer-events-none",

          "peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-background peer-focus:px-1",

          "peer-focus:text-primary",

          (focused || hasValue) &amp;&amp; "-top-2.5 left-3 text-xs bg-background px-1"

        )}

      &gt;

        {label}

      &lt;/label&gt;

    &lt;/div&gt;

  );

}

floating-input.tsx

import { cn } from "@/lib/utils";

import { useState } from "react";

interface FloatingInputProps extends React.InputHTMLAttributes&lt;HTMLInputElement&gt; {

  label: string;

}

export function FloatingInput({ label, className, ...props }: FloatingInputProps) {

  const [focused, setFocused] = useState(false);

  const [hasValue, setHasValue] = useState(false);

  return (

    &lt;div className="relative"&gt;

      &lt;input

        className={cn(

          "peer w-full px-4 py-3 border rounded-lg bg-transparent outline-none",

          "border-border focus:border-primary transition-colors",

          className

        )}

        placeholder=" "

        onFocus={() =&gt; setFocused(true)}

        onBlur={(e) =&gt; {

          setFocused(false);

          setHasValue([e.target](http://e.target).value !== "");

        }}

        onChange={(e) =&gt; setHasValue([e.target](http://e.target).value !== "")}

        {...props}

      /&gt;

      &lt;label

        className={cn(

          "absolute left-4 top-3 text-muted-foreground transition-all duration-200 pointer-events-none",

          "peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:bg-background peer-focus:px-1",

          "peer-focus:text-primary",

          (focused || hasValue) &amp;&amp; "-top-2.5 left-3 text-xs bg-background px-1"

        )}

      &gt;

        {label}

      &lt;/label&gt;

    &lt;/div&gt;

  );

}

```