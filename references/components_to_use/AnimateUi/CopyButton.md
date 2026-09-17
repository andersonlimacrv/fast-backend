# Copy Button

URL: [https://animate-ui.com/docs/components/buttons/copy](https://animate-ui.com/docs/components/buttons/copy)

URL: /docs/components/buttons/copy

CLI: npx shadcn@latest add @animate-ui/components-buttons-copy

DEMO: import {

  CopyButton,

  type CopyButtonProps,

} from '@/components/animate-ui/components/buttons/copy';

interface CopyButtonDemoProps {

  variant: CopyButtonProps['variant'];

  size: CopyButtonProps['size'];

}

export default function CopyButtonDemo({ variant, size }: CopyButtonDemoProps) {

  return &lt;CopyButton variant={variant} size={size} content="Hello world!" /&gt;;

}

---

title: Copy Button

description: A copy button component with a variety of styles and animations.

author:

name: imskyleen

url: [https://github.com/imskyleen](https://github.com/imskyleen](https://github.com/imskyleen))

---

&lt;ComponentPreview name="demo-components-buttons-copy" /&gt;

## Installation

&lt;ComponentInstallation name="components-buttons-copy" /&gt;

## Usage

```tsx

&lt;CopyButton content="Hello world!" /&gt;

```

## API Reference

### CopyButton

&lt;ExternalLink href="[https://animate-ui.com/docs/primitives/buttons/button#button](https://animate-ui.com/docs/primitives/buttons/button#button)" text="Animate UI API Reference - Button Primitive" /&gt;

&lt;TypeTable

  type={{

  content: {

```
description: 'The content of the button.',

type: 'string',

required: true,
```

  },

  copied: {

```
description: 'The copied state of the button.',

type: 'boolean',

required: false,
```

  },

  onCopiedChange: {

```
description: 'The callback function when the copied state changes.',

type: '(copied: boolean, content?: string) =&gt; void',

required: false,
```

  },

  delay: {

```
description: 'The delay in milliseconds before the copied state resets.',

type: 'number',

required: false,

default: 3000,
```

  },

  variant: {

```
description: 'The variant of the button.',

type: '"default" | "accent" | "destructive" | "outline" | "secondary" | "ghost" | "link"',

required: false,

default: 'default',
```

  },

  size: {

```
description: 'The size of the button.',

type: '"default" | "sm" | "lg" | "icon"',

required: false,

default: 'default',
```

  },

  hoverScale: {

```
description: 'The scale of the button on hover.',

type: 'number',

required: false,

default: 1.05,
```

  },

  tapScale: {

```
description: 'The scale of the button on tap.',

type: 'number',

required: false,

default: 0.95,
```

  },

  '...props': {

```
description: 'The props for the button.',

type: 'HTMLMotionProps&lt;"button"&gt;',

required: false,
```

  },

}}

/&gt;

## Credits

- Credit to [shadcn/ui]([https://ui.shadcn.com/docs/components/button](https://ui.shadcn.com/docs/components/button)) for style inspiration.

