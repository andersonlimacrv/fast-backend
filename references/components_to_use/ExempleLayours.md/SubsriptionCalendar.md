Install dependencies:

```bash

npm: npm install motion/react tailwindcss

yarn: yarn add motion/react tailwindcss

pnpm: pnpm add motion/react tailwindcss

bun: bun add motion/react tailwindcss

```

Copy-paste this component to /components/ui folder:

```tsx

demo.tsx

"use client";

import { useState } from 'react';

import { SubscriptionCalendar } from './original';

import { RiClaudeFill, RiNetflixFill } from 'react-icons/ri';

import { BiLogoAdobe } from "react-icons/bi";

import { FaAmazon } from 'react-icons/fa6';

const MONTHS_LIST = [

    "January", "February", "March", "April", "May", "June", 

    "July", "August", "September", "October", "November", "December"

];

const DAYS = [

    { date: 29, isMuted: true }, { date: 30, isMuted: true }, { date: 31, isMuted: true },

    { date: 1 }, { date: 2, indicators: [&lt;span key="y" className="w-1.5 h-1.5 rounded-full bg-yellow-400" /&gt;], isLogo: [&lt;RiNetflixFill color='red' size={16} /&gt;] },

    { date: 3 }, { date: 4, indicators: [&lt;span key="dot" className="w-1.5 h-1.5 rounded-full bg-purple-400" /&gt;], isLogo: [&lt;BiLogoAdobe key="adobe" className="text-[#F00A07]" size={16} /&gt;] },

    { date: 5 }, { date: 6 }, { date: 7 }, { date: 8 }, { date: 9 },

    { date: 10, indicators: [&lt;span key="ring" className="w-1.5 h-1.5 rounded-full bg-purple-400" /&gt;], isLogo: [&lt;RiClaudeFill color='#827BFF' size={16} /&gt;] },

    { date: 11 }, { date: 12 }, { date: 13 }, { date: 14 }, { date: 15 },

    { date: 16 }, { date: 17 }, { date: 18 }, { date: 19 }, { date: 20 },

    { date: 21 }, { date: 22 }, { date: 23 }, { date: 24 },

    { date: 25, indicators: [&lt;span key="y" className="w-1.5 h-1.5 rounded-full bg-yellow-400" /&gt;], isLogo: [&lt;FaAmazon key="amazon" className="text-zinc-900 dark:text-white" size={16} /&gt;] },

    { date: 26 }, { date: 27 }, { date: 28 }, { date: 29 }, { date: 30 },

    { date: 31 }, { date: 1, isMuted: true }

];

export default function SubscriptionCalendarDemo() {

    const [monthIndex, setMonthIndex] = useState(1); 

    const handleNext = () =&gt; setMonthIndex((prev) =&gt; (prev === 11 ? 0 : prev + 1));

    const handlePrev = () =&gt; setMonthIndex((prev) =&gt; (prev === 0 ? 11 : prev - 1));

    return (

        &lt;SubscriptionCalendar

            month={MONTHS_LIST[monthIndex]}

            year={2026}

            onPrevMonth={handlePrev}

            onNextMonth={handleNext}

            days={DAYS}

            monthlyTotal={156.23}

            subscriptionsCount={9}

            newCount={3}

        /&gt;

    );

}

subscription-calendar-base.tsx

'use client';

import React, { useState } from 'react';

import {

  ChevronLeft,

  ChevronRight,

  Plus,

  Search,

  Download,

  X,

  Loader2,

  Check,

} from 'lucide-react';

import { AnimatePresence, motion } from 'motion/react';

import { TbCube } from 'react-icons/tb';

/* ---------- Types ---------- */

export interface SubscriptionDay {

  date: number;

  isMuted?: boolean;

  isLogo?: React.ReactNode[];

  indicators?: React.ReactNode[];

}

export interface SubscriptionCalendarProps {

  month: string;

  year: number;

  days: SubscriptionDay[];

  monthlyTotal: number;

  subscriptionsCount: number;

  newCount: number;

  onPrevMonth?: () =&gt; void;

  onNextMonth?: () =&gt; void;

}

/* ---------- Motion ---------- */

const spring = {

  type: 'spring',

  stiffness: 420,

  damping: 28,

  mass: 0.6,

} as const;

/* ---------- Main Component ---------- */

export const SubscriptionCalendar: React.FC&lt;SubscriptionCalendarProps&gt; = ({

  month,

  year,

  days,

  monthlyTotal,

  subscriptionsCount,

  newCount,

  onPrevMonth,

  onNextMonth,

}) =&gt; {

  const [selectedId, setSelectedId] = useState&lt;string | null&gt;('day-28');

  const [isAdding, setIsAdding] = useState(false);

  const [isSearching, setIsSearching] = useState(false);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () =&gt; {

    setIsDownloading(true);

    setTimeout(() =&gt; setIsDownloading(false), 2000);

  };

  return (

    &lt;motion.div

      initial={{ scale: 0.96, opacity: 0 }}

      animate={{ scale: 1, opacity: 1 }}

      transition={spring}

      className="theme-injected bg-card border-border relative w-full max-w-105 rounded-3xl border p-4 shadow-2xl transition-all duration-500 sm:p-5"

    &gt;

      &lt;div className="mb-4 flex items-center justify-between gap-2"&gt;

        &lt;div className="flex items-center gap-2 overflow-hidden sm:gap-3"&gt;

          &lt;h2 className="text-foreground truncate text-xs font-medium sm:text-sm"&gt;

            {month}, {year}

          &lt;/h2&gt;

          &lt;span className="xs:inline-block border-input text-muted-foreground hidden cursor-default rounded-full border bg-transparent px-3 py-1 text-[10px] whitespace-nowrap"&gt;

            Today

          &lt;/span&gt;

          &lt;div className="ml-1 flex items-center gap-1 sm:gap-2"&gt;

            &lt;button

              title="backward"

              onClick={onPrevMonth}

              className="hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 rounded-md p-1 transition-colors"

            &gt;

              &lt;ChevronLeft size={18} /&gt;

            &lt;/button&gt;

            &lt;button

              title="forward"

              onClick={onNextMonth}

              className="hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 rounded-md p-1 transition-colors"

            &gt;

              &lt;ChevronRight size={18} /&gt;

            &lt;/button&gt;

          &lt;/div&gt;

        &lt;/div&gt;

        &lt;button

          title="add event"

          onClick={() =&gt; setIsAdding(true)}

          className="bg-primary text-primary-foreground flex h-7 w-10 shrink-0 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 sm:h-7 sm:w-11"

        &gt;

          &lt;Plus size={16} /&gt;

        &lt;/button&gt;

      &lt;/div&gt;

      &lt;div className=""&gt;

        &lt;AnimatePresence&gt;

          {isAdding &amp;&amp; (

            &lt;motion.div

              initial={{ opacity: 0, scale: 0.9, y: 10 }}

              animate={{ opacity: 1, scale: 1, y: 0 }}

              exit={{ opacity: 0, scale: 0.9, y: 10 }}

              className="bg-card/95 absolute inset-0 z-50 flex flex-col items-center justify-center rounded-[23px] p-4 backdrop-blur-md sm:p-6"

            &gt;

              &lt;button

                onClick={() =&gt; setIsAdding(false)}

                className="text-muted-foreground hover:text-foreground absolute top-4 right-4"

              &gt;

                &lt;X size={20} /&gt;

              &lt;/button&gt;

              &lt;div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-full"&gt;

                &lt;Plus size={24} /&gt;

              &lt;/div&gt;

              &lt;h3 className="text-foreground mb-1 text-sm font-bold"&gt;

                Quick Add Subscription

              &lt;/h3&gt;

              &lt;p className="text-muted-foreground mb-6 text-center text-[10px]"&gt;

                Enter the details of your new recurring payment.

              &lt;/p&gt;

              &lt;div className="flex w-full flex-col gap-2"&gt;

                &lt;input

                  type="text"

                  placeholder="Service Name (e.g. Netflix)"

                  className="border-input bg-transparent w-full rounded-lg border px-3 py-2 text-[11px] outline-none focus:ring-1 focus:ring-primary"

                /&gt;

                &lt;div className="flex flex-col gap-2 xs:flex-row"&gt;

                  &lt;input

                    type="text"

                    placeholder="Amount"

                    className="border-input bg-transparent flex-1 rounded-lg border px-3 py-2 text-[11px] outline-none focus:ring-1 focus:ring-primary"

                  /&gt;

                  &lt;input

                    type="text"

                    placeholder="Date"

                    className="border-input bg-transparent w-full rounded-lg border px-3 py-2 text-[11px] outline-none focus:ring-1 focus:ring-primary xs:w-20"

                  /&gt;

                &lt;/div&gt;

                &lt;button

                  onClick={() =&gt; setIsAdding(false)}

                  className="bg-primary text-primary-foreground mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[11px] font-bold transition-opacity hover:opacity-90"

                &gt;

                  &lt;Check size={14} /&gt; Add Subscription

                &lt;/button&gt;

              &lt;/div&gt;

            &lt;/motion.div&gt;

          )}

          {isSearching &amp;&amp; (

            &lt;motion.div

              initial={{ opacity: 0, scale: 0.9, y: 10 }}

              animate={{ opacity: 1, scale: 1, y: 0 }}

              exit={{ opacity: 0, scale: 0.9, y: 10 }}

              className="bg-card/95 absolute inset-0 z-50 flex flex-col items-center justify-center rounded-[23px] p-4 backdrop-blur-md sm:p-6"

            &gt;

              &lt;button

                onClick={() =&gt; setIsSearching(false)}

                className="text-muted-foreground hover:text-foreground absolute top-4 right-4"

              &gt;

                &lt;X size={20} /&gt;

              &lt;/button&gt;

              &lt;div className="bg-muted text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full"&gt;

                &lt;Search size={24} /&gt;

              &lt;/div&gt;

              &lt;h3 className="text-foreground mb-1 text-sm font-bold"&gt;

                Search Subscriptions

              &lt;/h3&gt;

              &lt;div className="mt-4 w-full"&gt;

                &lt;input

                  autoFocus

                  type="text"

                  placeholder="Type to search..."

                  className="border-input bg-transparent w-full rounded-lg border px-3 py-2 text-[11px] outline-none focus:ring-1 focus:ring-primary"

                /&gt;

              &lt;/div&gt;

              &lt;div className="mt-4 w-full text-center"&gt;

                &lt;p className="text-muted-foreground text-[10px]"&gt;Start typing to see results&lt;/p&gt;

              &lt;/div&gt;

            &lt;/motion.div&gt;

          )}

          {isSummaryOpen &amp;&amp; (

            &lt;motion.div

              initial={{ opacity: 0, scale: 0.9, y: 10 }}

              animate={{ opacity: 1, scale: 1, y: 0 }}

              exit={{ opacity: 0, scale: 0.9, y: 10 }}

              className="bg-card/95 absolute inset-0 z-50 flex flex-col items-center justify-center rounded-[23px] p-4 backdrop-blur-md sm:p-6"

            &gt;

              &lt;button

                onClick={() =&gt; setIsSummaryOpen(false)}

                className="text-muted-foreground hover:text-foreground absolute top-4 right-4"

              &gt;

                &lt;X size={20} /&gt;

              &lt;/button&gt;

              &lt;div className="bg-chart-2/10 text-chart-2 mb-4 flex h-12 w-12 items-center justify-center rounded-full"&gt;

                &lt;TbCube size={24} /&gt;

              &lt;/div&gt;

              &lt;h3 className="text-foreground mb-1 text-sm font-bold"&gt;

                Monthly Summary

              &lt;/h3&gt;

              &lt;div className="mt-4 grid w-full grid-cols-2 gap-3"&gt;

                &lt;div className="bg-muted/50 rounded-lg p-3"&gt;

                  &lt;div className="text-muted-foreground text-[9px]"&gt;Active&lt;/div&gt;

                  &lt;div className="text-foreground text-sm font-bold"&gt;{subscriptionsCount}&lt;/div&gt;

                &lt;/div&gt;

                &lt;div className="bg-muted/50 rounded-lg p-3"&gt;

                  &lt;div className="text-muted-foreground text-[9px]"&gt;New&lt;/div&gt;

                  &lt;div className="text-foreground text-sm font-bold"&gt;{newCount}&lt;/div&gt;

                &lt;/div&gt;

                &lt;div className="bg-primary/10 border-primary/20 col-span-2 rounded-lg border p-3 text-center"&gt;

                  &lt;div className="text-primary text-[9px] font-medium"&gt;Total Spend&lt;/div&gt;

                  &lt;div className="text-primary text-base font-bold"&gt;${monthlyTotal.toFixed(2)}&lt;/div&gt;

                &lt;/div&gt;

              &lt;/div&gt;

            &lt;/motion.div&gt;

          )}

        &lt;/AnimatePresence&gt;

        &lt;div className="text-muted-foreground mb-2 grid grid-cols-7 gap-1 text-[8px] font-semibold tracking-wider sm:text-[9px]"&gt;

        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) =&gt; (

          &lt;div

            key={d}

            className="bg-muted/60 border-border rounded-full border py-1.5 text-center"

          &gt;

            {d}

          &lt;/div&gt;

        ))}

      &lt;/div&gt;

      &lt;div className="grid grid-cols-7 gap-1 sm:gap-1.5"&gt;

        {[days.map](http://days.map)((day, idx) =&gt; {

          const uniqueId = `day-${[day.date](http://day.date)}-${idx}`;

          const isActive = selectedId === uniqueId;

          return (

            &lt;motion.button

              key={uniqueId}

              layout

              whileTap={{ scale: 0.95 }}

              onClick={() =&gt; setSelectedId(uniqueId)}

              transition={spring}

              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border text-[10px] font-medium transition-colors sm:h-12 sm:text-[11px] ${

                day.isMuted

                  ? 'bg-muted/40 border-border text-muted-foreground/60'

                  : 'bg-muted/60 border-border text-foreground hover:border-input'

              }`}

            &gt;

              {isActive &amp;&amp; (

                &lt;motion.div

                  layoutId="activeGlow"

                  className="border-primary/50 bg-primary/10 absolute inset-0 z-0 rounded-xl border"

                  transition={spring}

                /&gt;

              )}

              &lt;div className="relative z-10 flex flex-col items-center justify-start gap-0.5 sm:gap-1"&gt;

                &lt;span&gt;{[day.date](http://day.date)}&lt;/span&gt;

                &lt;span className="scale-75 sm:scale-100"&gt;{day.isLogo}&lt;/span&gt;

              &lt;/div&gt;

              {day.indicators &amp;&amp; (

                &lt;div className="absolute top-1 right-1 flex gap-0.5 sm:top-1.5 sm:right-1.5"&gt;

                  {day.indicators}

                &lt;/div&gt;

              )}

            &lt;/motion.button&gt;

          );

        })}

      &lt;/div&gt;

      &lt;/div&gt;

      {/* Footer Info*/}

      &lt;div className="text-muted-foreground mt-5 flex items-center justify-between gap-2 text-[8px] font-semibold tracking-widest sm:text-[9px]"&gt;

        &lt;div className="flex items-center gap-2 sm:gap-4"&gt;

          &lt;span className="hover:text-chart-2 flex cursor-default items-center gap-1.5 transition-colors"&gt;

            &lt;span className="bg-chart-2 h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5" /&gt;

            MONTHLY

          &lt;/span&gt;

          &lt;span className="hover:text-chart-4 flex cursor-default items-center gap-1.5 transition-colors"&gt;

            &lt;span className="bg-chart-4 h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5" /&gt;

            YEARLY

          &lt;/span&gt;

        &lt;/div&gt;

        &lt;span className="text-muted-foreground whitespace-nowrap"&gt;

          &lt;span className="text-foreground"&gt;{subscriptionsCount}&lt;/span&gt; SUBS /{' '}

          &lt;span className="text-foreground"&gt;{newCount}&lt;/span&gt; NEW

        &lt;/span&gt;

      &lt;/div&gt;

      {/* Bottom Bar*/}

      &lt;div className="border-border mt-4 flex items-center justify-between gap-2 border-t pt-4"&gt;

        &lt;div className="text-muted-foreground flex gap-3 sm:gap-4"&gt;

          &lt;Search

            size={16}

            onClick={() =&gt; setIsSearching(true)}

            className="hover:text-foreground shrink-0 cursor-pointer transition-colors"

          /&gt;

          &lt;button

            onClick={handleDownload}

            disabled={isDownloading}

            className="hover:text-foreground flex items-center justify-center transition-colors"

          &gt;

            {isDownloading ? (

              &lt;Loader2 size={16} className="text-primary animate-spin" /&gt;

            ) : (

              &lt;Download size={16} className="shrink-0 cursor-pointer" /&gt;

            )}

          &lt;/button&gt;

          &lt;TbCube

            size={16}

            onClick={() =&gt; setIsSummaryOpen(true)}

            className="hover:text-foreground shrink-0 cursor-pointer transition-colors"

          /&gt;

        &lt;/div&gt;

        &lt;div className="text-muted-foreground truncate text-[9px] font-medium sm:text-[10px]"&gt;

          MONTHLY TOTAL :{' '}

          &lt;span className="text-foreground ml-1 text-[11px] font-bold sm:text-[12px]"&gt;

            ${monthlyTotal.toFixed(2)}

          &lt;/span&gt;

        &lt;/div&gt;

      &lt;/div&gt;

    &lt;/motion.div&gt;

  );

};

subscription-calendar.tsx

'use client';

import React, { useState } from 'react';

import {

  ChevronLeft,

  ChevronRight,

  Plus,

  Search,

  Download,

  X,

  Loader2,

  Check,

} from 'lucide-react';

import { AnimatePresence, motion } from 'motion/react';

import { TbCube } from 'react-icons/tb';

/* ---------- Types ---------- */

export interface SubscriptionDay {

  date: number;

  isMuted?: boolean;

  isLogo?: React.ReactNode[];

  indicators?: React.ReactNode[];

}

export interface SubscriptionCalendarProps {

  month: string;

  year: number;

  days: SubscriptionDay[];

  monthlyTotal: number;

  subscriptionsCount: number;

  newCount: number;

  onPrevMonth?: () =&gt; void;

  onNextMonth?: () =&gt; void;

}

/* ---------- Motion ---------- */

const spring = {

  type: 'spring',

  stiffness: 420,

  damping: 28,

  mass: 0.6,

} as const;

/* ---------- Main Component ---------- */

export const SubscriptionCalendar: React.FC&lt;SubscriptionCalendarProps&gt; = ({

  month,

  year,

  days,

  monthlyTotal,

  subscriptionsCount,

  newCount,

  onPrevMonth,

  onNextMonth,

}) =&gt; {

  const [selectedId, setSelectedId] = useState&lt;string | null&gt;('day-28');

  const [isAdding, setIsAdding] = useState(false);

  const [isSearching, setIsSearching] = useState(false);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () =&gt; {

    setIsDownloading(true);

    setTimeout(() =&gt; setIsDownloading(false), 2000);

  };

  return (

    &lt;motion.div

      initial={{ scale: 0.96, opacity: 0 }}

      animate={{ scale: 1, opacity: 1 }}

      transition={spring}

      className="relative w-full max-w-105 rounded-[26px] border border-zinc-200 bg-white p-4 shadow-2xl transition-all duration-500 sm:p-5 dark:border-[#1f1f1f] dark:bg-[#0f0f10]"

    &gt;

      &lt;div className="mb-4 flex items-center justify-between gap-2"&gt;

        &lt;div className="flex items-center gap-2 overflow-hidden sm:gap-3"&gt;

          &lt;h2 className="truncate text-[12px] font-medium text-zinc-800 sm:text-[13px] dark:text-[#D8D8D8]"&gt;

            {month}, {year}

          &lt;/h2&gt;

          &lt;span className="xs:inline-block hidden cursor-default rounded-full border border-zinc-200 bg-transparent px-3 py-0.5 text-[10px] whitespace-nowrap text-zinc-500 dark:border-white/20 dark:text-[#a3a3a3]"&gt;

            Today

          &lt;/span&gt;

          &lt;div className="ml-1 flex items-center gap-1 sm:gap-2"&gt;

            &lt;button

              title="backward"

              onClick={onPrevMonth}

              className="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-[#7c7b7b] dark:hover:bg-white/5 dark:hover:text-white"

            &gt;

              &lt;ChevronLeft size={18} /&gt;

            &lt;/button&gt;

            &lt;button

              title="forward"

              onClick={onNextMonth}

              className="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-[#7c7b7b] dark:hover:bg-white/5 dark:hover:text-white"

            &gt;

              &lt;ChevronRight size={18} /&gt;

            &lt;/button&gt;

          &lt;/div&gt;

        &lt;/div&gt;

        &lt;button

          title="add event"

          onClick={() =&gt; setIsAdding(true)}

          className="flex h-7 w-10 shrink-0 items-center justify-center rounded-full bg-[#fa6a2e] text-white shadow-[0_0_15px_rgba(250,106,46,0.2)] transition-transform hover:scale-105 active:scale-95 sm:h-7 sm:w-11 dark:text-black"

        &gt;

          &lt;Plus size={16} /&gt;

        &lt;/button&gt;

      &lt;/div&gt;

      &lt;div className=""&gt;

        &lt;AnimatePresence&gt;

          {isAdding &amp;&amp; (

            &lt;motion.div

              initial={{ opacity: 0, scale: 0.9, y: 10 }}

              animate={{ opacity: 1, scale: 1, y: 0 }}

              exit={{ opacity: 0, scale: 0.9, y: 10 }}

              className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-[25px] bg-white/95 p-4 backdrop-blur-md sm:p-6 dark:bg-black/95"

            &gt;

              &lt;button

                onClick={() =&gt; setIsAdding(false)}

                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"

              &gt;

                &lt;X size={20} /&gt;

              &lt;/button&gt;

              &lt;div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-[#fa6a2e] dark:bg-orange-900/30"&gt;

                &lt;Plus size={24} /&gt;

              &lt;/div&gt;

              &lt;h3 className="mb-1 text-sm font-bold text-zinc-900 dark:text-white"&gt;

                Quick Add Subscription

              &lt;/h3&gt;

              &lt;p className="mb-6 text-center text-[10px] text-zinc-500 dark:text-zinc-400"&gt;

                Enter the details of your new recurring payment.

              &lt;/p&gt;

              &lt;div className="flex w-full flex-col gap-2"&gt;

                &lt;input

                  type="text"

                  placeholder="Service Name (e.g. Netflix)"

                  className="w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-[11px] outline-none focus:border-[#fa6a2e] dark:border-zinc-800 dark:focus:border-[#fa6a2e]"

                /&gt;

                &lt;div className="xs:flex-row flex flex-col gap-2"&gt;

                  &lt;input

                    type="text"

                    placeholder="Amount"

                    className="flex-1 rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-[11px] outline-none focus:border-[#fa6a2e] dark:border-zinc-800 dark:focus:border-[#fa6a2e]"

                  /&gt;

                  &lt;input

                    type="text"

                    placeholder="Date"

                    className="xs:w-20 w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-[11px] outline-none focus:border-[#fa6a2e] dark:border-zinc-800 dark:focus:border-[#fa6a2e]"

                  /&gt;

                &lt;/div&gt;

                &lt;button

                  onClick={() =&gt; setIsAdding(false)}

                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#fa6a2e] py-2 text-[11px] font-bold text-white transition-opacity hover:opacity-90"

                &gt;

                  &lt;Check size={14} /&gt; Add Subscription

                &lt;/button&gt;

              &lt;/div&gt;

            &lt;/motion.div&gt;

          )}

        &lt;/AnimatePresence&gt;

        &lt;AnimatePresence&gt;

          {isSearching &amp;&amp; (

            &lt;motion.div

              initial={{ opacity: 0, scale: 0.9, y: 10 }}

              animate={{ opacity: 1, scale: 1, y: 0 }}

              exit={{ opacity: 0, scale: 0.9, y: 10 }}

              className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-[25px] bg-white/95 p-4 backdrop-blur-md sm:p-6 dark:bg-black/95"

            &gt;

              &lt;button

                onClick={() =&gt; setIsSearching(false)}

                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"

              &gt;

                &lt;X size={20} /&gt;

              &lt;/button&gt;

              &lt;div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800/30"&gt;

                &lt;Search size={24} /&gt;

              &lt;/div&gt;

              &lt;h3 className="mb-1 text-sm font-bold text-zinc-900 dark:text-white"&gt;

                Search Subscriptions

              &lt;/h3&gt;

              &lt;div className="mt-4 w-full"&gt;

                &lt;input

                  autoFocus

                  type="text"

                  placeholder="Type to search..."

                  className="w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-[11px] outline-none focus:border-[#fa6a2e] dark:border-zinc-800 dark:focus:border-[#fa6a2e]"

                /&gt;

              &lt;/div&gt;

              &lt;div className="mt-4 flex max-h-32 w-full flex-col gap-2 overflow-y-auto"&gt;

                &lt;p className="text-center text-[10px] text-zinc-400"&gt;

                  Start typing to see results

                &lt;/p&gt;

              &lt;/div&gt;

            &lt;/motion.div&gt;

          )}

          {isSummaryOpen &amp;&amp; (

            &lt;motion.div

              initial={{ opacity: 0, scale: 0.9, y: 10 }}

              animate={{ opacity: 1, scale: 1, y: 0 }}

              exit={{ opacity: 0, scale: 0.9, y: 10 }}

              className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-[25px] bg-white/95 p-4 backdrop-blur-md sm:p-6 dark:bg-black/95"

            &gt;

              &lt;button

                onClick={() =&gt; setIsSummaryOpen(false)}

                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"

              &gt;

                &lt;X size={20} /&gt;

              &lt;/button&gt;

              &lt;div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-500 dark:bg-purple-900/30"&gt;

                &lt;TbCube size={24} /&gt;

              &lt;/div&gt;

              &lt;h3 className="mb-1 text-sm font-bold text-zinc-900 dark:text-white"&gt;

                Monthly Summary

              &lt;/h3&gt;

              &lt;div className="mt-4 grid w-full grid-cols-2 gap-3"&gt;

                &lt;div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/50"&gt;

                  &lt;div className="text-[9px] text-zinc-500"&gt;Active&lt;/div&gt;

                  &lt;div className="text-sm font-bold text-zinc-900 dark:text-white"&gt;

                    {subscriptionsCount}

                  &lt;/div&gt;

                &lt;/div&gt;

                &lt;div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/50"&gt;

                  &lt;div className="text-[9px] text-zinc-500"&gt;New&lt;/div&gt;

                  &lt;div className="text-sm font-bold text-zinc-900 dark:text-white"&gt;

                    {newCount}

                  &lt;/div&gt;

                &lt;/div&gt;

                &lt;div className="col-span-2 rounded-lg bg-orange-50 p-3 dark:bg-orange-950/20"&gt;

                  &lt;div className="text-[9px] text-orange-600"&gt;Total Spend&lt;/div&gt;

                  &lt;div className="text-sm font-bold text-orange-600"&gt;

                    ${monthlyTotal.toFixed(2)}

                  &lt;/div&gt;

                &lt;/div&gt;

              &lt;/div&gt;

            &lt;/motion.div&gt;

          )}

        &lt;/AnimatePresence&gt;

        &lt;div&gt;

          &lt;div className="mb-2 grid grid-cols-7 gap-1 text-[8px] font-semibold tracking-wider text-zinc-500 sm:text-[9px] dark:text-[#d4d4d4]"&gt;

            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) =&gt; (

              &lt;div

                key={d}

                className="rounded-full border-zinc-100 bg-zinc-50 py-1.5 text-center dark:border-[#222] dark:bg-[#2A2A2A]/50"

              &gt;

                {d}

              &lt;/div&gt;

            ))}

          &lt;/div&gt;

          &lt;div className="grid grid-cols-7 gap-1 sm:gap-1.5"&gt;

            {[days.map](http://days.map)((day, idx) =&gt; {

              const uniqueId = `day-${[day.date](http://day.date)}-${idx}`;

              const isActive = selectedId === uniqueId;

              return (

                &lt;motion.button

                  key={uniqueId}

                  layout

                  whileTap={{ scale: 0.95 }}

                  onClick={() =&gt; setSelectedId(uniqueId)}

                  transition={spring}

                  className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border text-[10px] font-medium transition-colors sm:h-12 sm:text-[11px] ${

                    day.isMuted

                      ? 'border-zinc-100 bg-zinc-50 text-zinc-300 dark:border-[#161616] dark:bg-[#0e0e0f] dark:text-[#333]'

                      : 'border-zinc-100 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300 dark:border-[#222] dark:bg-[#2A2A2A]/50 dark:text-[#d4d4d4] dark:hover:border-[#333]'

                  }`}

                &gt;

                  {isActive &amp;&amp; (

                    &lt;motion.div

                      layoutId="activeGlow"

                      className="absolute inset-0 z-0 rounded-xl border-[1.5px] border-[#b3522f] bg-orange-50 dark:bg-[#32211A]"

                      transition={spring}

                    /&gt;

                  )}

                  &lt;div className="relative z-10 flex flex-col items-center justify-start gap-0.5 sm:gap-1"&gt;

                    &lt;span&gt;{[day.date](http://day.date)}&lt;/span&gt;

                    &lt;span className="scale-75 sm:scale-100"&gt;{day.isLogo}&lt;/span&gt;

                  &lt;/div&gt;

                  {day.indicators &amp;&amp; (

                    &lt;div className="absolute top-1 right-1 flex gap-0.5 sm:top-1.5 sm:right-1.5"&gt;

                      {day.indicators}

                    &lt;/div&gt;

                  )}

                &lt;/motion.button&gt;

              );

            })}

          &lt;/div&gt;

        &lt;/div&gt;

      &lt;/div&gt;

      {/* Footer Info*/}

      &lt;div className="mt-5 flex items-center justify-between gap-2 text-[8px] font-semibold tracking-widest text-zinc-400 sm:text-[9px] dark:text-[#555]"&gt;

        &lt;div className="flex items-center gap-2 sm:gap-4"&gt;

          &lt;span className="flex cursor-default items-center gap-1.5 transition-colors hover:text-[#a855f7]"&gt;

            &lt;span className="h-1 w-1 rounded-full bg-[#a855f7] sm:h-1.5 sm:w-1.5" /&gt;

            MONTHLY

          &lt;/span&gt;

          &lt;span className="flex cursor-default items-center gap-1.5 transition-colors hover:text-[#facc15]"&gt;

            &lt;span className="h-1 w-1 rounded-full bg-[#facc15] sm:h-1.5 sm:w-1.5" /&gt;

            YEARLY

          &lt;/span&gt;

        &lt;/div&gt;

        &lt;span className="whitespace-nowrap text-zinc-500 dark:text-[#666]"&gt;

          &lt;span className="text-zinc-900 dark:text-[#ccc7c7]"&gt;

            {subscriptionsCount}

          &lt;/span&gt;{' '}

          SUBS /{' '}

          &lt;span className="text-zinc-900 dark:text-[#ccc7c7]"&gt;{newCount}&lt;/span&gt;{' '}

          NEW

        &lt;/span&gt;

      &lt;/div&gt;

      {/* Bottom Bar*/}

      &lt;div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-100 pt-4 dark:border-[#1a1a1b]"&gt;

        &lt;div className="flex gap-3 text-zinc-400 sm:gap-4 dark:text-[#555]"&gt;

          &lt;Search

            size={16}

            onClick={() =&gt; setIsSearching(true)}

            className="shrink-0 cursor-pointer transition-colors hover:text-zinc-900 dark:hover:text-white"

          /&gt;

          &lt;button

            onClick={handleDownload}

            disabled={isDownloading}

            className="relative flex items-center justify-center transition-colors hover:text-zinc-900 dark:hover:text-white"

          &gt;

            {isDownloading ? (

              &lt;Loader2 size={16} className="animate-spin text-[#fa6a2e]" /&gt;

            ) : (

              &lt;Download size={16} className="shrink-0 cursor-pointer" /&gt;

            )}

          &lt;/button&gt;

          &lt;TbCube

            size={16}

            onClick={() =&gt; setIsSummaryOpen(true)}

            className="shrink-0 cursor-pointer transition-colors hover:text-zinc-900 dark:hover:text-white"

          /&gt;

        &lt;/div&gt;

        &lt;div className="truncate text-[9px] font-medium text-zinc-500 sm:text-[10px] dark:text-[#666]"&gt;

          MONTHLY TOTAL :{' '}

          &lt;span className="ml-1 text-[11px] font-bold text-zinc-900 sm:text-[12px] dark:text-white"&gt;

            ${monthlyTotal.toFixed(2)}

          &lt;/span&gt;

        &lt;/div&gt;

      &lt;/div&gt;

    &lt;/motion.div&gt;

  );

};

```