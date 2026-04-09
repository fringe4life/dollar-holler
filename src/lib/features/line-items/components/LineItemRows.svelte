<script lang="ts">
  import CircledAmount from "$lib/components/CircledAmount.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import type { LineItemRowsProps } from "$lib/features/line-items/types";
  import { centsToDollars, sumLineItems } from "$lib/utils/moneyHelpers";
  import type { FormEventHandler } from "svelte/elements";
  import LineItemRow from "./LineItemRow.svelte";

  let props: LineItemRowsProps = $props();

  const isEditable = $derived(props.mode !== "view");

  let subTotal = $derived<number>(sumLineItems(props.lineItems));

  let discountAmount = $derived<number>(
    sumLineItems(props.lineItems) * (props.discount ? props.discount / 100 : 0)
  );

  let total = $derived.by<string>(() => {
    let final = Number(subTotal) - Number(discountAmount);
    return centsToDollars(final);
  });

  const onDiscountInput: FormEventHandler<HTMLInputElement> = (e) => {
    if (props.mode === "view") return;
    props.setDiscount(Number(e.currentTarget.value));
  };
</script>

<div class="invoice-line-item border-daisyBush border-b-2 pbe-2">
  <div class="text-daisyBush hidden text-sm font-bold sm:block print:block">
    Description
  </div>
  <div
    class="text-daisyBush hidden text-right text-sm font-bold sm:block print:block"
  >
    Unit price
  </div>
  <div
    class="text-daisyBush hidden text-center text-sm font-bold sm:block print:block"
  >
    Qty
  </div>
  <div
    class="text-daisyBush hidden text-right text-sm font-bold sm:block print:block"
  >
    Amount
  </div>
</div>

{#if props.lineItems}
  {#each props.lineItems as lineItem, index (lineItem.id)}
    {#if props.mode === "view"}
      <LineItemRow
        mode="view"
        {lineItem}
        canDelete={false}
        isRequired={false}
      />
    {:else}
      <LineItemRow
        mode={props.mode}
        {lineItem}
        canDelete={index !== 0}
        isRequired={index === 0}
        updateLineItem={props.updateLineItem}
        removeLineItem={props.removeLineItem}
      />
    {/if}
  {/each}
{/if}

<div class="invoice-line-item">
  <div class="col-span-1 sm:col-span-2">
    {#if isEditable && props.mode === "edit"}
      <Button variant="textOnly" onclick={props.addLineItem}>+ Line Item</Button
      >
    {/if}
  </div>
  <div class="text-monsoon py-5 text-right font-bold print:col-span-3">
    Subtotal
  </div>
  <div class="py-5 text-right font-mono">{subTotal}</div>
</div>

<div class="invoice-line-item">
  <p
    class="text-monsoon col-span-1 py-5 text-right font-bold sm:col-span-2 print:col-span-3"
  >
    Discount
  </p>
  <div class="relative">
    <input
      class="line-item focus:border-lavenderIndigo border-b-2 border-dashed border-b-stone-300 text-right block-10 inline-full not-print:pe-4 focus:border-solid focus:outline-none"
      type="number"
      name="discount"
      disabled={!isEditable}
      min="0"
      max="100"
      value={props.discount}
      oninput={isEditable ? onDiscountInput : undefined}
    />
    <span class="absolute inset-e-0 inset-bs-2 font-mono">%</span>
  </div>
  <div class="py-5 text-right font-mono">{centsToDollars(discountAmount)}</div>
</div>

<div class="invoice-line-item">
  <div class="col-span-3 sm:col-span-full print:col-span-full">
    <CircledAmount amount={total} label="Total." />
  </div>
</div>
