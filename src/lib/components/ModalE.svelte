<script lang="ts">
  import type { Snippet } from 'svelte'
  import { Dialog, type WithoutChild } from 'bits-ui'
  import Cancel from '$lib/icon/Cancel.svelte'
  import Button from './ui/button/button.svelte'

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
  <!-- <Dialog.Trigger
    onclick={() => (open = !open)}
    class="bg-dark text-pastelPurple hover:text-blueGem shadow-mini hover:bg-dark/95
  focus-visible:ring-foreground focus-visible:ring-offset-background inline-flex h-12 cursor-pointer
  items-center justify-center rounded-md px-[21px] text-[15px] font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-95"
  >
    {buttonText}
  </Dialog.Trigger> -->
  <Dialog.Portal>
    <Dialog.Overlay
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-blueGem/60 fixed inset-0 z-50"
    />
    <Dialog.Content
      class="rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid min-h-57.5 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] content-between items-center border px-10 py-7 outline-hidden sm:max-w-122.5  md:w-full"
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
        class=" focus-visible:ring-foreground focus-visible:ring-offset-background text-pastelPurple hover:text-blueGem  absolute rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-95 pointer-coarse:top-1 pointer-coarse:right-1 pointer-fine:top-4 pointer-fine:right-4"
      >
        <Button variant="ghost" size="icon"><Cancel /></Button>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
