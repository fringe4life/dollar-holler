<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import Trash from '$lib/icon/Trash.svelte'
  import type { LineItem } from '../../../global'

  type Props = {
    lineItem: LineItem
    removeLineItem: (id: string) => void
    canDelete: boolean
    isRequired: boolean
  }
  let { isRequired, lineItem = $bindable(), removeLineItem, canDelete }: Props = $props()

  let unitPrice = $derived((lineItem.amount / lineItem.quantity).toFixed(2))
  let amount = $derived((lineItem.quantity * Number(unitPrice)).toFixed(2))
  $effect(() => {
    lineItem.amount = Number(amount)
  })
  $inspect(lineItem)
</script>

<div class="invoice-line-item border-fog border-b-2 pb-2">
  <div>
    <input
      bind:value={lineItem.description}
      class="line-item"
      type="text"
      name="description"
      required={isRequired}
    />
  </div>

  <div>
    <input
      bind:value={unitPrice}
      class="line-item text-right"
      type="number"
      name="unitPrice"
      step="0.01"
      min="0"
      onblur={() => {
        unitPrice = Number(unitPrice).toFixed(2)
      }}
      required={isRequired}
    />
  </div>
  <div>
    <input
      bind:value={lineItem.quantity}
      class="line-item text-center"
      type="number"
      name="quantity"
      min="0"
      required={isRequired}
    />
  </div>
  <div>
    <input
      bind:value={amount}
      class="line-item text-right"
      type="number"
      name="amount"
      step="0.01"
      min="0"
      disabled
    />
  </div>
  <div class="place-self-center">
    {#if canDelete}
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
  input[type='text'],
  input[type='number'] {
    @apply h-10 w-full border-b-2 border-dashed border-stone-300;
  }
  input[type='text'] {
    @apply font-sansserif h-10 text-xl font-bold;
  }

  input[type='number'] {
    @apply font-mono text-base;
  }

  input[type='text']:focus,
  input[type='number']:focus {
    @apply border-lavenderIndigo border-solid outline-none;
  }

  input:is([type='number'], [type='text']):is(:disabled) {
    @apply border-b-0 bg-transparent px-0;
  }
</style>
