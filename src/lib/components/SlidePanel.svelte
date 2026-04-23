<script lang="ts">
  import { Dialog, type WithoutChild } from "bits-ui";
  import type { Snippet } from "svelte";
  import Arrow from "$lib/components/icons/Arrow.svelte";
  import Button from "./ui/button/button.svelte";

  type Props = Dialog.RootProps & {
    buttonText: string;
    title: Snippet;
    description: Snippet;
    contentProps?: WithoutChild<Dialog.ContentProps>;
    // ...other component props if you wish to pass them
  };

  let {
    open = $bindable(false),
    children,
    buttonText,
    contentProps,
    title,
    description,
    ...restProps
  }: Props = $props();
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
      class="bg-blueGem/60 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50"
    />
    <Dialog.Content
      class="shadow-addInvoice data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed inset-e-0 inset-bs-0  z-80  overflow-y-scroll bg-white p-2 block-dvh inline-full lg:px-15 lg:py-12 lg:inline-3/4"
      {...contentProps}
    >
      <Dialog.Title> {@render title()} </Dialog.Title>
      <Dialog.Description class="text-foreground-alt text-sm">
        {@render description()}
      </Dialog.Description>
      {@render children?.()}
      <Dialog.Close
        class="text-pastelPurple hover:text-daisyBush focus-visible:outline-ring/50 absolute inset-e-7 inset-bs-5 rounded-md outline-2 outline-transparent transition-[color,scale,outline-color] duration-200 active:scale-95 "
      >
        <Button variant="ghost" size="sm" class=""><Arrow /></Button>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
