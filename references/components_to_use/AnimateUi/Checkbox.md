# Checkbox

URL: [https://animate-ui.com/docs/components/base/checkbox](https://animate-ui.com/docs/components/base/checkbox)

URL: /docs/components/base/checkbox

CLI: npx shadcn@latest add @animate-ui/components-base-checkbox  
DEMO:  


import { Label } from '@/components/ui/label';

import {

  Checkbox,

  type CheckboxProps,

} from '@/components/animate-ui/components/base/checkbox';

interface BaseCheckboxDemoProps {

  indeterminate: boolean;

  variant: CheckboxProps['variant'];

  size: CheckboxProps['size'];

}

export const BaseCheckboxDemo = ({

  indeterminate,

  variant,

  size,

}: BaseCheckboxDemoProps) =&gt; {

  return (

    &lt;Label className="flex items-center gap-x-3"&gt;

      &lt;Checkbox indeterminate={indeterminate} variant={variant} size={size} /&gt;

      Accept terms and conditions

    &lt;/Label&gt;

  );

};  


---

title: Checkbox

description: An easily stylable checkbox component.

author:

name: imskyleen

url: [https://github.com/imskyleen](https://github.com/imskyleen](https://github.com/imskyleen))

---

&lt;ComponentPreview name="demo-components-base-checkbox" /&gt;

## Installation

&lt;ComponentInstallation name="components-base-checkbox" /&gt;

## Usage

```tsx

&lt;Checkbox /&gt;

```

## API Reference

### Checkbox

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/checkbox#checkbox](https://animate-ui.com/docs/primitives/base/checkbox#checkbox)" text="Animate UI API Reference - Checkbox Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/checkbox#root](https://base-ui.com/react/components/checkbox#root)" text="Base UI API Reference - Checkbox.Root" /&gt;

&lt;/div&gt;

&lt;TypeTable

  type={{

  variant: {

```
description: 'The variant of the checkbox.',

type: '"default" | "accent"',

required: false,
```

  },

  size: {

```
description: 'The size of the checkbox.',

type: '"default" | "sm" | "lg"',

required: false,
```

  },

  '...props': {

```
description: 'The props of the checkbox.',

type: 'HTMLMotionProps&lt;"button"&gt;',

required: false,
```

  },

}}

/&gt;

&lt;Callout type="info"&gt;

  The `render` prop is not supported in the `Checkbox` component as it is used

  for animation.

&lt;/Callout&gt;

## Credits

- [Base UI Checkbox]([https://base-ui.com/react/components/checkbox](https://base-ui.com/react/components/checkbox))
- Credit to [shadcn/ui]([https://ui.shadcn.com/docs/components/checkbox](https://ui.shadcn.com/docs/components/checkbox)) for style inspiration.

