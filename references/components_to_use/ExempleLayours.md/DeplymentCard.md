Install dependencies:

```bash

npm: npm install motion/react react-icons lucide-react

yarn: yarn add motion/react react-icons lucide-react

pnpm: pnpm add motion/react react-icons lucide-react

bun: bun add motion/react react-icons lucide-react

```

Copy-paste this component to /components/ui folder:

```tsx

demo.tsx

import { RunActionButton } from './original';

import { FaInbox } from 'react-icons/fa6';

import { RiBubbleChartFill } from 'react-icons/ri';

import { BsFileTextFill, BsSendFill, BsTagFill } from 'react-icons/bs';

import { TbClockHour12Filled } from 'react-icons/tb';

const items = [

  { id: 1, label: 'Importing Survey Data', icon: FaInbox },

  { id: 2, label: 'Refining Responses', icon: RiBubbleChartFill },

  { id: 3, label: 'Labelling Responses', icon: BsTagFill },

  { id: 4, label: 'Analyzing Sentiment', icon: TbClockHour12Filled },

  { id: 5, label: 'Creating Reports', icon: BsFileTextFill },

  { id: 6, label: 'Sharing Survey Report', icon: BsSendFill },

];

export default function RunActionButtonDemo() {

  return &lt;RunActionButton steps={items} /&gt;;

}

run-action-button-base.tsx

import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence, type Transition } from 'motion/react';

import { Zap } from 'lucide-react';

import { HiBadgeCheck } from 'react-icons/hi';

import { IoCloseSharp } from 'react-icons/io5';

import { FaInbox } from 'react-icons/fa6';

import { RiBubbleChartFill } from 'react-icons/ri';

import { BsFileTextFill, BsSendFill, BsTagFill } from 'react-icons/bs';

import { TbClockHour12Filled } from 'react-icons/tb';

function AnimatedText({

  text,

  className,

  delayStep = 0.014,

}: {

  text: string;

  className?: string;

  delayStep?: number;

}) {

  const chars = text.split('');

  return (

    &lt;span className={className} style={{ display: 'inline-flex' }}&gt;

      &lt;AnimatePresence mode="popLayout" initial={false}&gt;

        &lt;motion.span

          key={text}

          style={{ display: 'inline-flex', willChange: 'transform' }}

        &gt;

          {[chars.map](http://chars.map)((char, i) =&gt; (

            &lt;motion.span

              key={i}

              initial={{

                y: 10,

                opacity: 0,

                scale: 0.5,

                filter: 'blur(2px)',

              }}

              animate={{

                y: 0,

                opacity: 1,

                scale: 1,

                filter: 'blur(0px)',

              }}

              exit={{

                y: -10,

                opacity: 0,

                scale: 0.5,

                filter: 'blur(2px)',

              }}

              transition={{

                type: 'spring',

                stiffness: 240,

                damping: 16,

                mass: 1.2,

                delay: i * delayStep,

              }}

              style={{

                display: 'inline-block',

                whiteSpace: char === ' ' ? 'pre' : undefined,

              }}

            &gt;

              {char}

            &lt;/motion.span&gt;

          ))}

        &lt;/motion.span&gt;

      &lt;/AnimatePresence&gt;

    &lt;/span&gt;

  );

}

const spring: Transition = {

  type: 'spring',

  stiffness: 260,

  damping: 22,

  mass: 0.8,

};

const DEFAULT_STEPS = [

  { id: 1, label: 'Importing Survey Data', icon: FaInbox },

  { id: 2, label: 'Refining Responses', icon: RiBubbleChartFill },

  { id: 3, label: 'Labelling Responses', icon: BsTagFill },

  { id: 4, label: 'Analyzing Sentiment', icon: TbClockHour12Filled },

  { id: 5, label: 'Creating Reports', icon: BsFileTextFill },

  { id: 6, label: 'Sharing Survey Report', icon: BsSendFill },

];

type StepItem = {

  id: number;

  label: string;

  icon: React.ComponentType&lt;any&gt;;

};

type RunActionButtonProps = {

  steps?: StepItem[];

};

export function RunActionButton({

  steps = DEFAULT_STEPS,

}: RunActionButtonProps) {

  const [status, setStatus] = useState&lt;'idle' | 'running' | 'done'&gt;('idle');

  const [currentStep, setCurrentStep] = useState(0);

  const startAction = () =&gt; {

    setStatus('running');

    setCurrentStep(0);

  };

  const reset = () =&gt; {

    setStatus('idle');

    setCurrentStep(0);

  };

  useEffect(() =&gt; {

    if (status !== 'running') return;

    const interval = setInterval(() =&gt; {

      setCurrentStep((prev) =&gt; {

        if (prev &lt; steps.length - 1) return prev + 1;

        setStatus('done');

        return prev;

      });

    }, 1200);

    return () =&gt; clearInterval(interval);

  }, [status, steps.length]);

  const widths = {

    idle: 180,

    running: 360,

    done: 200,

  };

  return (

    &lt;div className="theme-injected flex items-center justify-center"&gt;

      &lt;motion.div

        initial={{ width: 180 }}

        animate={{ width: widths[status] }}

        transition={spring}

        className={`relative flex h-[64px] items-center justify-between overflow-hidden rounded-lg ${

          status === 'running'

            ? 'border-border border-2 border-dashed'

            : 'border-2 border-transparent'

        } `}

      &gt;

        &lt;AnimatePresence mode="popLayout" initial={false}&gt;

          {status === 'idle' &amp;&amp; (

            &lt;motion.button

              key="idle"

              onClick={startAction}

              initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}

              exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

              transition={spring}

              className="bg-muted flex flex-1 items-center gap-2 rounded-lg px-5 py-3 whitespace-nowrap"

            &gt;

              &lt;Zap className="text-foreground h-6 w-6" /&gt;

              &lt;AnimatedText

                text="Run Action"

                className="text-foreground text-[18px] font-medium"

              /&gt;

            &lt;/motion.button&gt;

          )}

          {status === 'running' &amp;&amp; (

            &lt;motion.div

              key="running"

              initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}

              exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

              transition={spring}

              className="flex flex-1 items-center justify-between gap-3 px-4 whitespace-nowrap"

            &gt;

              &lt;div className="flex items-center gap-2"&gt;

                &lt;AnimatePresence mode="popLayout"&gt;

                  &lt;motion.div

                    key={currentStep}

                    initial={{ opacity: 0, scale: 0, filter: 'blur(4px)' }}

                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}

                    exit={{ opacity: 0, scale: 0, filter: 'blur(4px)' }}

                    transition={spring}

                  &gt;

                    {React.createElement(steps[currentStep].icon, {

                      className: 'w-6 h-6 text-foreground',

                    })}

                  &lt;/motion.div&gt;

                &lt;/AnimatePresence&gt;

                &lt;AnimatedText

                  text={steps[currentStep].label}

                  className="text-foreground text-[18px] font-bold"

                /&gt;

              &lt;/div&gt;

              &lt;motion.button

                onClick={reset}

                initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}

                exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

                transition={{ ...spring, delay: 0.15 }}

                className="bg-secondary ml-1 rounded-lg p-1.5"

              &gt;

                &lt;IoCloseSharp className="text-secondary-foreground h-4 w-4" /&gt;

              &lt;/motion.button&gt;

            &lt;/motion.div&gt;

          )}

          {status === 'done' &amp;&amp; (

            &lt;motion.button

              key="done"

              onClick={reset}

              initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}

              exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

              transition={spring}

              className="bg-accent flex flex-1 items-center gap-2 rounded-lg px-5 py-3 whitespace-nowrap"

            &gt;

              &lt;HiBadgeCheck className="text-accent-foreground h-6 w-6" /&gt;

              &lt;AnimatedText

                text="Action Done"

                className="text-accent-foreground text-[18px] font-bold"

              /&gt;

            &lt;/motion.button&gt;

          )}

        &lt;/AnimatePresence&gt;

      &lt;/motion.div&gt;

    &lt;/div&gt;

  );

}

run-action-button.tsx

import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence, type Transition } from 'motion/react';

import { Zap } from 'lucide-react';

import { HiBadgeCheck } from 'react-icons/hi';

import { IoCloseSharp } from 'react-icons/io5';

import { FaInbox } from 'react-icons/fa6';

import { RiBubbleChartFill } from 'react-icons/ri';

import { BsFileTextFill, BsSendFill, BsTagFill } from 'react-icons/bs';

import { TbClockHour12Filled } from 'react-icons/tb';

function AnimatedText({

  text,

  className,

  delayStep = 0.014,

}: {

  text: string;

  className?: string;

  delayStep?: number;

}) {

  const chars = text.split('');

  return (

    &lt;span className={className} style={{ display: 'inline-flex' }}&gt;

      &lt;AnimatePresence mode="popLayout" initial={false}&gt;

        &lt;motion.span

          key={text}

          style={{ display: 'inline-flex', willChange: 'transform' }}

        &gt;

          {[chars.map](http://chars.map)((char, i) =&gt; (

            &lt;motion.span

              key={i}

              initial={{

                y: 10,

                opacity: 0,

                scale: 0.5,

                filter: 'blur(2px)',

              }}

              animate={{

                y: 0,

                opacity: 1,

                scale: 1,

                filter: 'blur(0px)',

              }}

              exit={{

                y: -10,

                opacity: 0,

                scale: 0.5,

                filter: 'blur(2px)',

              }}

              transition={{

                type: 'spring',

                stiffness: 240,

                damping: 16,

                mass: 1.2,

                delay: i * delayStep,

              }}

              style={{

                display: 'inline-block',

                whiteSpace: char === ' ' ? 'pre' : undefined,

              }}

            &gt;

              {char}

            &lt;/motion.span&gt;

          ))}

        &lt;/motion.span&gt;

      &lt;/AnimatePresence&gt;

    &lt;/span&gt;

  );

}

const spring: Transition = {

  type: 'spring',

  stiffness: 260,

  damping: 22,

  mass: 0.8,

};

const DEFAULT_STEPS = [

  { id: 1, label: 'Importing Survey Data', icon: FaInbox },

  { id: 2, label: 'Refining Responses', icon: RiBubbleChartFill },

  { id: 3, label: 'Labelling Responses', icon: BsTagFill },

  { id: 4, label: 'Analyzing Sentiment', icon: TbClockHour12Filled },

  { id: 5, label: 'Creating Reports', icon: BsFileTextFill },

  { id: 6, label: 'Sharing Survey Report', icon: BsSendFill },

];

type StepItem = {

  id: number;

  label: string;

  icon: React.ComponentType&lt;any&gt;;

};

type RunActionButtonProps = {

  steps?: StepItem[];

};

export function RunActionButton({

  steps = DEFAULT_STEPS,

}: RunActionButtonProps) {

  const [status, setStatus] = useState&lt;'idle' | 'running' | 'done'&gt;('idle');

  const [currentStep, setCurrentStep] = useState(0);

  const startAction = () =&gt; {

    setStatus('running');

    setCurrentStep(0);

  };

  const reset = () =&gt; {

    setStatus('idle');

    setCurrentStep(0);

  };

  useEffect(() =&gt; {

    if (status !== 'running') return;

    const interval = setInterval(() =&gt; {

      setCurrentStep((prev) =&gt; {

        if (prev &lt; steps.length - 1) return prev + 1;

        setStatus('done');

        return prev;

      });

    }, 1200);

    return () =&gt; clearInterval(interval);

  }, [status, steps.length]);

  const widths = {

    idle: 180,

    running: 360,

    done: 200,

  };

  return (

    &lt;div className="flex items-center justify-center"&gt;

      &lt;motion.div

        initial={{ width: 180 }}

        animate={{ width: widths[status] }}

        transition={spring}

        className={`relative flex h-[64px] items-center justify-between overflow-hidden rounded-full ${status === 'running'

            ? 'border-2 border-dashed border-[#D6D6DD] dark:border-white/20'

            : 'border-2 border-transparent'

          } `}

      &gt;

        &lt;AnimatePresence mode="popLayout" initial={false}&gt;

          {status === 'idle' &amp;&amp; (

            &lt;motion.button

              key="idle"

              onClick={startAction}

              initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}

              exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

              transition={spring}

              className="flex flex-1 items-center gap-2 rounded-full bg-[#F4F4F9] px-5 py-3 whitespace-nowrap dark:bg-zinc-800"

            &gt;

              &lt;Zap className="h-6 w-6 text-[#26262B] dark:text-zinc-100" /&gt;

              &lt;AnimatedText

                text="Run Action"

                className="text-[18px] font-medium text-[#26262B] dark:text-zinc-100"

              /&gt;

            &lt;/motion.button&gt;

          )}

          {status === 'running' &amp;&amp; (

            &lt;motion.div

              key="running"

              initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}

              exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

              transition={spring}

              className="flex flex-1 items-center justify-between gap-3 px-4 whitespace-nowrap"

            &gt;

              &lt;div className="flex items-center gap-2"&gt;

                &lt;AnimatePresence mode="popLayout"&gt;

                  &lt;motion.div

                    key={currentStep}

                    initial={{ opacity: 0, scale: 0, filter: 'blur(4px)' }}

                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}

                    exit={{ opacity: 0, scale: 0, filter: 'blur(4px)' }}

                    transition={spring}

                  &gt;

                    {React.createElement(steps[currentStep].icon, {

                      className: 'w-6 h-6 text-[#28272A]  dark:text-zinc-100',

                    })}

                  &lt;/motion.div&gt;

                &lt;/AnimatePresence&gt;

                &lt;AnimatedText

                  text={steps[currentStep].label}

                  className="text-[18px] font-bold text-[#28272A]  dark:text-zinc-100"

                /&gt;

              &lt;/div&gt;

              &lt;motion.button

                onClick={reset}

                initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}

                exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

                transition={{ ...spring, delay: 0.15 }}

                className="ml-1 rounded-full bg-[#D6D5E2] dark:bg-white p-1.5"

              &gt;

                &lt;IoCloseSharp className="h-4 w-4 text-white dark:text-black" /&gt;

              &lt;/motion.button&gt;

            &lt;/motion.div&gt;

          )}

          {status === 'done' &amp;&amp; (

            &lt;motion.button

              key="done"

              onClick={reset}

              initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}

              exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}

              transition={spring}

              className="flex flex-1 items-center gap-2 rounded-full bg-[#EAF9EA] dark:bg-green-200 px-5 py-3 whitespace-nowrap"

            &gt;

              &lt;HiBadgeCheck className="h-6 w-6 text-[#22c55e]" /&gt;

              &lt;AnimatedText

                text="Action Done"

                className="text-[18px] font-bold text-[#22c55e]"

              /&gt;

            &lt;/motion.button&gt;

          )}

        &lt;/AnimatePresence&gt;

      &lt;/motion.div&gt;

    &lt;/div&gt;

  );

}

```