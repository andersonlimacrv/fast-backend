# Tabs

URL: [https://animate-ui.com/docs/components/base/tabs](https://animate-ui.com/docs/components/base/tabs)

CLI: npx shadcn@latest add @animate-ui/components-base-tabs

URL: /docs/components/base/tabs



DEMO:

import {

  Tabs,

  TabsPanel,

  TabsPanels,

  TabsList,

  TabsTab,

} from '@/components/animate-ui/components/base/tabs';

import { Button } from '@/components/ui/button';

import {

  Card,

  CardContent,

  CardDescription,

  CardFooter,

  CardHeader,

  CardTitle,

} from '@/components/ui/card';

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

export function BaseTabsDemo() {

  return (

    &lt;div className="flex w-full max-w-sm flex-col gap-6"&gt;

      &lt;Tabs defaultValue="account"&gt;

        &lt;TabsList&gt;

          &lt;TabsTab value="account"&gt;Account&lt;/TabsTab&gt;

          &lt;TabsTab value="password"&gt;Password&lt;/TabsTab&gt;

        &lt;/TabsList&gt;

        &lt;Card className="shadow-none py-0"&gt;

          &lt;TabsPanels className="py-6"&gt;

            &lt;TabsPanel value="account" className="flex flex-col gap-6"&gt;

              &lt;CardHeader&gt;

                &lt;CardTitle&gt;Account&lt;/CardTitle&gt;

                &lt;CardDescription&gt;

                  Make changes to your account here. Click save when you&amp;apos;re

                  done.

                &lt;/CardDescription&gt;

              &lt;/CardHeader&gt;

              &lt;CardContent className="grid gap-6"&gt;

                &lt;div className="grid gap-3"&gt;

                  &lt;Label htmlFor="tabs-demo-name"&gt;Name&lt;/Label&gt;

                  &lt;Input id="tabs-demo-name" defaultValue="Pedro Duarte" /&gt;

                &lt;/div&gt;

              &lt;/CardContent&gt;

              &lt;CardFooter&gt;

                &lt;Button&gt;Save changes&lt;/Button&gt;

              &lt;/CardFooter&gt;

            &lt;/TabsPanel&gt;

            &lt;TabsPanel value="password" className="flex flex-col gap-6"&gt;

              &lt;CardHeader&gt;

                &lt;CardTitle&gt;Password&lt;/CardTitle&gt;

                &lt;CardDescription&gt;

                  Change your password here. After saving, you&amp;apos;ll be logged

                  out.

                &lt;/CardDescription&gt;

              &lt;/CardHeader&gt;

              &lt;CardContent className="grid gap-6"&gt;

                &lt;div className="grid gap-3"&gt;

                  &lt;Label htmlFor="tabs-demo-current"&gt;Current password&lt;/Label&gt;

                  &lt;Input id="tabs-demo-current" type="password" /&gt;

                &lt;/div&gt;

                &lt;div className="grid gap-3"&gt;

                  &lt;Label htmlFor="tabs-demo-new"&gt;New password&lt;/Label&gt;

                  &lt;Input id="tabs-demo-new" type="password" /&gt;

                &lt;/div&gt;

              &lt;/CardContent&gt;

              &lt;CardFooter&gt;

                &lt;Button&gt;Save password&lt;/Button&gt;

              &lt;/CardFooter&gt;

            &lt;/TabsPanel&gt;

          &lt;/TabsPanels&gt;

        &lt;/Card&gt;

      &lt;/Tabs&gt;

    &lt;/div&gt;

  );

}



---

title: Tabs

description: A component for toggling between related panels on the same page.

author:

name: imskyleen

url: [https://github.com/imskyleen](https://github.com/imskyleen](https://github.com/imskyleen))

releaseDate: 2025-09-09

---

&lt;ComponentPreview name="demo-components-base-tabs" /&gt;

## Installation

&lt;ComponentInstallation name="components-base-tabs" /&gt;

## Usage

```tsx

&lt;Tabs&gt;

  &lt;TabsList&gt;

    &lt;TabsTab value="account"&gt;Account&lt;/TabsTab&gt;

    &lt;TabsTab value="password"&gt;Password&lt;/TabsTab&gt;

  &lt;/TabsList&gt;

  &lt;TabsPanels&gt;

    &lt;TabsPanel value="account"&gt;Make changes to your account here.&lt;/TabsPanel&gt;

    &lt;TabsPanel value="password"&gt;Change your password here.&lt;/TabsPanel&gt;

  &lt;/TabsPanels&gt;

&lt;/Tabs&gt;

```

## API Reference

### Tabs

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/tabs#tabs](https://animate-ui.com/docs/primitives/base/tabs#tabs)" text="Animate UI API Reference - Tabs Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/tabs#root](https://base-ui.com/react/components/tabs#root)" text="Base UI API Reference - Tabs.Root" /&gt;

&lt;/div&gt;

### TabsList

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/tabs#tabslist](https://animate-ui.com/docs/primitives/base/tabs#tabslist)" text="Animate UI API Reference - TabsList Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/tabs#list](https://base-ui.com/react/components/tabs#list)" text="Base UI API Reference - Tabs.List" /&gt;

&lt;/div&gt;

### TabsTab

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/tabs#tabstab](https://animate-ui.com/docs/primitives/base/tabs#tabstab)" text="Animate UI API Reference - TabsTab Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/tabs#tab](https://base-ui.com/react/components/tabs#tab)" text="Base UI API Reference - [Tabs.Tab](http://Tabs.Tab)" /&gt;

&lt;/div&gt;

### TabsPanels

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/tabs#tabspanels](https://animate-ui.com/docs/primitives/base/tabs#tabspanels)" text="Animate UI API Reference - TabsPanels Primitive" /&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/effects/auto-height#autoheight](https://animate-ui.com/docs/primitives/effects/auto-height#autoheight)" text="Animate UI API Reference - AutoHeight" /&gt;

&lt;/div&gt;

&lt;TypeTable

  type={{

  mode: {

```
description:

  'The mode of the TabsPanels component. The auto-height mode (default) dynamically measures the content to adjust the height, resulting in smoother and more natural animations that integrate seamlessly with surrounding elements. The layout mode relies on Motion’s layout transitions, offering better performance, but the resizing may appear less fluid depending on the content.',

type: '"auto-height" | "layout"',

required: false,

default: '"auto-height"',
```

  },

  transition: {

```
description: 'The transition of the TabsPanels component.',

type: 'Transition',

required: false,

default: '{ type: "spring", stiffness: 200, damping: 25 }',
```

  },

}}

/&gt;

### TabsPanel

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/tabs#tabspanel](https://animate-ui.com/docs/primitives/base/tabs#tabspanel)" text="Animate UI API Reference - TabsPanel Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/tabs#panel](https://base-ui.com/react/components/tabs#panel)" text="Base UI API Reference - Tabs.Panel" /&gt;

&lt;/div&gt;

&lt;TypeTable

  type={{

  transition: {

```
description: 'The transition of the TabsPanel component.',

type: 'Transition',

required: false,

default: '{ duration: 0.5, ease: "easeInOut" }',
```

  },

  '...props': {

```
description: 'The props of the TabsPanel component.',

type: 'HTMLMotionProps&lt;"div"&gt;',

required: false,
```

  },

}}

/&gt;

## Credits

- [Base UI Tabs]([https://base-ui.com/react/components/tabs](https://base-ui.com/react/components/tabs))
- Credit to [shadcn/ui]([https://ui.shadcn.com/docs/components/tabs](https://ui.shadcn.com/docs/components/tabs)) for style inspiration.

