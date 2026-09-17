/* Vendored from @animate-ui/primitives-radix-collapsible (registry, 2026-09-16).
 * Local adaptations: 'use client' removed (Vite); reduced-motion guard
 * (useReducedMotion → instant open/close), matching the other portes.
 * Re-fetch from https://animate-ui.com/r/primitives-radix-collapsible.json to update. */

import * as React from 'react';
import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';

import { getStrictContext } from '@/lib/get-strict-context';
import { useControlledState } from '@/hooks/use-controlled-state';

type CollapsibleContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const [CollapsibleProvider, useCollapsible] =
  getStrictContext<CollapsibleContextType>('CollapsibleContext');

type CollapsibleProps = React.ComponentProps<
  typeof CollapsiblePrimitive.Root
>;

function Collapsible(props: CollapsibleProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });

  return (
    <CollapsibleProvider value={{ isOpen, setIsOpen }}>
      <CollapsiblePrimitive.Root
        data-slot="collapsible"
        {...props}
        onOpenChange={setIsOpen}
      />
    </CollapsibleProvider>
  );
}

type CollapsibleTriggerProps = React.ComponentProps<
  typeof CollapsiblePrimitive.Trigger
>;

function CollapsibleTrigger(props: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  );
}

type CollapsibleContentProps = Omit<
  React.ComponentProps<typeof CollapsiblePrimitive.Content>,
  'asChild' | 'forceMount'
> &
  HTMLMotionProps<'div'> & {
    keepRendered?: boolean;
  };

function CollapsibleContent({
  keepRendered = false,
  transition = { duration: 0.35, ease: 'easeInOut' },
  ...props
}: CollapsibleContentProps) {
  const { isOpen } = useCollapsible();
  // DESIGN.md §7 + repo policy: honor reduced motion (e2e forces it, which
  // also keeps axe snapshots deterministic instead of sampling mid-fade).
  const reduceMotion = useReducedMotion();
  const effectiveTransition = reduceMotion ? { duration: 0 } : transition;
  const initial = reduceMotion ? false : { opacity: 0, height: 0, overflow: 'hidden', y: 20 };

  return (
    <AnimatePresence>
      {keepRendered ? (
        <CollapsiblePrimitive.Content asChild forceMount>
          <motion.div
            key="collapsible-content"
            data-slot="collapsible-content"
            layout
            initial={initial}
            animate={
              isOpen
                ? { opacity: 1, height: 'auto', overflow: 'hidden', y: 0 }
                : { opacity: 0, height: 0, overflow: 'hidden', y: 20 }
            }
            transition={effectiveTransition}
            {...props}
          />
        </CollapsiblePrimitive.Content>
      ) : (
        isOpen && (
          <CollapsiblePrimitive.Content asChild forceMount>
            <motion.div
              key="collapsible-content"
              data-slot="collapsible-content"
              layout
              initial={initial}
              animate={{ opacity: 1, height: 'auto', overflow: 'hidden', y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden', y: 20 }}
              transition={effectiveTransition}
              {...props}
            />
          </CollapsiblePrimitive.Content>
        )
      )}
    </AnimatePresence>
  );
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  useCollapsible,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
  type CollapsibleContentProps,
  type CollapsibleContextType,
};
