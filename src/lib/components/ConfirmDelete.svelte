<script lang="ts" generics="T">
  import Modal from "$lib/components/Modal.svelte";
  import { Button } from "$lib/components/ui/button";
  import type { Snippet } from "svelte";

  type Props<T> = {
    item: T;
    titleText?: string;
    onCancel?: () => void;
    onDelete: () => Promise<void> | void;
    descriptionSnippet?: Snippet<[item: T]>;
    open?: boolean;
  };

  let {
    item,
    titleText = "Are you sure you want to delete this?",
    onCancel,
    onDelete,
    descriptionSnippet,
    open = $bindable(),
  }: Props<T> = $props();

  const handleDelete = async () => {
    await onDelete();
  };
</script>

<Modal bind:open buttonText="" className="z-450">
  {#snippet title()}
    <h2 class="text-daisyBush text-center text-xl font-bold">{titleText}</h2>
  {/snippet}

  {#snippet description()}
    <h2 class="text-daisyBush text-center text-lg font-medium">
      {#if descriptionSnippet}
        {@render descriptionSnippet?.(item)}
      {/if}
    </h2>
  {/snippet}

  <div class="flex justify-center gap-4">
    <Button variant="secondary" onclick={() => onCancel?.()}>Cancel</Button>
    <Button variant="destructive" onclick={handleDelete}>Yes, Delete It.</Button
    >
  </div>
</Modal>
