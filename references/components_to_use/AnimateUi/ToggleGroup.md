# Toggle Group

URL [https://animate-ui.com/docs/components/base/toggle-group](https://animate-ui.com/docs/components/base/toggle-group)

CLI : npx shadcn@latest add @animate-ui/components-base-toggle-group

URL: /docs/components/base/toggle-group



DEMO : 

import {

  Toggle,

  ToggleGroup,

  type ToggleGroupProps,

} from '@/components/animate-ui/components/base/toggle-group';

import { Bold, Italic, Underline } from 'lucide-react';

interface BaseToggleGroupDemoProps {

  multiple: boolean;

  variant: ToggleGroupProps['variant'];

  size: ToggleGroupProps['size'];

}

export function BaseToggleGroupDemo({

  multiple,

  variant,

  size,

}: BaseToggleGroupDemoProps) {

  return (

```
&lt;ToggleGroup multiple={multiple} variant={variant} size={size}&gt;

  &lt;Toggle value="bold" aria-label="Toggle bold"&gt;

    &lt;Bold /&gt;

  &lt;/Toggle&gt;

  &lt;Toggle value="italic" aria-label="Toggle italic"&gt;

    &lt;Italic /&gt;

  &lt;/Toggle&gt;

  &lt;Toggle value="strikethrough" aria-label="Toggle strikethrough"&gt;

    &lt;Underline /&gt;

  &lt;/Toggle&gt;

&lt;/ToggleGroup&gt;
```

  );

}

---

title: Toggle Group

description: Provides a shared state to a series of toggle buttons.

author:

name: imskyleen

url: [https://github.com/imskyleen](https://github.com/imskyleen](https://github.com/imskyleen))

---

&lt;ComponentPreview name="demo-components-base-toggle-group" /&gt;

## Installation

&lt;ComponentInstallation name="components-base-toggle-group" /&gt;

## Usage

```tsx

&lt;ToggleGroup defaultValue={['bold']}&gt;

  &lt;Toggle value="bold" /&gt;

  &lt;Toggle value="italic" /&gt;

  &lt;Toggle value="underline" /&gt;

&lt;/ToggleGroup&gt;

```

## API Reference

### ToggleGroup

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/components/base/toggle-group#togglegroup](https://animate-ui.com/docs/components/base/toggle-group#togglegroup)" text="Animate UI API Reference - ToggleGroup" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/toggle-group#api-reference](https://base-ui.com/react/components/toggle-group#api-reference)" text="Base UI API Reference - ToggleGroup" /&gt;

&lt;/div&gt;

&lt;TypeTable

  type={{

  variant: {

```
description: 'The variant of the ToggleGroup component.',

type: '"default" | "outline"',

required: false,
```

  },

  size: {

```
description: 'The size of the ToggleGroup component.',

type: '"default" | "sm" | "lg" | "icon"',

required: false,
```

  },

}}

/&gt;

### Toggle

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/components/base/toggle-group#toggle](https://animate-ui.com/docs/components/base/toggle-group#toggle)" text="Animate UI API Reference - Toggle" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/toggle#api-reference](https://base-ui.com/react/components/toggle#api-reference)" text="Base UI API Reference - Toggle" /&gt;

&lt;/div&gt;

&lt;TypeTable

  type={{

  variant: {

```
description: 'The variant of the Toggle component.',

type: '"default" | "outline"',

required: false,
```

  },

  size: {

```
description: 'The size of the Toggle component.',

type: '"default" | "sm" | "lg" | "icon"',

required: false,
```

  },

  '...props': {

```
description: 'The props of the Toggle component.',

type: 'HTMLMotionProps&lt;"button"&gt;',

required: false,
```

  },

}}

/&gt;

&lt;Callout type="info"&gt;

  The `render` property is not supported in the `Toggle` component, as it is

  used for animation.

&lt;/Callout&gt;

## Credits

- [Base UI Toggle Group]([https://base-ui.com/react/components/toggle-group](https://base-ui.com/react/components/toggle-group))

