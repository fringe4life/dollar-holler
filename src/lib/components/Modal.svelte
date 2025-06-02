<script lang="ts">
  import { Button, buttonVariants } from '$lib/components/ui/button/index.js'
  // import { Dialog } from 'bits-ui'
  import 
  import * as Dialog from '$lib/components/ui/dialog'
  import { Input } from '$lib/components/ui/input/index.js'
  import { Label } from '$lib/components/ui/label/index.js'
  import Cancel from '$lib/icon/Cancel.svelte'
  import type { WithoutChild } from 'bits-ui'
  import type { Snippet } from 'svelte'

  type Props = Dialog.RootProps & {
    buttonText: string
    title: Snippet
    description: Snippet
    // contentProps?: WithoutChild<Dialog.ContentProps>
    // ...other component props if you wish to pass them
  }

  let {
    open = $bindable(),
    children,
    buttonText,
    contentProps,
    title,
    description,
    ...restProps
  }: Props = $props()
</script>

<Dialog.Root bind:open {...restProps}>
  <Dialog.Trigger>
    {buttonText}
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content {...contentProps}>
      <Dialog.Title>
        {@render title()}
      </Dialog.Title>
      <Dialog.Description>
        {@render description()}
      </Dialog.Description>
      {@render children?.()}
      <Dialog.Close>Close Dialog</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
