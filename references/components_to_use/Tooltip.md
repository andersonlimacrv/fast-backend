Install dependencies:

```bash

npm: npm install motion/react lucide-react react-icons

yarn: yarn add motion/react lucide-react react-icons

pnpm: pnpm add motion/react lucide-react react-icons

bun: bun add motion/react lucide-react react-icons

```

Copy-paste this component to /components/ui folder:

```tsx

demo.tsx

import { GooeyMenu } from './original';

const data = [

  {

    key: 'title',

    label: 'Next.js',

    value: 'v13.4.8',

    labelClass: 'text-sm font-medium text-neutral-500',

    valueClass: 'text-sm text-neutral-500',

  },

  {

    key: 'errors',

    label: 'Errors',

    value: '20',

    labelClass: 'text-sm font-medium',

    valueClass:

      'text-sm flex items-center justify-center rounded-full border border-[#EB5757]/10 bg-[#EB5757]/15 p-1 px-2 font-mono text-red-500 bg-red-500/20',

  },

  {

    key: 'route',

    label: 'Route',

    value: 'Static',

    labelClass: 'text-sm font-medium',

    valueClass: 'text-sm text-[#a09f9f]',

  },

];

export default function GooeyMenuDemo() {

  return &lt;GooeyMenu data={data} /&gt;;

}

gooey-menu-base.tsx

'use client';

import { useState } from 'react';

import { motion, AnimatePresence, type Variants } from 'motion/react';

interface GooeyMenuProps {

  data: GooeyMenuData[];

}

interface GooeyMenuData {

  key: string;

  label: string;

  value: string;

  labelClass: string;

  valueClass: string;

}

const DIMENSIONS = {

  min: 40,

  max: 200,

};

const DEFAULT_DATA: GooeyMenuData[] = [

  {

    key: 'title',

    label: 'Next.js',

    value: 'v13.4.8',

    labelClass: 'text-sm font-medium text-muted-foreground',

    valueClass: 'text-sm text-muted-foreground',

  },

  {

    key: 'errors',

    label: 'Errors',

    value: '20',

    labelClass: 'text-sm font-medium',

    valueClass:

      'text-sm flex items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10 p-1 px-2 font-mono text-destructive bg-destructive/20',

  },

  {

    key: 'route',

    label: 'Route',

    value: 'Static',

    labelClass: 'text-sm font-medium',

    valueClass: 'text-sm text-muted-foreground',

  },

];

const menuVariants: Variants = {

  closed: {

    y: 0,

    borderRadius: 20,

    width: DIMENSIONS.min,

    height: DIMENSIONS.min,

    z: -10,

    transition: {

      type: 'spring',

      stiffness: 300,

      damping: 30,

      y: { delay: 0.15 },

      width: { delay: 0 },

      height: { delay: 0 },

    },

  },

  open: {

    y: -50,

    borderRadius: 10,

    width: DIMENSIONS.max,

    height: 'auto',

    transition: {

      type: 'spring',

      stiffness: 300,

      damping: 30,

      width: { delay: 0.15 },

      height: { delay: 0.15 },

      borderRadius: { delay: 0.15 },

    },

  },

};

export function GooeyMenu({ data = DEFAULT_DATA }: GooeyMenuProps) {

  const [isOpen, setIsOpen] = useState(false);

  return (

    &lt;div className="theme-injected relative flex h-full min-h-125 w-full items-center justify-center bg-transparent"&gt;

      &lt;svg

        xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"

        className="absolute bottom-0 left-0"

        version="1.1"

      &gt;

        &lt;defs&gt;

          &lt;filter id="goo"&gt;

            &lt;feGaussianBlur

              in="SourceGraphic"

              stdDeviation="4.4"

              result="blur"

            /&gt;

            &lt;feColorMatrix

              in="blur"

              mode="matrix"

              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7"

              result="SkiperGooeyFilter"

            /&gt;

            &lt;feBlend in="SourceGraphic" in2="goo" /&gt;

          &lt;/filter&gt;

        &lt;/defs&gt;

      &lt;/svg&gt;

      &lt;div style={{ filter: 'url(#goo)' }} className="absolute"&gt;

        &lt;motion.button

          onMouseEnter={() =&gt; setIsOpen(true)}

          onMouseLeave={() =&gt; setIsOpen(false)}

          onClick={() =&gt; setIsOpen(!isOpen)}

          className="bg-muted text-muted-foreground border-border relative z-20 flex size-10 cursor-pointer items-center justify-center rounded-lg border border-none"

        &gt;

          &lt;svg width="32" height="32" viewBox="0 0 180 180" fill="none"&gt;

            &lt;path

              d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.356L137.352 160.6Z"

              className="fill-foreground"

            /&gt;

            &lt;path

              d="M115.352 54H127.466V125.97H115.352V54Z"

              className="fill-foreground"

            /&gt;

          &lt;/svg&gt;

        &lt;/motion.button&gt;

        &lt;AnimatePresence&gt;

          {isOpen &amp;&amp; (

            &lt;motion.div

              key="menu-content"

              variants={menuVariants}

              initial="closed"

              animate="open"

              exit="closed"

              className="bg-muted text-muted-foreground  absolute bottom-0 overflow-hidden rounded-lg "

            &gt;

              &lt;motion.div

                className="grid w-[200px] space-y-2 p-4"

                initial={{ opacity: 0 }}

                animate={{ opacity: 1 }}

                exit={{ opacity: 0, transition: { duration: 0.1 } }}

                transition={{ duration: 0.2, delay: 0.15 }}

              &gt;

                {[data.map](http://data.map)((item, index) =&gt; (

                  &lt;motion.div

                    key={item.key}

                    className="text-foreground flex items-center justify-between"

                    initial={{ opacity: 0, y: 6 }}

                    animate={{ opacity: 1, y: 0 }}

                    exit={{ opacity: 0, y: 4 }}

                    transition={{

                      duration: 0.25,

                      delay: 0.1 + index * 0.05,

                    }}

                  &gt;

                    &lt;span className={item.labelClass}&gt;{item.label}&lt;/span&gt;

                    &lt;span className={item.valueClass}&gt;{item.value}&lt;/span&gt;

                  &lt;/motion.div&gt;

                ))}

              &lt;/motion.div&gt;

            &lt;/motion.div&gt;

          )}

        &lt;/AnimatePresence&gt;

      &lt;/div&gt;

    &lt;/div&gt;

  );

}

gooey-menu.tsx

'use client';

import { useState } from 'react';

import { motion, AnimatePresence, type Variants } from 'motion/react';

interface GooeyMenuProps {

  data: GooeyMenuData[];

}

interface GooeyMenuData {

  key: string;

  label: string;

  value: string;

  labelClass: string;

  valueClass: string;

}

const DIMENSIONS = {

  min: 40,

  max: 200,

};

const DEFAULT_DATA: GooeyMenuData[] = [

  {

    key: 'title',

    label: 'Next.js',

    value: 'v13.4.8',

    labelClass: 'text-sm font-medium text-neutral-500',

    valueClass: 'text-sm text-neutral-500',

  },

  {

    key: 'errors',

    label: 'Errors',

    value: '20',

    labelClass: 'text-sm font-medium',

    valueClass:

      'text-sm flex items-center justify-center rounded-full border border-[#EB5757]/10 bg-[#EB5757]/15 p-1 px-2 font-mono text-red-500 bg-red-500/20',

  },

  {

    key: 'route',

    label: 'Route',

    value: 'Static',

    labelClass: 'text-sm font-medium',

    valueClass: 'text-sm text-[#a09f9f]',

  },

];

const menuVariants: Variants = {

  closed: {

    y: 0,

    borderRadius: 20,

    width: DIMENSIONS.min,

    height: DIMENSIONS.min,

    z: -10,

    transition: {

      // duration: 0.4,

      // ease: [0.22, 1, 0.36, 1],

      type: 'spring',

      stiffness: 300,

      damping: 30,

      y: { delay: 0.15 },

      width: { delay: 0 },

      height: { delay: 0 },

    },

  },

  open: {

    y: -50,

    borderRadius: 10,

    width: DIMENSIONS.max,

    height: 'auto',

    transition: {

      // duration: 0.4,

      // ease: [0.22, 1, 0.36, 1],

      type: 'spring',

      stiffness: 300,

      damping: 30,

      width: { delay: 0.15 },

      height: { delay: 0.15 },

      borderRadius: { delay: 0.15 },

    },

  },

};

export function GooeyMenu({ data = DEFAULT_DATA }: GooeyMenuProps) {

  const [isOpen, setIsOpen] = useState(false);

  return (

    &lt;div className="relative flex h-full min-h-125 w-full items-center justify-center  bg-transparent"&gt;

      &lt;svg

        xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"

        className="absolute bottom-0 left-0"

        version="1.1"

      &gt;

        &lt;defs&gt;

          &lt;filter id="goo"&gt;

            &lt;feGaussianBlur

              in="SourceGraphic"

              stdDeviation="4.4"

              result="blur"

            /&gt;

            &lt;feColorMatrix

              in="blur"

              mode="matrix"

              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7"

              result="SkiperGooeyFilter"

            /&gt;

            &lt;feBlend in="SourceGraphic" in2="goo" /&gt;

          &lt;/filter&gt;

        &lt;/defs&gt;

      &lt;/svg&gt;

      &lt;div style={{ filter: 'url(#goo)' }} className="absolute"&gt;

        &lt;motion.button

          onMouseEnter={() =&gt; setIsOpen(true)}

          onMouseLeave={() =&gt; setIsOpen(false)}

          onClick={() =&gt; setIsOpen(!isOpen)}

          className="relative z-20 flex size-10 cursor-pointer items-center justify-center rounded-full border-none bg-black dark:bg-neutral-800"

        &gt;

          &lt;svg width="32" height="32" viewBox="0 0 180 180" fill="none"&gt;

            &lt;path

              d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.356L137.352 160.6Z"

              className="fill-white dark:fill-white"

            /&gt;

            &lt;path

              d="M115.352 54H127.466V125.97H115.352V54Z"

              className="fill-white dark:fill-white"

            /&gt;

          &lt;/svg&gt;

        &lt;/motion.button&gt;

        &lt;AnimatePresence&gt;

          {isOpen &amp;&amp; (

            &lt;motion.div

              key="menu-content"

              variants={menuVariants}

              initial="closed"

              animate="open"

              exit="closed"

              className="absolute bottom-0 overflow-hidden bg-black dark:bg-neutral-800"

            &gt;

              &lt;motion.div

                className="grid w-[200px] space-y-2 p-4"

                initial={{ opacity: 0 }}

                animate={{ opacity: 1 }}

                exit={{ opacity: 0, transition: { duration: 0.1 } }}

                transition={{ duration: 0.2, delay: 0.15 }}

              &gt;

                {[data.map](http://data.map)((item, index) =&gt; (

                  &lt;motion.div

                    key={item.key}

                    className="flex items-center justify-between text-white"

                    initial={{ opacity: 0, y: 6 }}

                    animate={{ opacity: 1, y: 0 }}

                    exit={{ opacity: 0, y: 4 }}

                    transition={{

                      duration: 0.25,

                      delay: 0.1 + index * 0.05,

                    }}

                  &gt;

                    &lt;span className={item.labelClass}&gt;{item.label}&lt;/span&gt;

                    &lt;span className={item.valueClass}&gt;{item.value}&lt;/span&gt;

                  &lt;/motion.div&gt;

                ))}

              &lt;/motion.div&gt;

            &lt;/motion.div&gt;

          )}

        &lt;/AnimatePresence&gt;

      &lt;/div&gt;

    &lt;/div&gt;

  );

}

```