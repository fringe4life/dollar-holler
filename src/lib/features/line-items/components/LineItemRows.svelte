<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import { gridItem } from "#styled-system/patterns/index.js";
  import type { FormEventHandler } from "svelte/elements";
  import type { LineItemRowsProps } from "#features/line-items/types.ts";
  import CircledAmount from "#lib/components/primitives/CircledAmount.svelte";
  import Button from "#lib/components/primitives/button/button.svelte";
  import { centsToDollars, sumLineItems } from "#lib/utils/moneyHelpers.ts";
  import {
    invoiceLineItem,
    invoiceLineItemDiscount,
    invoiceLineItemSubtotal,
  } from "../styles";
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
    color: "foreground",
    display: { _print: "block", base: "none", sm: "block" },
  });

  const discountStyles = lineItemFieldRecipe({
    align: "right",
    inputType: "number",
  });
</script>

<div
  class={cx(
    invoiceLineItem,
    css({
      borderColor: "inverse",
      borderBottomWidth: 2,
      paddingBlockEnd: 2,
    })
  )}
>
  <div class={cx(lineItemHeaders, gridItem({ gridArea: "description" }))}>
    Description
  </div>
  <div
    class={cx(
      lineItemHeaders,
      gridItem({ gridArea: "unitPrice" }),
      css({ textAlign: "right" })
    )}
  >
    Unit price
  </div>
  <div
    class={cx(
      lineItemHeaders,
      gridItem({ gridArea: "quantity" }),
      css({ textAlign: "center" })
    )}
  >
    Qty
  </div>
  <div
    class={cx(
      lineItemHeaders,
      gridItem({ gridArea: "amount" }),
      css({ textAlign: "right" })
    )}
  >
    Amount
  </div>
</div>

{#if props.lineItems}
  {#each props.lineItems as lineItem, index (lineItem.id)}
    {#if props.mode === "view"}
      <LineItemRow
        canDelete={false}
        isRequired={false}
        {lineItem}
        mode="view"
      />
    {:else}
      <LineItemRow
        canDelete={index !== 0}
        fieldAttrs={props.lineItemFieldAttrs(index)}
        isRequired={index === 0}
        {lineItem}
        mode={props.mode}
        removeLineItem={props.removeLineItem}
        updateLineItem={props.updateLineItem}
      />
    {/if}
  {/each}
{/if}

<div class={invoiceLineItemSubtotal}>
  <div
    class={gridItem({ display: { _print: "none" }, gridArea: "addLineItem" })}
  >
    {#if props.mode !== "view"}
      <Button onclick={props.addLineItem} variant="textOnly">+ Line Item</Button
      >
    {/if}
  </div>
  <div
    class={gridItem({
      color: "textMuted",
      fontWeight: "bold",
      gridArea: "subtotal",
      paddingBlock: 5,
      textAlign: "right",
    })}
  >
    Subtotal
  </div>
  <div
    class={gridItem({
      gridArea: "amount",
      paddingBlock: 5,
      textAlign: "right",
      fontFamily: "mono",
    })}
  >
    {subTotal}
  </div>
</div>

<div class={invoiceLineItemDiscount}>
  <p
    class={gridItem({
      color: "textMuted",
      fontWeight: "bold",
      gridArea: "discountLabel",
      paddingBlock: 5,
      textAlign: "right",
    })}
  >
    Discount
  </p>
  <div class={gridItem({ gridArea: "discountInput", position: "relative" })}>
    <input
      class={cx(discountStyles.input, css({ paddingInlineEnd: 3 }))}
      disabled={!isEditable}
      max="100"
      min="0"
      oninput={props.mode === "view" ? undefined : onDiscountInput}
      {...props.mode === "view"
        ? { name: "discount", type: "number", value: props.discount }
        : props.discountAttrs}
    />
    <span
      class={css({
        position: "absolute",
        insetInlineEnd: 0,
        insetBlockStart: 2,
        fontFamily: "mono",
      })}>%</span
    >
  </div>
  <div
    class={gridItem({
      gridArea: "amount",
      paddingBlock: 5,
      textAlign: "right",
      fontFamily: "mono",
    })}
  >
    {centsToDollars(discountAmount)}
  </div>
</div>

<div class={invoiceLineItem}>
  <div
    class={gridItem({
      gridColumn: { base: "span 3", sm: "1 / -1", _print: "1 / -1" },
    })}
  >
    <CircledAmount amount={total} label="Total." />
  </div>
</div>
