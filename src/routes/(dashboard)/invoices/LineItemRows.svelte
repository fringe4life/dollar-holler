<script lang="ts">
  import CircledAmount from '$lib/components/CircledAmount.svelte'
  import Button from '$lib/components/ui/button/button.svelte'
  import type { MouseEventHandler } from 'svelte/elements'
  import type { LineItem } from '../../../global'
  import LineItemRow from './LineItemRow.svelte'
  import { centsToDollars, sumLineItems } from '$lib/utils/moneyHelpers'

  type Props = {
    lineItems: LineItem[] | undefined
    addLineItem: MouseEventHandler<HTMLButtonElement> & MouseEventHandler<HTMLAnchorElement>
    removeLineItem: (id: string) => void
    discount: number
    isEditible?: boolean
  }
  let {
    discount = $bindable(),
    lineItems = $bindable(),
    addLineItem,
    removeLineItem,
    isEditible = true
  }: Props = $props()

  let subTotal = $derived<number>(sumLineItems(lineItems))

  let discountAmount = $derived<number>(sumLineItems(lineItems) * (discount ? discount / 100 : 0))

  let total = $derived.by<string>(() => {
    let final = Number(subTotal) - Number(discountAmount)
    if (isNaN(final)) return '$0.00'
    return centsToDollars(final)
  })
</script>

<div class="border-daisyBush invoice-line-item border-b-2 pb-2">
  <div class="table-header">Description</div>
  <div class="table-header text-right">Unit price</div>
  <div class="table-header text-center">Qty</div>
  <div class="table-header text-right">Amount</div>
</div>

{#if lineItems}
  {#each lineItems as lineItem, index (lineItem.id)}
    <LineItemRow
      isRequired={index === 0}
      canDelete={index !== 0}
      bind:lineItem={lineItems[index]}
      {removeLineItem}
      {isEditible}
    />
  {/each}
{/if}

<div class="invoice-line-item">
  <div class="col-span-1 sm:col-span-2">
    {#if isEditible}
      <Button variant="textOnly" onclick={addLineItem}>+ Line Item</Button>
    {/if}
  </div>
  <div class="text-monsoon py-5 text-right font-bold print:col-span-3">Subtotal</div>
  <div class="py-5 text-right font-mono">{subTotal}</div>
</div>

<div class="invoice-line-item">
  <p class="text-monsoon col-span-1 py-5 text-right font-bold sm:col-span-2 print:col-span-3">
    Discount
  </p>
  <div class="relative">
    <input
      class="line-item focus:border-lavenderIndigo h-10 w-full border-b-2 border-dashed border-b-stone-300 text-right not-print:pr-4 focus:border-solid focus:outline-none"
      type="number"
      name="discount"
      disabled={!isEditible}
      min="0"
      max="100"
      bind:value={discount}
    />
    <span class="absolute top-2 right-0 font-mono">%</span>
  </div>
  <div class="py-5 text-right font-mono">{centsToDollars(discountAmount)}</div>
</div>

<div class="invoice-line-item">
  <div class="col-span-3 sm:col-span-full print:col-span-full">
    <CircledAmount amount={total} label="Total." />
  </div>
</div>

<style>
  @reference "../../../app.css";
  .table-header {
    @apply text-daisyBush hidden text-sm font-bold sm:block print:block;
  }
</style>
