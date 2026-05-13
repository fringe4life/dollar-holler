<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { gridItem } from "styled-system/patterns";
  import type { FormEventHandler } from "svelte/elements";
  import type { LineItemRowsProps } from "$features/line-items/types";
  import CircledAmount from "$lib/components/CircledAmount.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { centsToDollars, sumLineItems } from "$lib/utils/moneyHelpers";
  import { invoiceLineItem } from "../styles";
  import { lineItemFieldRecipe } from "./LineItemRecipe";
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
    if (props.mode === "view") {
      return;
    }
    props.setDiscount(Number(e.currentTarget.value));
  };

  const lineItemHeaders = css({
    color: "daisyBush",
    display: { base: "none", sm: "block", _print: "block" },
  });

  const discountStyles = lineItemFieldRecipe({
    inputType: "number",
    align: "right",
  });
</script>
<div
  class={cx(invoiceLineItem, css({ 
    borderColor: "daisyBush", 
    borderBottomWidth: 2, 
    paddingBlockEnd: 2 }))}
>
  <div class={lineItemHeaders}>Description</div>
  <div class={cx(lineItemHeaders, css({ textAlign: "right" }))}>Unit price</div>
  <div class={cx(lineItemHeaders, css({ textAlign: "center" }))}>Qty</div>
  <div class={cx(lineItemHeaders, css({ textAlign: "right" }))}>Amount</div>
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

<div class={invoiceLineItem}>
  <div class={gridItem({ colSpan: { base: 1, sm: 2 } })}>
    {#if isEditable && props.mode === "edit"}
      <Button variant="textOnly" onclick={props.addLineItem}
        >+ Line Item</Button
      >
    {/if}
  </div>
  <div
    class={gridItem({ color: "monsoon", paddingBlock: 5, textAlign: "right", fontWeight: "bold", colSpan: { _print: 3 } })}
  >
    Subtotal
  </div>
  <div
    class={gridItem({ paddingBlock: 5, textAlign: "right", fontFamily: "mono" })}
  >
    {subTotal}
  </div>
</div>

<div class={invoiceLineItem}>
  <p
    class={gridItem({ color: "monsoon", paddingBlock: 5, textAlign: "right", fontWeight: "bold", colSpan: { base: 1, sm: 2 , _print: 3 } })}
  >
    Discount
  </p>
  <div class={gridItem({ position: "relative" })}>
    <input
      class={cx(discountStyles.input, css({ paddingInlineEnd: 3 }))}
      type="number"
      name="discount"
      disabled={!isEditable}
      min="0"
      max="100"
      value={props.discount}
      oninput={isEditable ? onDiscountInput : undefined}
    >
    <span
      class={css({ position: "absolute", insetInlineEnd: 0, insetBlockStart: 2, fontFamily: "mono" })}
      >%</span
    >
  </div>
  <div
    class={gridItem({ paddingBlock: 5, textAlign: "right", fontFamily: "mono" })}
  >
    {centsToDollars(discountAmount)}
  </div>
</div>

<div class={invoiceLineItem}>
  <div
    class={gridItem({ 
      gridColumn: { base: "span 3", sm: "1 / -1", _print: "1 / -1" } 
    })}
  >
    <CircledAmount amount={total} label="Total." />
  </div>
</div>
