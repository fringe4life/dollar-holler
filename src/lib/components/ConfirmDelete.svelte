<script lang="ts" generics="T">
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

<Modal bind:dialogEl onClose={onCancel}>
  {#snippet title()}
    <h2
      class={css({
        color: "daisyBush",
        textAlign: "center",
        fontSize: "xl",
        fontWeight: "bold",
      })}
    >
      {titleText}
    </h2>
  {/snippet}

  {#snippet description()}
    <h2
      class={css({
        color: "daisyBush",
        textAlign: "center",
        fontSize: "lg",
        fontWeight: "medium",
      })}
    >
      {#if descriptionSnippet}
        {@render descriptionSnippet?.(item)}
      {/if}
    </h2>
  {/snippet}
  <div class={flex({ justify: "center", gap: 4 })}>
    <Button variant="secondary" onclick={onCancel}>Cancel</Button>
    <Button variant="destructive" onclick={handleDelete}
      >Yes, Delete It.</Button
    >
  </div>
</Modal>
