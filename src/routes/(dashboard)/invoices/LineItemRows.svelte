<script lang="ts">
  import CircledAmount from "$lib/components/CircledAmount.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import type { LineItem } from "$lib/db/schema";
  import type { BitsButton, List } from "$lib/types";
  import { centsToDollars, sumLineItems } from "$lib/utils/moneyHelpers";
  import LineItemRow from "./LineItemRow.svelte";

  type Props = {
    lineItems: List<LineItem>;
    addLineItem: BitsButton;
    removeLineItem: (id: string) => void;
    discount: number;
    isEditible?: boolean;
  };
  let {
    discount = $bindable(),
    lineItems: lineItems = $bindable(),
    addLineItem,
    removeLineItem,
    isEditible = true,
  }: Props = $props();

  let subTotal = $derived<number>(sumLineItems(lineItems));

  let discountAmount = $derived<number>(
    sumLineItems(lineItems) * (discount ? discount / 100 : 0)
  );

  let total = $derived.by<string>(() => {
    let final = Number(subTotal) - Number(discountAmount);
    return centsToDollars(final);
  });
</script>

<div class="invoice-line-item border-b-2 border-daisyBush pbe-2">
  <div class="hidden text-sm font-bold text-daisyBush sm:block print:block">
    Description
  </div>
  <div
    class="hidden text-right text-sm font-bold text-daisyBush sm:block print:block"
  >
    Unit price
  </div>
  <div
    class="hidden text-center text-sm font-bold text-daisyBush sm:block print:block"
  >
    Qty
  </div>
  <div
    class="hidden text-right text-sm font-bold text-daisyBush sm:block print:block"
  >
    Amount
  </div>
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
  <div class="py-5 text-right font-bold text-monsoon print:col-span-3">
    Subtotal
  </div>
  <div class="py-5 text-right font-mono">{subTotal}</div>
</div>

<div class="invoice-line-item">
  <p
    class="col-span-1 py-5 text-right font-bold text-monsoon sm:col-span-2 print:col-span-3"
  >
    Discount
  </p>
  <div class="relative">
    <input
      class="line-item border-b-2 border-dashed border-b-stone-300 text-right block-10 inline-full not-print:pe-4 focus:border-solid focus:border-lavenderIndigo focus:outline-none"
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
