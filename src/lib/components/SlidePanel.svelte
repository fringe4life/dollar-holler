<script lang="ts">
  import type { Snippet } from 'svelte'
  import { Dialog, type WithoutChild } from 'bits-ui'
  import Cancel from '$lib/icon/Cancel.svelte'
  import Button from './ui/button/button.svelte'
  import Arrow from '$lib/icon/Arrow.svelte'

  type Props = Dialog.RootProps & {
    buttonText: string
    title: Snippet
    description: Snippet
    contentProps?: WithoutChild<Dialog.ContentProps>
    // ...other component props if you wish to pass them
  }

  let {
    open = $bindable(false),
    children,
    buttonText,
    contentProps,
    title,
    description,
    ...restProps
  }: Props = $props()
</script>

<svelte:head>
  {#if open}
    <style>
      body {
        overflow: hidden;
      }
    </style>
  {/if}
</svelte:head>

<Dialog.Root bind:open {...restProps}>
  <Dialog.Portal>
    <Dialog.Overlay
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-blueGem/60 fixed inset-0 z-50"
    />
    <Dialog.Content
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 shadow-addInvoice fixed top-0 right-0  z-80  h-[100dvh] w-3/4 overflow-y-scroll bg-white px-15 py-12"
      {...contentProps}
    >
      <Dialog.Title>
        {@render title()}
      </Dialog.Title>
      <Dialog.Description class="text-foreground-alt text-sm">
        {@render description()}
      </Dialog.Description>
      {@render children?.()}
      <Dialog.Close
        class="text-pastelPurple hover:text-daisyBush  focus-visible:ring-foreground focus-visible:ring-offset-background  absolute top-5  left-7 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-95 "
      >
        <Button variant="ghost" size="sm" class=""><Arrow /></Button>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
