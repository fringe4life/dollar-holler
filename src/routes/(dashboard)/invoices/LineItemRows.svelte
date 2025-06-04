<script lang="ts">
  import CircledAmount from '$lib/components/CircledAmount.svelte'
  import Button from '$lib/components/ui/button/button.svelte'
  import type { MouseEventHandler } from 'svelte/elements'
  import type { LineItem } from '../../../global'
  import LineItemRow from './LineItemRow.svelte'

  type Props = {
    lineItems: LineItem[] | undefined
    addLineItem: MouseEventHandler<HTMLButtonElement> & MouseEventHandler<HTMLAnchorElement>
    removeLineItem: (id: string) => void
  }
  let { lineItems, addLineItem, removeLineItem }: Props = $props()
</script>

<div class="border-daisyBush invoice-line-item border-b-2 pb-2">
  <!-- 1fr 100px ... 50px -->
  <div class="table-header">Description</div>
  <div class="table-header text-right">Unit price</div>
  <div class="table-header text-center">Qty</div>
  <div class="table-header text-right">Amount</div>
</div>

{#if lineItems}
  {#each lineItems as lineItem (lineItem.id)}
    <LineItemRow {lineItem} {removeLineItem} />
  {/each}
{/if}

<div class="invoice-line-item">
  <div class="col-span-2">
    <Button variant="textOnly" onclick={addLineItem}>+ Line Item</Button>
  </div>
  <div class="text-monsoon py-5 text-right font-bold">Subtotal</div>
  <div class="py-5 text-right font-mono">$250.00</div>
</div>

<div class="invoice-line-item">
  <div class="text-monsoon col-span-2 py-5 text-right font-bold">Discount</div>
  <div class="relative">
    <input
      class="line-item focus:border-lavenderIndigo h-10 w-full border-b-2 border-dashed border-b-stone-300 pr-3 text-right focus:border-solid focus:outline-none"
      type="number"
      name="discount"
      min="0"
      max="100"
    />
    <span class="absolute top-2 right-0 font-mono">%</span>
  </div>
  <div class="py-5 text-right font-mono">$10.00</div>
</div>

<div class="invoice-line-item">
  <div class="col-span-6">
    <CircledAmount amount="$1,144.00" label="Total." />
  </div>
</div>

<style>
  @reference "../../../app.css";
  .table-header {
    @apply text-daisyBush text-sm font-bold;
  }
</style>
