# Files

URL: [https://animate-ui.com/docs/components/base/files](https://animate-ui.com/docs/components/base/files)

URL: /docs/components/base/files

CLI: npx shadcn@latest add @animate-ui/components-base-files

DEMO:  
  
'use client';

import React from 'react';

import {

  FileItem,

  FolderItem,

  FolderTrigger,

  FolderPanel,

  Files,

  SubFiles,

} from '@/components/animate-ui/components/base/files';

import { FileJsonIcon } from 'lucide-react';

export const BaseFilesDemo = () =&gt; {

  return (

    &lt;div className="relative max-w-[500px] max-h-[350px] size-full rounded-2xl border bg-background overflow-auto"&gt;

      &lt;Files className="w-full" defaultOpen={['app']}&gt;

        &lt;FolderItem value="app"&gt;

          &lt;FolderTrigger

            gitStatus="modified"

            className="w-full flex items-center justify-between"

          &gt;

            app

          &lt;/FolderTrigger&gt;

          &lt;FolderPanel&gt;

            &lt;SubFiles defaultOpen={['(home)']}&gt;

              &lt;FolderItem value="(home)"&gt;

                &lt;FolderTrigger gitStatus="untracked"&gt;(home)&lt;/FolderTrigger&gt;

                &lt;FolderPanel&gt;

                  &lt;FileItem gitStatus="untracked"&gt;page.tsx&lt;/FileItem&gt;

                  &lt;FileItem gitStatus="untracked"&gt;layout.tsx&lt;/FileItem&gt;

                &lt;/FolderPanel&gt;

              &lt;/FolderItem&gt;

              &lt;FileItem&gt;layout.tsx&lt;/FileItem&gt;

              &lt;FileItem gitStatus="modified"&gt;page.tsx&lt;/FileItem&gt;

              &lt;FileItem&gt;global.css&lt;/FileItem&gt;

            &lt;/SubFiles&gt;

          &lt;/FolderPanel&gt;

        &lt;/FolderItem&gt;

        &lt;FolderItem value="components"&gt;

          &lt;FolderTrigger&gt;components&lt;/FolderTrigger&gt;

          &lt;FolderPanel&gt;

            &lt;SubFiles&gt;

              &lt;FileItem&gt;button.tsx&lt;/FileItem&gt;

              &lt;FileItem&gt;tabs.tsx&lt;/FileItem&gt;

              &lt;FileItem&gt;dialog.tsx&lt;/FileItem&gt;

              &lt;FolderItem value="empty"&gt;

                &lt;FolderTrigger&gt;empty&lt;/FolderTrigger&gt;

              &lt;/FolderItem&gt;

            &lt;/SubFiles&gt;

          &lt;/FolderPanel&gt;

        &lt;/FolderItem&gt;

        &lt;FileItem icon={FileJsonIcon}&gt;package.json&lt;/FileItem&gt;

      &lt;/Files&gt;

    &lt;/div&gt;

  );

};

---

title: Files

description: A component that allows you to display a list of files and folders.

author:

name: imskyleen

url: [https://github.com/imskyleen](https://github.com/imskyleen](https://github.com/imskyleen))

releaseDate: 2025-09-07

---

&lt;ComponentPreview name="demo-components-base-files" /&gt;

## Installation

&lt;ComponentInstallation name="components-base-files" /&gt;

## Usage

```tsx

&lt;Files&gt;

  &lt;FolderItem value="app"&gt;

    &lt;FolderTrigger&gt;app&lt;/FolderTrigger&gt;

    &lt;FolderPanel&gt;

      &lt;SubFiles&gt;

        &lt;FolderItem value="(home)"&gt;

          &lt;FolderTrigger&gt;(home)&lt;/FolderTrigger&gt;

          &lt;FolderPanel&gt;

            &lt;FileItem&gt;page.tsx&lt;/FileItem&gt;

            &lt;FileItem&gt;layout.tsx&lt;/FileItem&gt;

          &lt;/FolderPanel&gt;

        &lt;/FolderItem&gt;

        &lt;FileItem&gt;layout.tsx&lt;/FileItem&gt;

        &lt;FileItem&gt;page.tsx&lt;/FileItem&gt;

        &lt;FileItem&gt;global.css&lt;/FileItem&gt;

      &lt;/SubFiles&gt;

    &lt;/FolderPanel&gt;

  &lt;/FolderItem&gt;

  &lt;FolderItem value="components"&gt;

    &lt;FolderTrigger&gt;components&lt;/FolderTrigger&gt;

    &lt;FolderPanel&gt;

      &lt;SubFiles&gt;

        &lt;FileItem&gt;button.tsx&lt;/FileItem&gt;

        &lt;FileItem&gt;tabs.tsx&lt;/FileItem&gt;

        &lt;FileItem&gt;dialog.tsx&lt;/FileItem&gt;

        &lt;FolderItem value="empty"&gt;

          &lt;FolderTrigger&gt;empty&lt;/FolderTrigger&gt;

        &lt;/FolderItem&gt;

      &lt;/SubFiles&gt;

    &lt;/FolderPanel&gt;

  &lt;/FolderItem&gt;

  &lt;FileItem&gt;package.json&lt;/FileItem&gt;

&lt;/Files&gt;

```

## API Reference

### Files

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/files#files](https://animate-ui.com/docs/primitives/base/files#files)" text="Animate UI API Reference - Base UI Files" /&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/accordion#accordion](https://animate-ui.com/docs/primitives/base/accordion#accordion)" text="Animate UI API Reference - Base UI Accordion" /&gt;

&lt;/div&gt;

&lt;TypeTable

  type={{

  children: {

```
description: 'The child folders and files.',

type: 'React.ReactNode',

required: true,
```

  },

  defaultOpen: {

```
description: 'The child folders open by default.',

type: 'string[]',

required: false,

default: '[]',
```

  },

  open: {

```
description: 'The child folders open.',

type: 'string[]',

required: false,
```

  },

  onOpenChange: {

```
description: 'The callback function when the child folders open changes.',

type: '(open: string[]) =&gt; void',

required: false,
```

  },

}}

/&gt;

### FolderItem

&lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/files#folderitem](https://animate-ui.com/docs/primitives/base/files#folderitem)" text="Animate UI API Reference - Base UI FolderItem" /&gt;

### FolderTrigger

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/files#foldertrigger](https://animate-ui.com/docs/primitives/base/files#foldertrigger)" text="Animate UI API Reference - Base UI FolderTrigger" /&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/accordion#accordiontrigger](https://animate-ui.com/docs/primitives/base/accordion#accordiontrigger)" text="Animate UI API Reference - Base UI AccordionTrigger" /&gt;

&lt;/div&gt;

&lt;TypeTable

  type={{

  gitStatus: {

```
description: 'The git status of the folder.',

type: '"untracked" | "modified" | "deleted"',

required: false,
```

  },

  '...props': {

```
description: 'The props of the folder trigger.',

type: 'React.ComponentProps&lt;"span"&gt;',

required: false,
```

  },

}}

/&gt;

### FolderPanel

&lt;div className="flex flex-col gap-2"&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/files#folderpanel](https://animate-ui.com/docs/primitives/base/files#folderpanel)" text="Animate UI API Reference - Base UI FolderPanel" /&gt;

  &lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/accordion#accordionpanel](https://animate-ui.com/docs/primitives/base/accordion#accordionpanel)" text="Animate UI API Reference - Base UI AccordionPanel" /&gt;

&lt;/div&gt;

### FileItem

&lt;ExternalLink href="[https://animate-ui.com/docs/primitives/base/files#fileitem](https://animate-ui.com/docs/primitives/base/files#fileitem)" text="Animate UI API Reference - Base UI FileItem" /&gt;

&lt;TypeTable

  type={{

  icon: {

```
description: 'The icon of the file.',

type: 'React.ElementType',

required: false,

default: 'FileIcon',
```

  },

  gitStatus: {

```
description: 'The git status of the file.',

type: '"untracked" | "modified" | "deleted"',

required: false,
```

  },

  '...props': {

```
description: 'The props of the file item.',

type: 'React.ComponentProps&lt;"span"&gt;',

required: false,
```

  },

}}

/&gt;

## Credits

- [Base UI Accordion]([https://base-ui.com/react/components/accordion](https://base-ui.com/react/components/accordion))

