<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import type { LineItem } from "$lib/db/schema";
  import Trash from "$lib/icon/Trash.svelte";

  type Props = {
    lineItem: LineItem;
    removeLineItem: (id: string) => void;
    canDelete: boolean;
    isRequired: boolean;
    isEditible: boolean;
  };
  let {
    isEditible = true,
    isRequired,
    lineItem = $bindable(),
    removeLineItem,
    canDelete,
  }: Props = $props();

  // Use $state for editable values, initialize from lineItem
  let unitPrice = $state(
    lineItem.quantity > 0
      ? (lineItem.amount / lineItem.quantity).toFixed(2)
      : "0.00"
  );

  // Derived amount for display (read-only)
  const amount = $derived((lineItem.quantity * Number(unitPrice)).toFixed(2));

  // Update lineItem.amount when unitPrice or quantity changes
  const updateAmount = () => {
    lineItem.amount = lineItem.quantity * Number(unitPrice);
  };

  // Format unitPrice on blur
  const formatUnitPrice = () => {
    unitPrice = Number(unitPrice).toFixed(2);
    updateAmount();
  };
</script>

<div class="invoice-line-item border-fog border-b-2 py-4 sm:py-2">
  <div class="description">
    <label for="description" class="line-item-label">Description</label>
    <input
      bind:value={lineItem.description}
      class="line-item"
      type="text"
      name="description"
      id="description"
      required={isRequired}
      disabled={!isEditible}
    />
  </div>

  <div class="unitPrice">
    <label for="unitPrice" class="line-item-label text-right">Unit Price</label>
    <input
      bind:value={unitPrice}
      oninput={updateAmount}
      onblur={formatUnitPrice}
      class="line-item text-right"
      type="number"
      name="unitPrice"
      step="0.01"
      min="0"
      required={isRequired}
      disabled={!isEditible}
    />
  </div>
  <div class="quantity">
    <label for="quantity" class="line-item-label text-center">Qty</label>
    <input
      bind:value={lineItem.quantity}
      oninput={updateAmount}
      class="line-item text-center"
      type="number"
      name="quantity"
      min="0"
      required={isRequired}
      disabled={!isEditible}
    />
  </div>
  <div class="amount">
    <label for="amount" class="line-item-label text-right">Amount</label>
    <input
      value={amount}
      class="line-item text-right"
      type="number"
      name="amount"
      step="0.01"
      min="0"
      disabled
    />
  </div>
  <div class="trash place-self-center">
    {#if canDelete && isEditible}
      <Button
        onclick={() => removeLineItem(lineItem.id)}
        variant="ghost"
        class="h-10 w-full text-center"><Trash /></Button
      >
    {/if}
  </div>
</div>

<style>
  @reference "../../../app.css";
  input[type="text"],
  input[type="number"] {
    @apply h-10 w-full border-b-2 border-dashed border-stone-300;
  }
  input[type="text"] {
    @apply font-sansserif h-10 text-xl font-bold;
  }

  input[type="number"] {
    @apply font-mono text-base;
  }

  input[type="text"]:focus,
  input[type="number"]:focus {
    @apply border-lavenderIndigo border-solid outline-none;
  }

  input:is([type="number"], [type="text"]):is(:disabled) {
    @apply border-b-0 bg-transparent px-0;
  }

  .line-item-label {
    @apply block sm:hidden print:hidden;
  }
</style>
