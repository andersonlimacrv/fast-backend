# Radio

URL: [https://animate-ui.com/docs/components/base/radio](https://animate-ui.com/docs/components/base/radio)

URL: /docs/components/base/radio

CLI: npx shadcn@latest add @animate-ui/components-base-radio

DEMO:

import * as React from 'react';

import { RadioGroup, Radio } from '@/components/animate-ui/components/base/radio';

import { Label } from '@/components/ui/label';

export const BaseRadioDemo = () =&gt; {

  return (

    &lt;RadioGroup defaultValue="default"&gt;

      &lt;Label className="flex items-center gap-x-3"&gt;

        &lt;Radio value="default" /&gt;

        Default

      &lt;/Label&gt;

      &lt;Label className="flex items-center gap-x-3"&gt;

        &lt;Radio value="comfortable" /&gt;

        Comfortable

      &lt;/Label&gt;

      &lt;Label className="flex items-center gap-x-3"&gt;

        &lt;Radio value="compact" /&gt;

        Compact

      &lt;/Label&gt;

    &lt;/RadioGroup&gt;

  );

};

---

title: Radio

description: An easily stylable radio button component.

author:

name: imskyleen

url: [https://github.com/imskyleen](https://github.com/imskyleen](https://github.com/imskyleen))

releaseDate: 2025-09-26

---

&lt;ComponentPreview name="demo-components-base-radio" /&gt;

## Installation

&lt;ComponentInstallation name="components-base-radio" /&gt;

## Usage

```tsx

&lt;RadioGroup&gt;

  &lt;Radio value="1" /&gt;

  &lt;Radio value="2" /&gt;

  &lt;Radio value="3" /&gt;

&lt;/RadioGroup&gt;

```

## API Reference

### RadioGroup

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/radio#radiogroup](https://animate-ui.com/docs/primitives/base/radio#radiogroup)" text="Animate UI API Reference - RadioGroup Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/radio#radiogroup](https://base-ui.com/react/components/radio#radiogroup)" text="Base UI API Reference - RadioGroup" /&gt;

&lt;/div&gt;

### Radio

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/radio#radiogroupitem](https://animate-ui.com/docs/primitives/base/radio#radiogroupitem)" text="Animate UI API Reference - Radio Primitive" /&gt;

  &lt;ExternalLink href="[https://base-ui.com/react/components/radio#root](https://base-ui.com/react/components/radio#root)" text="Base UI API Reference - Radio.Root" /&gt;

&lt;/div&gt;

&lt;TypeTable

  type={{

  '...props': {

```
description: 'The props of the radio.',

type: 'HTMLMotionProps&lt;"button"&gt;',

required: false,
```

  },

}}

/&gt;

&lt;Callout type="info"&gt;

  The `render` property is not supported in the `Radio` component, as it is used

  for animation.

&lt;/Callout&gt;

## Credits

- [Base UI Radio]([https://base-ui.com/react/components/radio](https://base-ui.com/react/components/radio))
- Credit to [shadcn/ui]([https://ui.shadcn.com/docs/components/radio-group](https://ui.shadcn.com/docs/components/radio-group)) for style inspiration.

