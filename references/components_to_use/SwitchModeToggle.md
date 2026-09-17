## Install dependencies:

```bash

npm: npm install motion/react react-icons

yarn: yarn add motion/react react-icons

pnpm: pnpm add motion/react react-icons

bun: bun add motion/react react-icons

```

Copy-paste this component to /components/ui folder:

```tsx

demo.tsx

import { SwitchMode } from "./original";

export default function SwitchModeDemo() {

    return (

        &lt;div className="flex items-center justify-center"&gt;

            &lt;SwitchMode

                width={180}

                height={90}

                darkColor="#111"

                lightColor="#F9F9F9"

                knobDarkColor="#1C1C1C"

                knobLightColor="#F3F3F7"

                borderDarkColor="#444"

                borderLightColor="#DDD"

            /&gt;

        &lt;/div&gt;

    );

}

switch-mode-base.tsx

'use client';

import { useEffect, useState, type FC } from 'react';

import { motion } from 'motion/react';

import {

  IoMoon,

  IoMoonOutline,

  IoSunny,

  IoSunnyOutline,

} from 'react-icons/io5';

import { useTheme } from 'next-themes';

interface SwitchModeProps {

  width?: number;

  height?: number;

}

export const SwitchMode: FC&lt;SwitchModeProps&gt; = ({

  width = 144,

  height = 72,

}) =&gt; {

  const [mounted, setMounted] = useState(false);

  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() =&gt; {

    requestAnimationFrame(() =&gt; setMounted(true));

  }, []);

  if (!mounted) {

    return (

      &lt;div

        style={{ width, height }}

        className="theme-injected border-border rounded-lg border-2"

      /&gt;

    );

  }

  const isDark = resolvedTheme === 'dark';

  const iconSize = height * 0.45;

  return (

    &lt;motion.button

      onClick={() =&gt; setTheme(isDark ? 'light' : 'dark')}

      className="theme-injected border-border bg-background relative flex items-center rounded-lg border-2 transition-colors"

      style={{ width, height }}

    &gt;

      {/* TRACK */}

      &lt;motion.div

        className="bg-background absolute inset-0 rounded-lg"

        transition={{ duration: 0.4 }}

      /&gt;

      {/* KNOB */}

      &lt;motion.div

        layout

        layoutId="switch-knob"

        transition={{ type: 'spring', stiffness: 260, damping: 20 }}

        className="border-border bg-muted shadow-xs absolute z-30 rounded-lg border-2"

        style={{

          width: height,

          height,

          right: isDark ? -2 : undefined,

          left: isDark ? undefined : -2,

        }}

      /&gt;

      {/* SUN */}

      &lt;motion.div

        className="relative z-30 flex items-center justify-center"

        style={{ width: height, height }}

        animate={{ rotate: isDark ? 45 : 0 }}

        transition={{ stiffness: 20 }}

      &gt;

        {isDark ? (

          &lt;IoSunnyOutline

            className="text-muted-foreground transition-colors duration-200"

            style={{ width: iconSize, height: iconSize }}

          /&gt;

        ) : (

          &lt;IoSunny

            className="text-foreground transition-colors duration-200"

            style={{ width: iconSize, height: iconSize }}

          /&gt;

        )}

      &lt;/motion.div&gt;

      {/* MOON */}

      &lt;motion.div

        className="relative z-30 flex items-center justify-center"

        style={{ width: height, height }}

        animate={{ rotate: isDark ? 0 : 15 }}

        transition={{ stiffness: 20, damping: 14 }}

      &gt;

        {isDark ? (

          &lt;IoMoon

            className="text-foreground transition-colors duration-200"

            style={{ width: iconSize, height: iconSize }}

          /&gt;

        ) : (

          &lt;IoMoonOutline

            className="text-muted-foreground transition-colors duration-200"

            style={{ width: iconSize, height: iconSize }}

          /&gt;

        )}

      &lt;/motion.div&gt;

    &lt;/motion.button&gt;

  );

};

switch-mode.tsx

"use client";

import { useEffect, useState, type FC } from "react";

import { motion } from "motion/react";

import { IoMoon, IoMoonOutline, IoSunny, IoSunnyOutline } from "react-icons/io5";

import { useTheme } from "next-themes";

/* --- Props --- */

interface SwitchModeProps {

    width?: number;

    height?: number;

    darkColor?: string;

    lightColor?: string;

    knobDarkColor?: string;

    knobLightColor?: string;

    borderDarkColor?: string;

    borderLightColor?: string;

}

export const SwitchMode: FC&lt;SwitchModeProps&gt; = ({

    width = 144,

    height = 72,

    darkColor = "#0B0B0B",

    lightColor = "#FFFFFF",

    knobDarkColor = "#2A2A2E",

    knobLightColor = "#F3F2F7",

    borderDarkColor = "#4C4C50",

    borderLightColor = "#D8D6E0",

}) =&gt; {

    const [mounted, setMounted] = useState(false);

    const { resolvedTheme, setTheme } = useTheme();

    useEffect(() =&gt; {

        requestAnimationFrame(() =&gt; setMounted(true));

    }, []);

    if (!mounted) {

        return &lt;div style={{ width, height }} className="rounded-full border-2 border-transparent" /&gt;;

    }

    const isDark = resolvedTheme === "dark";

    const iconSize = height * 0.45;

    return (

        &lt;motion.button

            onClick={() =&gt; setTheme(isDark ? "light" : "dark")}

            className="relative flex items-center rounded-full border-2 transition-colors"

            style={{

                width,

                height,

                borderColor: isDark ? borderDarkColor : borderLightColor,

            }}

        &gt;

            {/* TRACK */}

            &lt;motion.div

                className="absolute inset-0 rounded-full"

                animate={{ backgroundColor: isDark ? darkColor : lightColor }}

                transition={{ duration: 0.4 }}

            /&gt;

            {/* SLIDING KNOB */}

            &lt;motion.div

                layout

                layoutId="switch-knob"

                transition={{ type: "spring", stiffness: 260, damping: 20 }}

                className="absolute rounded-full border-2 z-30"

                style={{

                    width: height,

                    height,

                    right: isDark ? -2 : undefined,

                    left: isDark ? undefined : -2,

                    backgroundColor: isDark ? knobDarkColor : knobLightColor,

                    borderColor: isDark ? borderDarkColor : borderLightColor,

                }}

            /&gt;

            {/* SUN */}

            &lt;motion.div

                className="relative z-30 flex items-center justify-center"

                style={{ width: height, height }}

                animate={{ rotate: isDark ? 45 : 0 }}

                transition={{ stiffness: 20 }}

            &gt;

                {isDark ? (

                    &lt;IoSunnyOutline

                        color="#8A8A8F"

                        fill="#8A8A8F"

                        stroke="#8A8A8F"

                        style={{ width: iconSize, height: iconSize }}

                        className="transition-colors duration-200"

                    /&gt;

                ) : (

                    &lt;IoSunny

                        color="#686771"

                        fill="#686771"

                        style={{ width: iconSize, height: iconSize }}

                        className="transition-colors duration-200"

                    /&gt;

                )}

            &lt;/motion.div&gt;

            {/* MOON */}

            &lt;motion.div

                className="relative z-30 flex items-center justify-center"

                style={{ width: height, height }}

                animate={{ rotate: isDark ? 0 : 15 }}

                transition={{ stiffness: 20, damping: 14 }}

            &gt;

                {isDark ? (

                    &lt;IoMoon

                        color="#F4F4FB"

                        fill="#F4F4FB"

                        style={{ width: iconSize, height: iconSize }}

                        className="transition-colors duration-200"

                    /&gt;

                ) : (

                    &lt;IoMoonOutline

                        color="#ABABB4"

                        fill="#ABABB4"

                        stroke="#ABABB4"

                        style={{ width: iconSize, height: iconSize }}

                        className="transition-colors duration-200"

                    /&gt;

                )}

            &lt;/motion.div&gt;

        &lt;/motion.button&gt;

    );

};

```

