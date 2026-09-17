# Accordion

COMPONENT: [https://animate-ui.com/docs/components/base/accordion](https://animate-ui.com/docs/components/base/accordion)

URL: /docs/components/base/accordion

CLI: npx shadcn@latest add @animate-ui/components-base-accordion

DEMO:

import {

  Accordion,

  AccordionItem,

  AccordionTrigger,

  AccordionPanel,

} from '@/components/animate-ui/components/base/accordion';

const ITEMS = [

  {

    title: 'What is Animate UI?',

    content:

      'Animate UI is an open-source distribution of React components built with TypeScript, Tailwind CSS, and Motion.',

  },

  {

    title: 'How is it different from other libraries?',

    content:

      'Instead of installing via NPM, you copy and paste the components directly. This gives you full control to modify or customize them as needed.',

  },

  {

    title: 'Is Animate UI free to use?',

    content:

      'Absolutely! Animate UI is fully open-source. You can use, modify, and adapt it to fit your needs.',

  },

];

type BaseAccordionDemoProps = {

  multiple?: boolean;

  keepRendered?: boolean;

  showArrow?: boolean;

};

export const BaseAccordionDemo = ({

  multiple = false,

  keepRendered = false,

  showArrow = true,

}: BaseAccordionDemoProps) =&gt; {

  return (

    &lt;Accordion multiple={multiple} className="max-w-[400px] w-full"&gt;

      {[ITEMS.map](http://ITEMS.map)((item, index) =&gt; (

        &lt;AccordionItem key={index} value=`item-${index + 1}`}&gt;

          &lt;AccordionTrigger showArrow={showArrow}&gt;

            {item.title}

          &lt;/AccordionTrigger&gt;

          &lt;AccordionPanel keepRendered={keepRendered}&gt;

            {item.content}

          &lt;/AccordionPanel&gt;

        &lt;/AccordionItem&gt;

      ))}

    &lt;/Accordion&gt;

  );

};

---

title: Accordion

description: A set of collapsible panels with headings.

author:

name: imskyleen

url: [https://github.com/imskyleen](https://github.com/imskyleen](https://github.com/imskyleen))

---

&lt;ComponentPreview name="demo-components-base-accordion" /&gt;

## Installation

&lt;ComponentInstallation name="components-base-accordion" /&gt;

## Usage

```tsx

&lt;Accordion&gt;

  &lt;AccordionItem&gt;

    &lt;AccordionTrigger&gt;Accordion Item 1&lt;/AccordionTrigger&gt;

    &lt;AccordionPanel&gt;

      &lt;div&gt;Accordion Content 1&lt;/div&gt;

    &lt;/AccordionPanel&gt;

  &lt;/AccordionItem&gt;

  &lt;AccordionItem&gt;

    &lt;AccordionTrigger&gt;Accordion Item 2&lt;/AccordionTrigger&gt;

    &lt;AccordionPanel&gt;

      &lt;div&gt;Accordion Content 2&lt;/div&gt;

    &lt;/AccordionPanel&gt;

  &lt;/AccordionItem&gt;

&lt;/Accordion&gt;

```

## API Reference

### Accordion

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/accordion#accordion](https://animate-ui.com/docs/primitives/base/accordion#accordion)" text="Animate UI API Reference - Accordion Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/accordion#roott](https://base-ui.com/react/components/accordion#roott)" text="Base UI API Reference - Accordion.Root" /&gt;

&lt;/div&gt;

### AccordionItem

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/accordion#accordionitem](https://animate-ui.com/docs/primitives/base/accordion#accordionitem)" text="Animate UI API Reference - Accordion Item Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/accordion#item](https://base-ui.com/react/components/accordion#item)" text="Base UI API Reference - Accordion.Item" /&gt;

&lt;/div&gt;

### AccordionTrigger

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/accordion#accordiontrigger](https://animate-ui.com/docs/primitives/base/accordion#accordiontrigger)" text="Animate UI API Reference - Accordion Trigger Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/accordion#trigger](https://base-ui.com/react/components/accordion#trigger)" text="Base UI API Reference - Accordion.Trigger" /&gt;

&lt;/div&gt;

&lt;TypeTable

  type={{

  showArrow: {

```
description: 'Whether to show the arrow icon.',

type: 'boolean',

required: false,

default: 'true',
```

  },

}}

/&gt;

### AccordionPanel

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/accordion#accordionpanel](https://animate-ui.com/docs/primitives/base/accordion#accordionpanel)" text="Animate UI API Reference - Accordion Panel Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/accordion#panel](https://base-ui.com/react/components/accordion#panel)" text="Base UI API Reference - Accordion.Panel" /&gt;

&lt;/div&gt;

&lt;TypeTable

  type={{

  transition: {

```
description: 'The transition of the accordion panel',

type: 'Transition',

required: false,

default: "{ type: 'spring', stiffness: 150, damping: 22 }",
```

  },

  keepRendered: {

```
description:

  'Whether to keep the accordion panel rendered (useful for SEO)',

type: 'boolean',

required: false,

default: 'false',
```

  },

  '...props': {

```
description: 'The props of the accordion panel.',

type: 'HTMLMotionProps&lt;"div"&gt;',

required: false,
```

  },

}}

/&gt;

&lt;Callout type="info"&gt;

  The `render` and `keepMounted` props are not supported in the `AccordionPanel`

  component as it is used for animation.

&lt;/Callout&gt;

## Credits

- [Base UI Accordion]([https://base-ui.com/react/components/accordion](https://base-ui.com/react/components/accordion))
- Credit to [shadcn/ui]([https://ui.shadcn.com/docs/components/accordion](https://ui.shadcn.com/docs/components/accordion)) for style inspiration.

