<script lang="ts">
  import Cancel from "$lib/components/icons/Cancel.svelte";
  import { Dialog, type WithoutChild } from "bits-ui";
  import type { Snippet } from "svelte";
  import Button from "./ui/button/button.svelte";

  type Props = Dialog.RootProps & {
    buttonText: string;
    title: Snippet;
    description: Snippet;
    contentProps?: WithoutChild<Dialog.ContentProps>;
    // ...other component props if you wish to pass them
    className?: string;
  };

  let {
    open = $bindable(false),
    children,
    buttonText,
    contentProps,
    title,
    description,
    className = "",
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
      class={`bg-blueGem/60 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 ${className ? className : "z-50"}`}
    />
    <Dialog.Content
      class="rounded-card-lg bg-background shadow-popover data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed inset-s-1/2 inset-bs-1/2 z-500 grid -translate-1/2 content-between items-center border px-10 py-7 outline-hidden inline-full max-inline-[calc(100%-2rem)] min-block-57.5 sm:max-inline-122.5 md:inline-full"
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
        class="text-pastelPurple hover:text-blueGem focus-visible:outline-ring/50 absolute rounded-md outline-2 outline-transparent transition-[color,outline-color,scale] duration-200 active:scale-95 pointer-coarse:inset-e-1 pointer-coarse:inset-bs-1 pointer-fine:inset-e-4 pointer-fine:inset-bs-4"
      >
        <Button variant="ghost" size="icon"><Cancel /></Button>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
