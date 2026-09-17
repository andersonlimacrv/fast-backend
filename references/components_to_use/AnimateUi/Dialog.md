# Dialog

URL: [https://animate-ui.com/docs/components/base/dialog](https://animate-ui.com/docs/components/base/dialog)

URL: /docs/components/base/dialog

CLI: npx shadcn@latest add @animate-ui/components-base-dialog  
  
DEMO:  
  
import * as React from 'react';

import { Button } from '@/components/ui/button';

import {

  Dialog,

  DialogTrigger,

  DialogPopup,

  DialogHeader,

  DialogTitle,

  DialogDescription,

  DialogClose,

  DialogFooter,

  type DialogPopupProps,

} from '@/components/animate-ui/components/base/dialog';

import { Label } from '@/components/ui/label';

import { Input } from '@/components/ui/input';

interface BaseDialogDemoProps {

  from: DialogPopupProps['from'];

  showCloseButton: boolean;

}

export const BaseDialogDemo = ({

  from,

  showCloseButton,

}: BaseDialogDemoProps) =&gt; {

  return (

    &lt;Dialog&gt;

      &lt;form&gt;

        &lt;DialogTrigger

          render={&lt;Button variant="outline"&gt;Open Dialog&lt;/Button&gt;}

        /&gt;

        &lt;DialogPopup

          from={from}

          showCloseButton={showCloseButton}

          className="sm:max-w-[425px]"

        &gt;

          &lt;DialogHeader&gt;

            &lt;DialogTitle&gt;Edit profile&lt;/DialogTitle&gt;

            &lt;DialogDescription&gt;

              Make changes to your profile here. Click save when you&amp;apos;re

              done.

            &lt;/DialogDescription&gt;

          &lt;/DialogHeader&gt;

          &lt;div className="grid gap-4"&gt;

            &lt;div className="grid gap-3"&gt;

              &lt;Label htmlFor="name-1"&gt;Name&lt;/Label&gt;

              &lt;Input id="name-1" name="name" defaultValue="Pedro Duarte" /&gt;

            &lt;/div&gt;

            &lt;div className="grid gap-3"&gt;

              &lt;Label htmlFor="username-1"&gt;Username&lt;/Label&gt;

              &lt;Input id="username-1" name="username" defaultValue="@peduarte" /&gt;

            &lt;/div&gt;

          &lt;/div&gt;

          &lt;DialogFooter&gt;

            &lt;DialogClose render={&lt;Button variant="outline"&gt;Cancel&lt;/Button&gt;} /&gt;

            &lt;Button type="submit"&gt;Save changes&lt;/Button&gt;

          &lt;/DialogFooter&gt;

        &lt;/DialogPopup&gt;

      &lt;/form&gt;

    &lt;/Dialog&gt;

  );

};

---

title: Dialog

description: A popup that opens on top of the entire page.

author:

name: imskyleen

url: [https://github.com/imskyleen](https://github.com/imskyleen](https://github.com/imskyleen))

releaseDate: 2025-09-16

---

&lt;ComponentPreview name="demo-components-base-dialog" /&gt;

## Installation

&lt;ComponentInstallation name="components-base-dialog" /&gt;

## Usage

```tsx

&lt;Dialog&gt;

  &lt;DialogTrigger&gt;Open Dialog&lt;/DialogTrigger&gt;

  &lt;DialogPopup&gt;

    &lt;DialogHeader&gt;

      &lt;DialogTitle&gt;Dialog Title&lt;/DialogTitle&gt;

      &lt;DialogDescription&gt;Dialog Description&lt;/DialogDescription&gt;

    &lt;/DialogHeader&gt;

    &lt;p&gt;Dialog Content&lt;/p&gt;

    &lt;DialogFooter&gt;

      &lt;button&gt;Accept&lt;/button&gt;

    &lt;/DialogFooter&gt;

  &lt;/DialogPopup&gt;

&lt;/Dialog&gt;

```

## API Reference

### Dialog

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/dialog#dialog](https://animate-ui.com/docs/primitives/base/dialog#dialog)" text="Animate UI API Reference - Dialog Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/dialog#root](https://base-ui.com/react/components/dialog#root)" text="Base UI API Reference - Dialog.Root" /&gt;

&lt;/div&gt;

### DialogTrigger

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/dialog#dialogtrigger](https://animate-ui.com/docs/primitives/base/dialog#dialogtrigger)" text="Animate UI API Reference - Dialog Trigger Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/dialog#trigger](https://base-ui.com/react/components/dialog#trigger)" text="Base UI API Reference - Dialog.Trigger" /&gt;

&lt;/div&gt;

### DialogPopup

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/dialog#dialogcontent](https://animate-ui.com/docs/primitives/base/dialog#dialogcontent)" text="Animate UI API Reference - Dialog Content Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/dialog#popup](https://base-ui.com/react/components/dialog#popup)" text="Base UI API Reference - Dialog.Popup" /&gt;

&lt;/div&gt;

&lt;TypeTable

  type={{

  showCloseButton: {

```
description: 'Whether to show the close button.',

type: 'boolean',

required: false,

default: 'true',
```

  },

  from: {

```
description: 'The direction the dialog should flip from',

type: "'top' | 'bottom' | 'left' | 'right'",

required: false,

default: 'top',
```

  },

  transition: {

```
description: 'The transition of the dialog popup',

type: 'Transition',

required: false,

default: "{ type: 'spring', stiffness: 150, damping: 25 }",
```

  },

  '...props': {

```
description: 'The props of the dialog popup.',

type: 'HTMLMotionProps&lt;"div"&gt;',

required: false,
```

  },

}}

/&gt;

&lt;Callout type="info"&gt;

  The `render` property is not supported in the `DialogPopup` component, as it

  is used for animation.

&lt;/Callout&gt;

### DialogClose

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/dialog#dialogclose](https://animate-ui.com/docs/primitives/base/dialog#dialogclose)" text="Animate UI API Reference - Dialog Close Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/dialog#close](https://base-ui.com/react/components/dialog#close)" text="Base UI API Reference - Dialog.Close" /&gt;

&lt;/div&gt;

### DialogHeader

&lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/dialog#dialogheader](https://animate-ui.com/docs/primitives/base/dialog#dialogheader)" text="Animate UI API Reference - Dialog Header Primitive" /&gt;

&lt;TypeTable

  type={{

  '...props': {

```
description: 'The props of the dialog header.',

type: "React.ComponentProps&lt;'div'&gt;",

required: false,
```

  },

}}

/&gt;

### DialogTitle

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/dialog#dialogtitle](https://animate-ui.com/docs/primitives/base/dialog#dialogtitle)" text="Animate UI API Reference - Dialog Title Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/dialog#title](https://base-ui.com/react/components/dialog#title)" text="Base UI API Reference - Dialog.Title" /&gt;

&lt;/div&gt;

### DialogDescription

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/dialog#dialogdescription](https://animate-ui.com/docs/primitives/base/dialog#dialogdescription)" text="Animate UI API Reference - Dialog Description Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/dialog#description](https://base-ui.com/react/components/dialog#description)" text="Base UI API Reference - Dialog.Description" /&gt;

&lt;/div&gt;

### DialogFooter

&lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/dialog#dialogfooter](https://animate-ui.com/docs/primitives/base/dialog#dialogfooter)" text="Animate UI API Reference - Dialog Footer Primitive" /&gt;

&lt;TypeTable

  type={{

  '...props': {

```
description: 'The props of the dialog footer.',

type: "React.ComponentProps&lt;'div'&gt;",

required: false,
```

  },

}}

/&gt;

## Credits

- [Base UI Dialog]([https://base-ui.com/react/components/dialog](https://base-ui.com/react/components/dialog))
- Credit to [shadcn/ui]([https://ui.shadcn.com/docs/components/dialog](https://ui.shadcn.com/docs/components/dialog)) for style inspiration.

