<script generics="T" lang="ts">
  import { css } from "styled-system/css";
  import { flex } from "styled-system/patterns";
  import type { Snippet } from "svelte";
  import Modal from "$lib/components/Modal.svelte";
  import Button from "$lib/components/ui/button/button.svelte";

  interface Props<T> {
    descriptionSnippet?: Snippet<[item: T]>;
    dialogEl?: HTMLDialogElement | undefined;
    item: T;
    onCancel?: () => void;
    onDelete: () => Promise<void> | void;
    titleText?: string;
  }

  let {
    item,
    titleText = "Are you sure you want to delete this?",
    onCancel,
    onDelete,
    descriptionSnippet,
    dialogEl = $bindable<HTMLDialogElement | undefined>(),
  }: Props<T> = $props();

  const handleDelete = async () => {
    await onDelete();
  };
</script>

<Modal onClose={onCancel} bind:dialogEl>
  {#snippet title()}
    <h2
      class={css({
        color: "daisyBush",
        fontSize: "xl",
        fontWeight: "bold",
        textAlign: "center",
      })}
    >
      {titleText}
    </h2>
  {/snippet}

  {#snippet description()}
    <h2
      class={css({
        color: "daisyBush",
        fontSize: "lg",
        fontWeight: "medium",
        textAlign: "center",
      })}
    >
      {#if descriptionSnippet}
        {@render descriptionSnippet?.(item)}
      {/if}
    </h2>
  {/snippet}
  <div class={flex({ gap: 4, justify: "center" })}>
    <Button onclick={onCancel} variant="secondary">Cancel</Button>
    <Button onclick={handleDelete} variant="destructive">Yes, Delete It.</Button
    >
  </div>
</Modal>
