/* Vendored from @animate-ui/primitives-radix-collapsible (registry, 2026-09-16).
 * Local adaptations: 'use client' removed (Vite); reduced-motion guard
 * (useReducedMotion → instant open/close), matching the other portes.
 * Re-fetch from https://animate-ui.com/r/primitives-radix-collapsible.json to update. */

import * as React from 'react';
import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps, type TargetAndTransition } from 'motion/react';

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
> & {
  /** Open while the pointer is over the collapsible (default false).
   * Click/keyboard keep working — hover is an extra, opt-in trigger. */
  onHover?: boolean;
};

function Collapsible({
  onHover = false,
  onMouseEnter,
  onMouseLeave,
  ...props
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  });

  // Always attached; the hover effect is gated so `onHover={false}` (default)
  // behaves exactly as before and caller handlers are still composed.
  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (onHover) setIsOpen(true);
    onMouseEnter?.(event);
  };
  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    if (onHover) setIsOpen(false);
    onMouseLeave?.(event);
  };

  return (
    <CollapsibleProvider value={{ isOpen, setIsOpen }}>
      <CollapsiblePrimitive.Root
        data-slot="collapsible"
        {...props}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
    /** `slide` (sidebar default), `depth` (3D unfold) or `mask` (curtain reveal). */
    reveal?: CollapsibleReveal;
  };

/* `slide`: the panel rises 20px while opening (faithful to the vendored
 * radix collapsible registry — the sidebar keeps this one).
 * `depth`: no vertical travel — the panel swings down from behind the trigger
 * (top-hinged rotateX + slight scale), so it reads as coming from a plane
 * behind instead of sliding over the block below.
 * `mask`: LOCAL addition (not in the collapsible registry) ported from the
 * upstream base-accordion primitive: the rising panel is revealed by an
 * animated CSS mask (`--mask-stop` sweeping 0% → 100%), so unrevealed content
 * stays invisible instead of drawing translucent text over the separator. */
export type CollapsibleReveal = 'slide' | 'depth' | 'mask';

const DEPTH_TRANSFORM = { transformPerspective: 900, transformOrigin: 'top' };

function DEPTH_TARGET(rotateX: number): TargetAndTransition {
  return { opacity: 0, height: 0, overflow: 'hidden', rotateX, scale: 0.97, ...DEPTH_TRANSFORM };
}

const MASK_STOP_KEY = '--mask-stop';
const MASK_STYLE: React.CSSProperties = {
  maskImage: `linear-gradient(black var(${MASK_STOP_KEY}), transparent var(${MASK_STOP_KEY}))`,
  WebkitMaskImage: `linear-gradient(black var(${MASK_STOP_KEY}), transparent var(${MASK_STOP_KEY}))`,
  overflow: 'hidden',
};

const REVEAL_VARIANTS: Record<
  CollapsibleReveal,
  {
    initial: TargetAndTransition;
    open: TargetAndTransition;
    closed: TargetAndTransition;
    style?: React.CSSProperties;
  }
> = {
  slide: {
    initial: { opacity: 0, height: 0, overflow: 'hidden', y: 20 },
    open: { opacity: 1, height: 'auto', overflow: 'hidden', y: 0 },
    closed: { opacity: 0, height: 0, overflow: 'hidden', y: 20 },
  },
  depth: {
    initial: DEPTH_TARGET(-72),
    open: { opacity: 1, height: 'auto', overflow: 'hidden', rotateX: 0, scale: 1, ...DEPTH_TRANSFORM },
    closed: DEPTH_TARGET(-72),
  },
  mask: {
    initial: { opacity: 0, height: 0, overflow: 'hidden', y: 20, [MASK_STOP_KEY]: '0%' },
    open: { opacity: 1, height: 'auto', overflow: 'hidden', y: 0, [MASK_STOP_KEY]: '100%' },
    closed: { opacity: 0, height: 0, overflow: 'hidden', y: 20, [MASK_STOP_KEY]: '0%' },
    style: MASK_STYLE,
  },
};

function CollapsibleContent({
  keepRendered = false,
  reveal = 'slide',
  transition = { duration: 0.35, ease: 'easeInOut' },
  style,
  ...props
}: CollapsibleContentProps) {
  const { isOpen } = useCollapsible();
  // DESIGN.md §7 + repo policy: honor reduced motion (e2e forces it, which
  // also keeps axe snapshots deterministic instead of sampling mid-fade).
  const reduceMotion = useReducedMotion();
  const effectiveTransition = reduceMotion ? { duration: 0 } : transition;
  const variants = REVEAL_VARIANTS[reveal];
  const initial = reduceMotion ? false : variants.initial;
  const mergedStyle = variants.style ? { ...variants.style, ...style } : style;

  return (
    <AnimatePresence>
      {keepRendered ? (
        <CollapsiblePrimitive.Content asChild forceMount>
          <motion.div
            key="collapsible-content"
            data-slot="collapsible-content"
            layout
            style={mergedStyle}
            initial={initial}
            animate={isOpen ? variants.open : variants.closed}
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
              style={mergedStyle}
              initial={initial}
              animate={variants.open}
              exit={variants.closed}
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
