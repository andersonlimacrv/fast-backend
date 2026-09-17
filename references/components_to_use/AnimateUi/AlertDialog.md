# Alert Dialog

URL: [https://animate-ui.com/docs/components/base/alert-dialog](https://animate-ui.com/docs/components/base/alert-dialog)

URL: /docs/components/base/alert-dialog

CLI: npx shadcn@latest add @animate-ui/components-base-alert-dialog

DEMO:

import * as React from 'react';

import {

  AlertDialog,

  AlertDialogTrigger,

  AlertDialogPopup,

  AlertDialogHeader,

  AlertDialogTitle,

  AlertDialogDescription,

  AlertDialogFooter,

  AlertDialogCancel,

  AlertDialogAction,

  type AlertDialogPopupProps,

} from '@/components/animate-ui/components/base/alert-dialog';

import { Button } from '@/components/ui/button';

interface BaseAlertDialogDemoProps {

  from: AlertDialogPopupProps['from'];

}

export const BaseAlertDialogDemo = ({ from }: BaseAlertDialogDemoProps) =&gt; {

  return (

    &lt;AlertDialog&gt;

      &lt;AlertDialogTrigger

        render={&lt;Button variant="outline"&gt;Open Dialog&lt;/Button&gt;}

      /&gt;

      &lt;AlertDialogPopup from={from} className="sm:max-w-[425px]"&gt;

        &lt;AlertDialogHeader&gt;

          &lt;AlertDialogTitle&gt;Are you absolutely sure?&lt;/AlertDialogTitle&gt;

          &lt;AlertDialogDescription&gt;

            This action cannot be undone. This will permanently delete your

            account and remove your data from our servers.

          &lt;/AlertDialogDescription&gt;

        &lt;/AlertDialogHeader&gt;

        &lt;AlertDialogFooter&gt;

          &lt;AlertDialogCancel&gt;Cancel&lt;/AlertDialogCancel&gt;

          &lt;AlertDialogAction&gt;Continue&lt;/AlertDialogAction&gt;

        &lt;/AlertDialogFooter&gt;

      &lt;/AlertDialogPopup&gt;

    &lt;/AlertDialog&gt;

  );

};

---

title: Alert Dialog

description: A dialog that requires user response to proceed.

author:

name: imskyleen

url: [https://github.com/imskyleen](https://github.com/imskyleen](https://github.com/imskyleen))

releaseDate: 2025-09-16

---

&lt;ComponentPreview name="demo-components-base-alert-dialog" /&gt;

## Installation

&lt;ComponentInstallation name="components-base-alert-dialog" /&gt;

## Usage

```tsx

&lt;AlertDialog&gt;

  &lt;AlertDialogTrigger&gt;Open Dialog&lt;/AlertDialogTrigger&gt;

  &lt;AlertDialogPopup&gt;

    &lt;AlertDialogHeader&gt;

      &lt;AlertDialogTitle&gt;Alert Dialog Title&lt;/AlertDialogTitle&gt;

      &lt;AlertDialogDescription&gt;Alert Dialog Description&lt;/AlertDialogDescription&gt;

    &lt;/AlertDialogHeader&gt;

    &lt;AlertDialogFooter&gt;

      &lt;AlertDialogCancel&gt;Cancel&lt;/AlertDialogCancel&gt;

      &lt;AlertDialogAction&gt;Accept&lt;/AlertDialogAction&gt;

    &lt;/AlertDialogFooter&gt;

  &lt;/AlertDialogPopup&gt;

&lt;/AlertDialog&gt;

```

## API Reference

### AlertDialog

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialog](https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialog)" text="Animate UI API Reference - Alert Dialog Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/alert-dialog#root](https://base-ui.com/react/components/alert-dialog#root)" text="Base UI API Reference - AlertDialog.Root" /&gt;

&lt;/div&gt;

### AlertDialogTrigger

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogtrigger](https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogtrigger)" text="Animate UI API Reference - Dialog Trigger Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/alert-dialog#trigger](https://base-ui.com/react/components/alert-dialog#trigger)" text="Base UI API Reference - AlertDialog.Trigger" /&gt;

&lt;/div&gt;

### AlertDialogPopup

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogpopup](https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogpopup)" text="Animate UI API Reference - Alert Dialog Popup Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/alert-dialog#popup](https://base-ui.com/react/components/alert-dialog#popup)" text="Base UI API Reference - AlertDialog.Popup" /&gt;

&lt;/div&gt;

&lt;TypeTable

  type={{

  from: {

```
description: 'The direction the alert dialog should flip from',

type: "'top' | 'bottom' | 'left' | 'right'",

required: false,

default: 'top',
```

  },

  transition: {

```
description: 'The transition of the alert dialog popup',

type: 'Transition',

required: false,

default: "{ type: 'spring', stiffness: 150, damping: 25 }",
```

  },

  '...props': {

```
description: 'The props of the alert dialog popup.',

type: 'HTMLMotionProps&lt;"div"&gt;',

required: false,
```

  },

}}

/&gt;

&lt;Callout type="info"&gt;

  The `render` property is not supported in the `AlertDialogPopup` component, as

  it is used for animation.

&lt;/Callout&gt;

### AlertDialogAction

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogclose](https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogclose)" text="Animate UI API Reference - Alert Dialog Close Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/alert-dialog#close](https://base-ui.com/react/components/alert-dialog#close)" text="Base UI API Reference - AlertDialog.Close" /&gt;

&lt;/div&gt;

### AlertDialogCancel

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogclose](https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogclose)" text="Animate UI API Reference - Alert Dialog Close Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/alert-dialog#close](https://base-ui.com/react/components/alert-dialog#close)" text="Base UI API Reference - AlertDialog.Close" /&gt;

&lt;/div&gt;

### AlertDialogHeader

&lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogheader](https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogheader)" text="Animate UI API Reference - Alert Dialog Header Primitive" /&gt;

&lt;TypeTable

  type={{

  '...props': {

```
description: 'The props of the alert dialog header.',

type: "React.ComponentProps&lt;'div'&gt;",

required: false,
```

  },

}}

/&gt;

### AlertDialogTitle

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogtitle](https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogtitle)" text="Animate UI API Reference - Alert Dialog Title Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/alert-dialog#title](https://base-ui.com/react/components/alert-dialog#title)" text="Base UI API Reference - AlertDialog.Title" /&gt;

&lt;/div&gt;

### AlertDialogDescription

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogdescription](https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogdescription)" text="Animate UI API Reference - Alert Dialog Description Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/alert-dialog#description](https://base-ui.com/react/components/alert-dialog#description)" text="Base UI API Reference - AlertDialog.Description" /&gt;

&lt;/div&gt;

### AlertDialogFooter

&lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogfooter](https://animate-ui.com/docs/primitives/base/alert-dialog#alertdialogfooter)" text="Animate UI API Reference - Alert Dialog Footer Primitive" /&gt;

&lt;TypeTable

  type={{

  '...props': {

```
description: 'The props of the alert dialog footer.',

type: "React.ComponentProps&lt;'div'&gt;",

required: false,
```

  },

}}

/&gt;

## Credits

- [Base UI Alert Dialog]([https://base-ui.com/react/components/alert-dialog](https://base-ui.com/react/components/alert-dialog))
- Credit to [shadcn/ui]([https://ui.shadcn.com/docs/components/alert-dialog](https://ui.shadcn.com/docs/components/alert-dialog)) for style inspiration.

